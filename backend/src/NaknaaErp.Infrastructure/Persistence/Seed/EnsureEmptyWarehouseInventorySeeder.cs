using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class EnsureEmptyWarehouseInventorySeeder
{
    public static async Task ClearAllInventoryAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var totalQuantity = await context.InventoryRecords.SumAsync(x => x.Quantity);
        var transactionCount = await context.InventoryTransactions.CountAsync();

        if (totalQuantity == 0 && transactionCount == 0)
        {
            logger.LogInformation("Warehouse inventory is already empty.");
            return;
        }

        context.InventoryTransactions.RemoveRange(context.InventoryTransactions);
        await context.InventoryRecords.ExecuteUpdateAsync(setters => setters.SetProperty(x => x.Quantity, 0));

        logger.LogInformation(
            "Cleared warehouse inventory: removed {TransactionCount} transaction(s) and zeroed {RecordCount} stock record(s).",
            transactionCount,
            await context.InventoryRecords.CountAsync());
    }
}
