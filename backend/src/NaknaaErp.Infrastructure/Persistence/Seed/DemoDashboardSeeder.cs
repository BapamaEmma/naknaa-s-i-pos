using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class DemoDashboardSeeder
{
    /// <summary>
    /// Removes legacy demo sales (SAL-/RCP- prefixes) so sales stats only reflect real POS transactions.
    /// </summary>
    public static async Task RemoveLegacyDemoSalesAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var demoSales = await context.Sales
            .Where(x => x.SaleNumber.StartsWith("SAL-") || x.ReceiptNumber.StartsWith("RCP-"))
            .ToListAsync();

        if (demoSales.Count == 0)
        {
            return;
        }

        context.Sales.RemoveRange(demoSales);
        await context.SaveChangesAsync();
        logger.LogInformation("Removed {Count} legacy demo sales from the database.", demoSales.Count);
    }
}
