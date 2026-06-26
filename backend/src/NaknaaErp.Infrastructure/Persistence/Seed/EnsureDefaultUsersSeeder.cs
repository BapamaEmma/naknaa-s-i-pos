using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class EnsureDefaultUsersSeeder
{
    private const string DemoPassword = "password";

    private static readonly Guid StorekeeperRoleId = Guid.Parse("11111111-1111-1111-1111-111111111102");
    private static readonly Guid AccraBranchId = Guid.Parse("22222222-2222-2222-2222-222222222201");

    private static readonly (Guid Id, string FirstName, string LastName, string Username, string Email)[] DefaultCashiers =
    [
        (
            Guid.Parse("33333333-3333-3333-3333-333333333302"),
            "Accra",
            "Cashier",
            "cashier.accra",
            "cashier.accra@naknaa.com"
        ),
        (
            Guid.Parse("33333333-3333-3333-3333-333333333303"),
            "Kumasi",
            "Cashier",
            "cashier.kumasi",
            "cashier.kumasi@naknaa.com"
        ),
    ];

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var cashierRole = await context.Roles
            .FirstOrDefaultAsync(x => x.Id == StorekeeperRoleId || x.Name == "Storekeeper" || x.Name == "Cashier");

        if (cashierRole is null)
        {
            logger.LogWarning("Skipping default cashier seed: cashier/storekeeper role not found.");
            return;
        }

        await EnsureCashierPermissionsAsync(context, cashierRole.Id);

        var created = 0;
        var updated = 0;
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(DemoPassword);

        foreach (var cashier in DefaultCashiers)
        {
            var existing = await context.Users
                .FirstOrDefaultAsync(x =>
                    x.Id == cashier.Id || x.Email == cashier.Email || x.Username == cashier.Username);

            if (existing is null)
            {
                context.Users.Add(new User
                {
                    Id = cashier.Id,
                    FirstName = cashier.FirstName,
                    LastName = cashier.LastName,
                    Username = cashier.Username,
                    Email = cashier.Email,
                    PhoneNumber = "+233 20 000 0000",
                    PasswordHash = passwordHash,
                    RoleId = cashierRole.Id,
                    BranchId = AccraBranchId,
                    IsActive = true,
                });
                created++;
                continue;
            }

            var needsUpdate = false;

            if (!existing.IsActive)
            {
                existing.IsActive = true;
                needsUpdate = true;
            }

            if (existing.RoleId != cashierRole.Id)
            {
                existing.RoleId = cashierRole.Id;
                needsUpdate = true;
            }

            if (existing.BranchId != AccraBranchId)
            {
                existing.BranchId = AccraBranchId;
                needsUpdate = true;
            }

            if (!BCrypt.Net.BCrypt.Verify(DemoPassword, existing.PasswordHash))
            {
                existing.PasswordHash = passwordHash;
                needsUpdate = true;
            }

            if (needsUpdate)
            {
                updated++;
            }
        }

        if (created == 0 && updated == 0)
        {
            return;
        }

        await context.SaveChangesAsync();
        logger.LogInformation(
            "Default cashier accounts synced (created: {Created}, updated: {Updated}).",
            created,
            updated);
    }

    private static async Task EnsureCashierPermissionsAsync(ApplicationDbContext context, Guid roleId)
    {
        var requiredCodes = new[] { "products.view", "sales.view", "sales.manage", "inventory.view" };
        var permissions = await context.Permissions
            .Where(x => requiredCodes.Contains(x.Code))
            .ToListAsync();

        var existingPermissionIds = await context.RolePermissions
            .Where(x => x.RoleId == roleId)
            .Select(x => x.PermissionId)
            .ToListAsync();

        var added = false;

        foreach (var permission in permissions)
        {
            if (existingPermissionIds.Contains(permission.Id))
            {
                continue;
            }

            context.RolePermissions.Add(new RolePermission
            {
                RoleId = roleId,
                PermissionId = permission.Id,
            });
            added = true;
        }

        if (added)
        {
            await context.SaveChangesAsync();
        }
    }
}
