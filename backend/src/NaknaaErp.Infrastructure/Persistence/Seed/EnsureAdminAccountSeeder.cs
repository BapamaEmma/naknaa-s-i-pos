using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class EnsureAdminAccountSeeder
{
    private const string DemoPassword = "password";
    private static readonly Guid AdminUserId = Guid.Parse("33333333-3333-3333-3333-333333333301");
    private static readonly Guid AdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111101");

    public static async Task RepairAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var admin = await context.Users.FirstOrDefaultAsync(x => x.Id == AdminUserId);
        if (admin is null)
        {
            logger.LogWarning("Default admin account not found; skipping repair.");
            return;
        }

        var changed = false;

        if (!admin.IsActive)
        {
            admin.IsActive = true;
            changed = true;
        }

        if (string.IsNullOrWhiteSpace(admin.Email))
        {
            admin.Email = "admin@naknaa.com";
            changed = true;
        }

        if (string.IsNullOrWhiteSpace(admin.Username))
        {
            admin.Username = "admin";
            changed = true;
        }

        if (admin.RoleId != AdminRoleId)
        {
            admin.RoleId = AdminRoleId;
            changed = true;
        }

        if (!BCrypt.Net.BCrypt.Verify(DemoPassword, admin.PasswordHash))
        {
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoPassword);
            changed = true;
            logger.LogWarning("Reset default admin password to development default.");
        }

        if (!changed)
        {
            logger.LogInformation("Default admin account is healthy.");
            return;
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Repaired default admin account.");
    }

    public static async Task ResetPasswordAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var admin = await context.Users.FirstOrDefaultAsync(x => x.Id == AdminUserId);
        if (admin is null)
        {
            logger.LogWarning("Default admin account not found; skipping password reset.");
            return;
        }

        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoPassword);
        admin.IsActive = true;

        if (string.IsNullOrWhiteSpace(admin.Email))
        {
            admin.Email = "admin@naknaa.com";
        }

        if (string.IsNullOrWhiteSpace(admin.Username))
        {
            admin.Username = "admin";
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Reset default admin password to development default.");
    }
}
