using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.DTOs.ProductVariants;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class ProductVariantService : IProductVariantService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public ProductVariantService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProductVariantDto>> GetByProductIdAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);

        var variants = await _context.ProductVariants
            .AsNoTracking()
            .Where(x => x.ProductId == productId && x.IsActive)
            .OrderBy(x => x.VariantName)
            .ToListAsync(cancellationToken);

        return await MapVariantsAsync(variants, cancellationToken);
    }

    public async Task<ProductVariantDto> GetByIdAsync(
        Guid productId,
        Guid variantId,
        CancellationToken cancellationToken = default)
    {
        var variant = await GetVariantOrThrowAsync(productId, variantId, cancellationToken);
        var stock = await GetStockAsync(variantId, cancellationToken);
        return MapVariant(variant, stock);
    }

    public async Task<ProductVariantDto> CreateAsync(
        Guid productId,
        CreateProductVariantRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureProductExistsAsync(productId, cancellationToken);

        var variant = new ProductVariant
        {
            ProductId = productId,
            VariantName = request.VariantName,
            VariantValue = request.VariantValue,
            CostPrice = request.CostPrice,
            SellingPrice = request.SellingPrice,
            ReorderLevel = request.ReorderLevel,
            IsActive = request.IsActive
        };

        await _unitOfWork.ProductVariants.AddAsync(variant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (request.InitialStock > 0)
        {
            var warehouse = await _context.Warehouses
                .AsNoTracking()
                .Where(x => x.Status == EntityStatus.Active)
                .OrderBy(x => x.WarehouseName)
                .FirstOrDefaultAsync(cancellationToken)
                ?? throw new ValidationException("No active warehouse found to receive initial stock.");

            await InventoryManager.ApplyStockChangeAsync(
                _context,
                variant.Id,
                warehouse.Id,
                string.Empty,
                string.Empty,
                string.Empty,
                request.InitialStock,
                InventoryTransactionType.StockIn,
                null,
                "Initial stock on variant creation",
                null,
                null,
                variant.ReorderLevel,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var stock = await GetStockAsync(variant.Id, cancellationToken);
        return MapVariant(variant, stock);
    }

    public async Task<ProductVariantDto> UpdateAsync(
        Guid productId,
        Guid variantId,
        UpdateProductVariantRequest request,
        CancellationToken cancellationToken = default)
    {
        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(x => x.ProductId == productId && x.Id == variantId, cancellationToken)
            ?? throw new NotFoundException("ProductVariant", variantId);

        variant.VariantName = request.VariantName;
        variant.VariantValue = request.VariantValue;
        variant.CostPrice = request.CostPrice;
        variant.SellingPrice = request.SellingPrice;
        variant.ReorderLevel = request.ReorderLevel;
        variant.IsActive = request.IsActive;

        _unitOfWork.ProductVariants.Update(variant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var stock = await GetStockAsync(variantId, cancellationToken);
        return MapVariant(variant, stock);
    }

    public async Task DeleteAsync(
        Guid productId,
        Guid variantId,
        CancellationToken cancellationToken = default)
    {
        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(x => x.ProductId == productId && x.Id == variantId, cancellationToken)
            ?? throw new NotFoundException("ProductVariant", variantId);

        variant.IsActive = false;
        _unitOfWork.ProductVariants.Update(variant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureProductExistsAsync(Guid productId, CancellationToken cancellationToken)
    {
        _ = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken)
            ?? throw new NotFoundException("Product", productId);
    }

    private async Task<ProductVariant> GetVariantOrThrowAsync(
        Guid productId,
        Guid variantId,
        CancellationToken cancellationToken)
    {
        return await _context.ProductVariants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductId == productId && x.Id == variantId, cancellationToken)
            ?? throw new NotFoundException("ProductVariant", variantId);
    }

    private async Task<IReadOnlyList<ProductVariantDto>> MapVariantsAsync(
        IReadOnlyList<ProductVariant> variants,
        CancellationToken cancellationToken)
    {
        if (variants.Count == 0)
        {
            return [];
        }

        var variantIds = variants.Select(x => x.Id).ToList();
        var stockByVariant = await _context.InventoryRecords
            .AsNoTracking()
            .Where(x => variantIds.Contains(x.ProductVariantId))
            .GroupBy(x => x.ProductVariantId)
            .Select(g => new { VariantId = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .ToDictionaryAsync(x => x.VariantId, x => x.Quantity, cancellationToken);

        return variants
            .Select(v => MapVariant(v, stockByVariant.GetValueOrDefault(v.Id)))
            .ToList();
    }

    private async Task<int> GetStockAsync(Guid variantId, CancellationToken cancellationToken) =>
        await _context.InventoryRecords
            .AsNoTracking()
            .Where(x => x.ProductVariantId == variantId)
            .SumAsync(x => x.Quantity, cancellationToken);

    private static ProductVariantDto MapVariant(ProductVariant variant, int stock) =>
        new()
        {
            Id = variant.Id,
            ProductId = variant.ProductId,
            VariantName = variant.VariantName,
            VariantValue = variant.VariantValue,
            CostPrice = variant.CostPrice,
            SellingPrice = variant.SellingPrice,
            ReorderLevel = variant.ReorderLevel,
            CurrentStock = stock,
            IsActive = variant.IsActive,
            CreatedAt = variant.CreatedAt,
            UpdatedAt = variant.UpdatedAt
        };
}
