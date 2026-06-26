using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class ResetCatalogSeeder
{
    private static readonly string[] CounterKeys = ["product", "sale", "receipt", "purchase"];

    public static async Task ClearAllProductsAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var productCount = await context.Products.CountAsync();
        if (productCount == 0)
        {
            logger.LogInformation("Catalog is already empty.");
            await ResetCountersAsync(context, logger, cancellationToken: default);
            return;
        }

        var salesRemoved = await context.Sales.ExecuteDeleteAsync();
        var purchasesRemoved = await context.Purchases.ExecuteDeleteAsync();
        var purchaseOrdersRemoved = await context.PurchaseOrders.ExecuteDeleteAsync();
        var inventoryTransactionsRemoved = await context.InventoryTransactions.ExecuteDeleteAsync();
        var inventoryRecordsRemoved = await context.InventoryRecords.ExecuteDeleteAsync();
        var variantsRemoved = await context.ProductVariants.ExecuteDeleteAsync();
        var productsRemoved = await context.Products.ExecuteDeleteAsync();

        await ResetCountersAsync(context, logger, cancellationToken: default);

        logger.LogInformation(
            "Catalog reset complete: removed {Products} product(s), {Variants} variant(s), {InventoryRecords} inventory record(s), {InventoryTransactions} inventory transaction(s), {Sales} sale(s), {Purchases} purchase(s), and {PurchaseOrders} purchase order(s).",
            productsRemoved,
            variantsRemoved,
            inventoryRecordsRemoved,
            inventoryTransactionsRemoved,
            salesRemoved,
            purchasesRemoved,
            purchaseOrdersRemoved);
    }

    private static async Task ResetCountersAsync(
        ApplicationDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var counters = await context.AppSettings
            .Where(x => x.Category == "Counters" && CounterKeys.Contains(x.Key))
            .ToListAsync(cancellationToken);

        foreach (var counter in counters)
        {
            counter.Value = "0";
        }

        if (counters.Count > 0)
        {
            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Reset product and sales counters.");
        }
    }
}
