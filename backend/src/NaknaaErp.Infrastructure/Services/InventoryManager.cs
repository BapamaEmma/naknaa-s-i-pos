using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

internal static class InventoryManager
{
    public static async Task<InventoryRecord> GetOrCreateRecordAsync(
        ApplicationDbContext context,
        Guid productVariantId,
        Guid warehouseId,
        string section,
        string rack,
        string bin,
        int minimumStockLevel,
        CancellationToken cancellationToken)
    {
        var record = await context.InventoryRecords
            .FirstOrDefaultAsync(
                x => x.ProductVariantId == productVariantId &&
                     x.WarehouseId == warehouseId &&
                     x.Section == section &&
                     x.Rack == rack &&
                     x.Bin == bin,
                cancellationToken);

        if (record is not null)
        {
            return record;
        }

        record = new InventoryRecord
        {
            ProductVariantId = productVariantId,
            WarehouseId = warehouseId,
            Section = section,
            Rack = rack,
            Bin = bin,
            Quantity = 0,
            MinimumStockLevel = minimumStockLevel
        };

        context.InventoryRecords.Add(record);
        return record;
    }

    public static async Task<InventoryTransaction> ApplyStockChangeAsync(
        ApplicationDbContext context,
        Guid productVariantId,
        Guid warehouseId,
        string section,
        string rack,
        string bin,
        int quantityChange,
        InventoryTransactionType transactionType,
        string? referenceNumber,
        string? notes,
        Guid? branchId,
        Guid? userId,
        int minimumStockLevel,
        CancellationToken cancellationToken)
    {
        var record = await GetOrCreateRecordAsync(
            context,
            productVariantId,
            warehouseId,
            section,
            rack,
            bin,
            minimumStockLevel,
            cancellationToken);

        var before = record.Quantity;
        var after = before + quantityChange;

        if (after < 0)
        {
            throw new ValidationException("Insufficient stock for this operation.");
        }

        record.Quantity = after;

        var transaction = new InventoryTransaction
        {
            ProductVariantId = productVariantId,
            WarehouseId = warehouseId,
            TransactionType = transactionType,
            Quantity = Math.Abs(quantityChange),
            QuantityBefore = before,
            QuantityAfter = after,
            ReferenceNumber = referenceNumber,
            Notes = notes,
            BranchId = branchId,
            CreatedBy = userId
        };

        context.InventoryTransactions.Add(transaction);
        return transaction;
    }

    public static async Task DeductStockAsync(
        ApplicationDbContext context,
        Guid productVariantId,
        int quantity,
        InventoryTransactionType transactionType,
        string referenceNumber,
        Guid? branchId,
        Guid? userId,
        CancellationToken cancellationToken)
    {
        var records = await context.InventoryRecords
            .Where(x => x.ProductVariantId == productVariantId && x.Quantity > 0)
            .OrderByDescending(x => x.Quantity)
            .ToListAsync(cancellationToken);

        var remaining = quantity;
        foreach (var record in records)
        {
            if (remaining <= 0)
            {
                break;
            }

            var deduct = Math.Min(record.Quantity, remaining);
            var before = record.Quantity;
            record.Quantity -= deduct;
            remaining -= deduct;

            context.InventoryTransactions.Add(new InventoryTransaction
            {
                ProductVariantId = productVariantId,
                WarehouseId = record.WarehouseId,
                TransactionType = transactionType,
                Quantity = deduct,
                QuantityBefore = before,
                QuantityAfter = record.Quantity,
                ReferenceNumber = referenceNumber,
                BranchId = branchId,
                CreatedBy = userId
            });
        }

        if (remaining > 0)
        {
            throw new ValidationException("Insufficient stock to complete the sale.");
        }
    }

    public static string GetStockStatus(int quantity, int minimumStockLevel) =>
        quantity <= 0 ? "out_of_stock" :
        quantity <= minimumStockLevel ? "low_stock" : "in_stock";
}
