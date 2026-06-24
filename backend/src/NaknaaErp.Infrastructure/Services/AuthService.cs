using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.DTOs.Auth;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Identity;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly ICurrentUserService _currentUserService;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        ICurrentUserService currentUserService,
        Microsoft.Extensions.Options.IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _currentUserService = currentUserService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(x => x.Role)
            .Include(x => x.Branch)
            .FirstOrDefaultAsync(
                x => x.Email == request.Email || x.Username == request.Email,
                cancellationToken)
            ?? throw new UnauthorizedException("Invalid email or password.");

        if (!user.IsActive || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<TokenResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (await _context.Users.AnyAsync(
                x => x.Username == request.Username || x.Email == request.Email,
                cancellationToken))
        {
            throw new ValidationException("Username or email already exists.");
        }

        var role = await _unitOfWork.Roles.GetByIdAsync(request.RoleId, cancellationToken)
            ?? throw new NotFoundException("Role", request.RoleId);
        var branch = await _unitOfWork.Branches.GetByIdAsync(request.BranchId, cancellationToken)
            ?? throw new NotFoundException("Branch", request.BranchId);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Username = request.Username,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = role.Id,
            BranchId = branch.Id,
            Role = role,
            Branch = branch,
            IsActive = true
        };

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken)
            ?? throw new UnauthorizedException("Invalid access token.");

        var userIdClaim = principal.FindFirst("UserId")?.Value
            ?? principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedException("Invalid access token.");
        }

        var storedToken = await _context.RefreshTokens
            .Include(x => x.User).ThenInclude(x => x.Role)
            .Include(x => x.User).ThenInclude(x => x.Branch)
            .FirstOrDefaultAsync(x => x.Token == request.RefreshToken && x.UserId == userId, cancellationToken)
            ?? throw new UnauthorizedException("Invalid refresh token.");

        if (!storedToken.IsActive)
        {
            throw new UnauthorizedException("Refresh token is no longer active.");
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        var newRefreshToken = CreateRefreshToken(storedToken.UserId, storedToken.Token);
        _context.RefreshTokens.Update(storedToken);
        await _context.RefreshTokens.AddAsync(newRefreshToken, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var permissions = await GetUserPermissionsAsync(storedToken.User.RoleId, cancellationToken);
        var accessToken = _tokenService.GenerateAccessToken(storedToken.User, permissions);

        return BuildTokenResponse(storedToken.User, accessToken, newRefreshToken.Token, permissions);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == refreshToken, cancellationToken);

        if (storedToken is null || !storedToken.IsActive)
        {
            return;
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        _context.RefreshTokens.Update(storedToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        if (_currentUserService.UserId is null)
        {
            return;
        }

        var activeTokens = await _context.RefreshTokens
            .Where(x => x.UserId == _currentUserService.UserId && x.RevokedAt == null && x.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<TokenResponse> IssueTokensAsync(User user, CancellationToken cancellationToken)
    {
        var permissions = await GetUserPermissionsAsync(user.RoleId, cancellationToken);
        var accessToken = _tokenService.GenerateAccessToken(user, permissions);
        var refreshToken = CreateRefreshToken(user.Id, null);
        await _context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return BuildTokenResponse(user, accessToken, refreshToken.Token, permissions);
    }

    private RefreshToken CreateRefreshToken(Guid userId, string? replacedByToken) =>
        new()
        {
            UserId = userId,
            Token = _tokenService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            ReplacedByToken = replacedByToken
        };

    private async Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid roleId, CancellationToken cancellationToken) =>
        await _context.RolePermissions
            .Where(x => x.RoleId == roleId)
            .Include(x => x.Permission)
            .Select(x => x.Permission.Code)
            .ToListAsync(cancellationToken);

    private TokenResponse BuildTokenResponse(
        User user,
        string accessToken,
        string refreshToken,
        IReadOnlyList<string> permissions) =>
        new()
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            User = new AuthUserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Username = user.Username,
                Email = user.Email,
                RoleName = user.Role.Name,
                BranchId = user.BranchId,
                BranchName = user.Branch.BranchName,
                Permissions = permissions
            }
        };
}
