using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using NaknaaErp.Application.Interfaces.Services;

namespace NaknaaErp.Infrastructure.Identity;

public static class SupabaseJwtBearerEvents
{
    public static JwtBearerEvents Create() =>
        new()
        {
            OnTokenValidated = async context =>
            {
                var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();
                var supabaseUserId = context.Principal?.FindFirstValue("sub");
                var email = context.Principal?.FindFirstValue(ClaimTypes.Email)
                    ?? context.Principal?.FindFirstValue("email");

                if (string.IsNullOrWhiteSpace(supabaseUserId))
                {
                    context.Fail("Supabase user id is missing from the access token.");
                    return;
                }

                var profile = await authService.LinkSupabaseUserAndGetProfileAsync(
                    supabaseUserId,
                    email,
                    context.HttpContext.RequestAborted);

                if (profile is null)
                {
                    context.Fail("This Supabase account is not linked to a NakNaa ERP user.");
                    return;
                }

                if (context.Principal?.Identity is not ClaimsIdentity identity)
                {
                    context.Fail("Unable to enrich authenticated user.");
                    return;
                }

                foreach (var claim in identity.FindAll("UserId").ToList())
                {
                    identity.RemoveClaim(claim);
                }

                identity.AddClaim(new Claim("UserId", profile.Id.ToString()));
                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, profile.Id.ToString()));
                identity.AddClaim(new Claim("Username", profile.Username));
                identity.AddClaim(new Claim(ClaimTypes.Name, profile.Username));
                identity.AddClaim(new Claim(ClaimTypes.Email, profile.Email));
                identity.AddClaim(new Claim(ClaimTypes.Role, profile.RoleName));
                identity.AddClaim(new Claim("BranchId", profile.BranchId.ToString()));

                foreach (var permission in profile.Permissions)
                {
                    identity.AddClaim(new Claim("permission", permission));
                }
            },
        };
}
