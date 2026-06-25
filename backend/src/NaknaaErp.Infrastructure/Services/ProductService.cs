using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.ProductVariants;
using NaknaaErp.Application.DTOs.Products;
using NaknaaErp.Application.DTOs.Sales;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Common;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ProductListItemDto>> GetAllAsync(
        ProductListQuery query,
        CancellationToken cancellationToken = default)
    {
        var productsQuery = _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            productsQuery = productsQuery.Where(x =>
                x.ProductName.ToLower().Contains(search) ||
                x.ProductCode.ToLower().Contains(search) ||
                x.Brand.ToLower().Contains(search));
        }

        if (query.CategoryId.HasValue)
        {
            productsQuery = productsQuery.Where(x => x.CategoryId == query.CategoryId);
        }

        if (!string.IsNullOrWhiteSpace(query.Brand))
        {
            productsQuery = productsQuery.Where(x => x.Brand == query.Brand);
        }

        if (query.IsActive.HasValue)
        {
            productsQuery = productsQuery.Where(x => x.IsActive == query.IsActive);
        }

        var total = await productsQuery.CountAsync(cancellationToken);
        var items = await productsQuery
            .OrderBy(x => x.ProductName)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new ProductListItemDto
            {
                Id = x.Id,
                ProductCode = x.ProductCode,
                ProductName = x.ProductName,
                CategoryId = x.CategoryId,
                CategoryName = x.Category.Name,
                Brand = x.Brand,
                Model = x.Model,
                CostPrice = x.CostPrice,
                SellingPrice = x.SellingPrice > 0
                    ? x.SellingPrice
                    : x.Variants
                        .Where(v => v.IsActive)
                        .OrderBy(v => v.CreatedAt)
                        .Select(v => v.SellingPrice)
                        .FirstOrDefault(),
                ReorderLevel = x.ReorderLevel,
                ImageUrl = x.ImageUrl,
                IsActive = x.IsActive,
                VariantCount = x.Variants.Count,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<ProductDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Product", id);

        var variantIds = product.Variants.Select(x => x.Id).ToList();
        var stockByVariant = await _context.InventoryRecords
            .AsNoTracking()
            .Where(x => variantIds.Contains(x.ProductVariantId))
            .GroupBy(x => x.ProductVariantId)
            .Select(g => new { VariantId = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .ToDictionaryAsync(x => x.VariantId, x => x.Quantity, cancellationToken);

        var variants = product.Variants.Select(v => new ProductVariantDto
        {
            Id = v.Id,
            ProductId = v.ProductId,
            VariantName = v.VariantName,
            VariantValue = v.VariantValue,
            CostPrice = v.CostPrice,
            SellingPrice = v.SellingPrice,
            ReorderLevel = v.ReorderLevel,
            CurrentStock = stockByVariant.GetValueOrDefault(v.Id),
            IsActive = v.IsActive,
            CreatedAt = v.CreatedAt,
            UpdatedAt = v.UpdatedAt
        }).ToList();

        var totalStock = variants.Sum(x => x.CurrentStock);
        var inventoryValue = product.Variants.Sum(v =>
            stockByVariant.GetValueOrDefault(v.Id) * v.CostPrice);

        return new ProductDetailDto
        {
            Id = product.Id,
            ProductCode = product.ProductCode,
            ProductName = product.ProductName,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name,
            Brand = product.Brand,
            Model = product.Model,
            CostPrice = product.CostPrice,
            SellingPrice = product.SellingPrice > 0
                ? product.SellingPrice
                : variants.Where(v => v.IsActive).Select(v => v.SellingPrice).FirstOrDefault(),
            ReorderLevel = product.ReorderLevel,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            VariantCount = variants.Count,
            CreatedAt = product.CreatedAt,
            Variants = variants,
            InventorySummary = new InventorySummaryDto
            {
                TotalStock = totalStock,
                InventoryValue = inventoryValue,
                LowStockVariants = variants.Count(x => x.CurrentStock > 0 && x.CurrentStock <= x.ReorderLevel)
            }
        };
    }

    public async Task<ProductDetailDto> CreateAsync(
        CreateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        _ = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId, cancellationToken)
            ?? throw new NotFoundException("Category", request.CategoryId);

        var code = await SequenceGenerator.NextAsync(
            _context, "product", "PRD", "PRD-{sequence}", cancellationToken);

        var product = new Product
        {
            ProductCode = code,
            ProductName = request.ProductName,
            CategoryId = request.CategoryId,
            Brand = request.Brand,
            Model = request.Model,
            CostPrice = request.CostPrice,
            SellingPrice = request.SellingPrice,
            ReorderLevel = request.ReorderLevel,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive
        };

        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.ProductVariants.AddAsync(new ProductVariant
        {
            ProductId = product.Id,
            VariantName = "Standard",
            VariantValue = "Default",
            CostPrice = product.CostPrice,
            SellingPrice = product.SellingPrice > 0 ? product.SellingPrice : product.CostPrice,
            ReorderLevel = product.ReorderLevel,
            IsActive = product.IsActive,
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDetailDto> UpdateAsync(
        Guid id,
        UpdateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Product", id);

        product.ProductName = request.ProductName;
        product.CategoryId = request.CategoryId;
        product.Brand = request.Brand;
        product.Model = request.Model;
        product.CostPrice = request.CostPrice;
        product.SellingPrice = request.SellingPrice;
        product.ReorderLevel = request.ReorderLevel;
        product.ImageUrl = request.ImageUrl;
        product.IsActive = request.IsActive;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Product", id);

        product.IsActive = false;

        foreach (var variant in product.Variants.Where(x => x.IsActive))
        {
            variant.IsActive = false;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BrandOptionDto>> GetBrandsAsync(CancellationToken cancellationToken = default) =>
        await _context.Products
            .AsNoTracking()
            .Where(x => x.IsActive)
            .Select(x => x.Brand)
            .Distinct()
            .OrderBy(x => x)
            .Select(x => new BrandOptionDto { Value = x, Label = x })
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<PosProductResultDto>> GetPosCatalogAsync(
        string search,
        CancellationToken cancellationToken = default)
    {
        var normalizedSearch = search.Trim();

        IQueryable<ProductVariant> variantsQuery = _context.ProductVariants
            .AsNoTracking()
            .Include(x => x.Product)
            .Where(x => x.IsActive && x.Product.IsActive);

        if (!string.IsNullOrWhiteSpace(normalizedSearch))
        {
            var term = normalizedSearch.ToLower();
            variantsQuery = variantsQuery.Where(x =>
                x.Product.ProductName.ToLower().Contains(term) ||
                x.Product.ProductCode.ToLower().Contains(term) ||
                x.Product.Brand.ToLower().Contains(term) ||
                x.VariantName.ToLower().Contains(term));
        }

        var variants = await variantsQuery
            .OrderBy(x => x.Product.ProductName)
            .ThenBy(x => x.VariantName)
            .Take(string.IsNullOrWhiteSpace(normalizedSearch) ? 100 : 50)
            .ToListAsync(cancellationToken);

        if (variants.Count == 0)
        {
            return [];
        }

        var variantIds = variants.Select(x => x.Id).ToList();
        var stockByVariant = await _context.InventoryRecords
            .AsNoTracking()
            .Where(x => variantIds.Contains(x.ProductVariantId))
            .GroupBy(x => x.ProductVariantId)
            .Select(group => new { VariantId = group.Key, Quantity = group.Sum(x => x.Quantity) })
            .ToDictionaryAsync(x => x.VariantId, x => x.Quantity, cancellationToken);

        return variants.Select(variant => new PosProductResultDto
        {
            ProductId = variant.ProductId,
            ProductVariantId = variant.Id,
            ProductName = variant.Product.ProductName,
            Brand = variant.Product.Brand,
            ImageUrl = variant.Product.ImageUrl,
            SellingPrice = variant.SellingPrice > 0
                ? variant.SellingPrice
                : variant.Product.SellingPrice,
            AvailableStock = stockByVariant.GetValueOrDefault(variant.Id),
        }).ToList();
    }
}
