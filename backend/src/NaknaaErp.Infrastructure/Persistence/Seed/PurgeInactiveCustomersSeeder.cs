using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NaknaaErp.Domain.Enums;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class PurgeInactiveCustomersSeeder
{
    public static async Task PurgeWithoutPurchaseHistoryAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var inactiveCustomerIds = await context.Customers
            .Where(customer => !customer.IsActive)
            .Select(customer => customer.Id)
            .ToListAsync();

        if (inactiveCustomerIds.Count == 0)
        {
            logger.LogInformation("No inactive customers to purge.");
            return;
        }

        var idsWithSales = await context.Sales
            .Where(sale =>
                sale.CustomerId.HasValue
                && inactiveCustomerIds.Contains(sale.CustomerId.Value)
                && sale.Status == SaleStatus.Completed)
            .Select(sale => sale.CustomerId!.Value)
            .Distinct()
            .ToListAsync();

        var removableIds = inactiveCustomerIds.Except(idsWithSales).ToList();
        if (removableIds.Count == 0)
        {
            logger.LogInformation("No inactive customers without purchase history to purge.");
            return;
        }

        var removed = await context.Customers
            .Where(customer => removableIds.Contains(customer.Id))
            .ExecuteDeleteAsync();

        logger.LogInformation("Purged {Count} inactive customer(s) without purchase history.", removed);
    }
}
