using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Suppliers;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Common;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class SupplierService : ISupplierService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public SupplierService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<SupplierListItemDto>> GetAllAsync(
        SupplierListQuery query,
        CancellationToken cancellationToken = default)
    {
        var suppliersQuery = _context.Suppliers.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            suppliersQuery = suppliersQuery.Where(x =>
                x.SupplierName.ToLower().Contains(search) ||
                x.SupplierCode.ToLower().Contains(search));
        }

        if (query.IsActive.HasValue)
        {
            suppliersQuery = suppliersQuery.Where(x => x.IsActive == query.IsActive);
        }

        var total = await suppliersQuery.CountAsync(cancellationToken);
        var suppliers = await suppliersQuery
            .OrderBy(x => x.SupplierName)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var items = new List<SupplierListItemDto>();
        foreach (var supplier in suppliers)
        {
            var purchases = await _context.Purchases.AsNoTracking()
                .Include(x => x.Items)
                .Where(x => x.SupplierId == supplier.Id && x.Status != PurchaseStatus.Cancelled)
                .ToListAsync(cancellationToken);

            items.Add(new SupplierListItemDto
            {
                Id = supplier.Id,
                SupplierCode = supplier.SupplierCode,
                SupplierName = supplier.SupplierName,
                ContactPerson = supplier.ContactPerson,
                Email = supplier.Email,
                PhoneNumber = supplier.PhoneNumber,
                ProductCount = purchases.SelectMany(p => p.Items).Count(),
                TotalPurchaseValue = purchases.Sum(x => x.TotalAmount),
                LastSupplyDate = purchases.OrderByDescending(x => x.PurchaseDate).FirstOrDefault()?.PurchaseDate,
                IsActive = supplier.IsActive
            });
        }

        return new PagedResult<SupplierListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<SupplierDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var supplier = await _context.Suppliers.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Supplier", id);

        var purchases = await _context.Purchases
            .AsNoTracking()
            .Include(x => x.Items)
            .Where(x => x.SupplierId == id && x.Status != PurchaseStatus.Cancelled)
            .ToListAsync(cancellationToken);

        return new SupplierDetailDto
        {
            Id = supplier.Id,
            SupplierCode = supplier.SupplierCode,
            SupplierName = supplier.SupplierName,
            ContactPerson = supplier.ContactPerson,
            PhoneNumber = supplier.PhoneNumber,
            Email = supplier.Email,
            Address = supplier.Address,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt,
            Stats = new SupplierStatisticsDto
            {
                TotalProductsSupplied = purchases.SelectMany(x => x.Items).Select(x => x.ProductVariantId).Distinct().Count(),
                TotalQuantitySupplied = purchases.SelectMany(x => x.Items).Sum(x => x.ReceivedQuantity),
                TotalPurchaseValue = purchases.Sum(x => x.TotalAmount),
                LastSupplyDate = purchases.OrderByDescending(x => x.PurchaseDate).FirstOrDefault()?.PurchaseDate
            }
        };
    }

    public async Task<SupplierDetailDto> CreateAsync(
        CreateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = await SequenceGenerator.NextAsync(
            _context, "supplier", "SUP", "SUP-{sequence}", cancellationToken);

        var supplier = new Supplier
        {
            SupplierCode = code,
            SupplierName = request.SupplierName,
            ContactPerson = request.ContactPerson,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            Address = request.Address,
            IsActive = request.IsActive
        };

        await _unitOfWork.Suppliers.AddAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(supplier.Id, cancellationToken);
    }

    public async Task<SupplierDetailDto> UpdateAsync(
        Guid id,
        UpdateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        var supplier = await _context.Suppliers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Supplier", id);

        supplier.SupplierName = request.SupplierName;
        supplier.ContactPerson = request.ContactPerson;
        supplier.PhoneNumber = request.PhoneNumber;
        supplier.Email = request.Email;
        supplier.Address = request.Address;
        supplier.IsActive = request.IsActive;

        _unitOfWork.Suppliers.Update(supplier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Supplier", id);
        supplier.IsActive = false;
        _unitOfWork.Suppliers.Update(supplier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SupplierOptionDto>> GetOptionsAsync(CancellationToken cancellationToken = default) =>
        await _context.Suppliers
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SupplierName)
            .Select(x => new SupplierOptionDto { Id = x.Id, Name = x.SupplierName })
            .ToListAsync(cancellationToken);
}
