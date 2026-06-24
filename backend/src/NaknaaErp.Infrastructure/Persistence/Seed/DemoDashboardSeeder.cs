using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class DemoDashboardSeeder
{
    private static readonly Guid AccraBranchId = Guid.Parse("22222222-2222-2222-2222-222222222201");
    private static readonly Guid AdminUserId = Guid.Parse("33333333-3333-3333-3333-333333333301");

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        if (await context.Sales.AnyAsync(x => x.Status == SaleStatus.Completed))
        {
            return;
        }

        var user = await context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.IsActive)
            ?? await context.Users.AsNoTracking().FirstOrDefaultAsync();

        if (user is null)
        {
            logger.LogWarning("Skipping demo dashboard seed: no users found.");
            return;
        }

        var branchId = user.BranchId != Guid.Empty ? user.BranchId : AccraBranchId;

        var variants = await context.ProductVariants
            .AsNoTracking()
            .Include(x => x.Product)
            .Where(x => x.IsActive && x.Product.IsActive)
            .OrderBy(x => x.CreatedAt)
            .Take(6)
            .ToListAsync();

        if (variants.Count == 0)
        {
            logger.LogWarning("Skipping demo dashboard seed: no active product variants found.");
            return;
        }

        logger.LogInformation("Seeding demo sales data for dashboard...");

        var random = new Random(42);
        var now = DateTime.UtcNow;
        var saleNumber = await context.Sales.CountAsync() + 1;

        for (var monthOffset = 5; monthOffset >= 0; monthOffset--)
        {
            var salesThisMonth = random.Next(3, 8);

            for (var i = 0; i < salesThisMonth; i++)
            {
                var variant = variants[random.Next(variants.Count)];
                var quantity = random.Next(1, 3);
                var unitPrice = variant.SellingPrice > 0 ? variant.SellingPrice : 1500m;
                var total = unitPrice * quantity;
                var day = random.Next(1, 28);
                var saleDate = new DateTime(now.Year, now.Month, 1, random.Next(9, 18), random.Next(0, 59), 0, DateTimeKind.Utc)
                    .AddMonths(-monthOffset)
                    .AddDays(day - 1);

                if (saleDate > now)
                {
                    saleDate = now.Date.AddHours(random.Next(9, 18));
                }

                var sale = new Sale
                {
                    SaleNumber = $"SAL-{saleNumber:D6}",
                    ReceiptNumber = $"RCP-{saleNumber:D6}",
                    UserId = user.Id,
                    BranchId = branchId,
                    PaymentMethod = random.Next(2) == 0 ? PaymentMethod.Cash : PaymentMethod.MobileMoney,
                    Subtotal = total,
                    Discount = 0,
                    TotalAmount = total,
                    Status = SaleStatus.Completed,
                    SaleDate = saleDate,
                    CustomerName = random.Next(2) == 0 ? "Walk-in Customer" : $"Customer {saleNumber}",
                };

                sale.Items.Add(new SaleItem
                {
                    ProductVariantId = variant.Id,
                    ProductName = variant.Product.ProductName,
                    VariantName = variant.VariantName,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    TotalPrice = total,
                });

                context.Sales.Add(sale);
                saleNumber++;
            }
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Demo sales seeding completed ({Count} sales).", saleNumber - 1);
    }
}
