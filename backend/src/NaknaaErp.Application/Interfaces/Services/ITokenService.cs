using System.Security.Claims;
using NaknaaErp.Domain.Entities;

namespace NaknaaErp.Application.Interfaces.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user, IEnumerable<string> permissions);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
