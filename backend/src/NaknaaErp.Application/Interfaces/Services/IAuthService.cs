using NaknaaErp.Application.DTOs.Auth;

namespace NaknaaErp.Application.Interfaces.Services;

public interface IAuthService
{
    Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<TokenResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task LogoutAsync(CancellationToken cancellationToken = default);
    Task<string> ResolveLoginEmailAsync(string identifier, CancellationToken cancellationToken = default);
    Task<AuthUserDto?> LinkSupabaseUserAndGetProfileAsync(
        string supabaseUserId,
        string? email,
        CancellationToken cancellationToken = default);
    Task<AuthUserDto> GetCurrentUserProfileAsync(CancellationToken cancellationToken = default);
}
