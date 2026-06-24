using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Customers;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Common;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public CustomerService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<CustomerListItemDto>> GetAllAsync(
        CustomerListQuery query,
        CancellationToken cancellationToken = default)
    {
        var customersQuery = _context.Customers.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            customersQuery = customersQuery.Where(x =>
                x.CustomerName.ToLower().Contains(search) ||
                x.CustomerCode.ToLower().Contains(search) ||
                (x.PhoneNumber != null && x.PhoneNumber.Contains(search)));
        }

        if (query.IsActive.HasValue)
        {
            customersQuery = customersQuery.Where(x => x.IsActive == query.IsActive);
        }

        var total = await customersQuery.CountAsync(cancellationToken);
        var customers = await customersQuery
            .OrderBy(x => x.CustomerName)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var items = new List<CustomerListItemDto>();
        foreach (var customer in customers)
        {
            var sales = await GetCompletedSalesAsync(customer.Id, cancellationToken);
            items.Add(new CustomerListItemDto
            {
                Id = customer.Id,
                CustomerCode = customer.CustomerCode,
                CustomerName = customer.CustomerName,
                PhoneNumber = customer.PhoneNumber,
                Address = customer.Address,
                IsActive = customer.IsActive,
                TotalPurchases = sales.Count,
                TotalAmountSpent = sales.Sum(x => x.TotalAmount),
                CreatedAt = customer.CreatedAt
            });
        }

        return new PagedResult<CustomerListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<CustomerDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _context.Customers.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Customer", id);

        var sales = await GetCompletedSalesAsync(id, cancellationToken);
        var stats = BuildStats(sales);
        var recentPurchases = await BuildPurchasesAsync(sales.Take(5).ToList(), cancellationToken);
        var topProducts = await BuildTopProductsAsync(id, cancellationToken);

        return new CustomerDetailDto
        {
            Id = customer.Id,
            CustomerCode = customer.CustomerCode,
            CustomerName = customer.CustomerName,
            PhoneNumber = customer.PhoneNumber,
            Address = customer.Address,
            IsActive = customer.IsActive,
            TotalPurchases = stats.TotalPurchases,
            TotalAmountSpent = stats.TotalAmountSpent,
            CreatedAt = customer.CreatedAt,
            Stats = stats,
            TopProducts = topProducts,
            RecentPurchases = recentPurchases
        };
    }

    public async Task<CustomerDetailDto> CreateAsync(
        CreateCustomerRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = await SequenceGenerator.NextAsync(
            _context, "customer", "CUS", "CUS-{sequence}", cancellationToken);

        var customer = new Customer
        {
            CustomerCode = code,
            CustomerName = request.CustomerName,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            IsActive = request.IsActive
        };

        await _unitOfWork.Customers.AddAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(customer.Id, cancellationToken);
    }

    public async Task<CustomerDetailDto> UpdateAsync(
        Guid id,
        UpdateCustomerRequest request,
        CancellationToken cancellationToken = default)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Customer", id);

        customer.CustomerName = request.CustomerName;
        customer.PhoneNumber = request.PhoneNumber;
        customer.Address = request.Address;
        customer.IsActive = request.IsActive;

        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Customer", id);
        customer.IsActive = false;
        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<CustomerDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var customers = await _context.Customers.AsNoTracking().ToListAsync(cancellationToken);
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var topCustomers = new List<CustomerSummaryItemDto>();
        var highestSpending = new List<CustomerSpendingItemDto>();

        foreach (var customer in customers.Take(50))
        {
            var sales = await GetCompletedSalesAsync(customer.Id, cancellationToken);
            topCustomers.Add(new CustomerSummaryItemDto
            {
                Id = customer.Id,
                CustomerCode = customer.CustomerCode,
                CustomerName = customer.CustomerName,
                TotalPurchases = sales.Count
            });
            highestSpending.Add(new CustomerSpendingItemDto
            {
                Id = customer.Id,
                CustomerCode = customer.CustomerCode,
                CustomerName = customer.CustomerName,
                TotalAmountSpent = sales.Sum(x => x.TotalAmount)
            });
        }

        return new CustomerDashboardSummaryDto
        {
            TotalCustomers = customers.Count,
            NewCustomersThisMonth = customers.Count(x => x.CreatedAt >= monthStart),
            TopCustomers = topCustomers.OrderByDescending(x => x.TotalPurchases).Take(5).ToList(),
            HighestSpendingCustomers = highestSpending.OrderByDescending(x => x.TotalAmountSpent).Take(5).ToList()
        };
    }

    public async Task<CustomerPurchaseHistoryResultDto> GetPurchaseHistoryAsync(
        Guid id,
        CustomerPurchaseQuery query,
        CancellationToken cancellationToken = default)
    {
        _ = await _context.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Customer", id);

        var salesQuery = _context.Sales
            .AsNoTracking()
            .Where(x => x.CustomerId == id && x.Status == SaleStatus.Completed);

        if (query.DateFrom.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.SaleDate >= query.DateFrom);
        }

        if (query.DateTo.HasValue)
        {
            salesQuery = salesQuery.Where(x => x.SaleDate <= query.DateTo);
        }

        if (!string.IsNullOrWhiteSpace(query.PaymentMethod))
        {
            if (Enum.TryParse<PaymentMethod>(query.PaymentMethod, true, out var method))
            {
                salesQuery = salesQuery.Where(x => x.PaymentMethod == method);
            }
        }

        var total = await salesQuery.CountAsync(cancellationToken);
        var sales = await salesQuery
            .OrderByDescending(x => x.SaleDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var purchases = await BuildPurchasesAsync(sales, cancellationToken);
        var allSales = await GetCompletedSalesAsync(id, cancellationToken);

        return new CustomerPurchaseHistoryResultDto
        {
            Purchases = purchases,
            Summary = new CustomerPurchaseSummaryDto
            {
                TotalPurchases = allSales.Count,
                TotalRevenue = allSales.Sum(x => x.TotalAmount),
                AverageOrderValue = allSales.Count == 0 ? 0 : allSales.Sum(x => x.TotalAmount) / allSales.Count
            },
            TopProducts = await BuildTopProductsAsync(id, cancellationToken),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total,
            TotalPages = query.PageSize <= 0 ? 0 : (int)Math.Ceiling(total / (double)query.PageSize)
        };
    }

    public async Task<IReadOnlyList<CustomerOptionDto>> GetOptionsAsync(CancellationToken cancellationToken = default) =>
        await _context.Customers
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.CustomerName)
            .Select(x => new CustomerOptionDto
            {
                Id = x.Id,
                Name = x.CustomerName,
                Phone = x.PhoneNumber ?? string.Empty
            })
            .ToListAsync(cancellationToken);

    private async Task<List<Sale>> GetCompletedSalesAsync(Guid customerId, CancellationToken cancellationToken) =>
        await _context.Sales
            .AsNoTracking()
            .Where(x => x.CustomerId == customerId && x.Status == SaleStatus.Completed)
            .ToListAsync(cancellationToken);

    private static CustomerStatsDto BuildStats(IReadOnlyList<Sale> sales)
    {
        var totalAmount = sales.Sum(x => x.TotalAmount);
        return new CustomerStatsDto
        {
            TotalPurchases = sales.Count,
            TotalAmountSpent = totalAmount,
            LastPurchaseDate = sales.OrderByDescending(x => x.SaleDate).FirstOrDefault()?.SaleDate,
            AveragePurchaseValue = sales.Count == 0 ? 0 : totalAmount / sales.Count
        };
    }

    private async Task<IReadOnlyList<CustomerPurchaseDto>> BuildPurchasesAsync(
        IReadOnlyList<Sale> sales,
        CancellationToken cancellationToken)
    {
        var result = new List<CustomerPurchaseDto>();
        foreach (var sale in sales)
        {
            var items = await _context.SaleItems.AsNoTracking()
                .Where(x => x.SaleId == sale.Id)
                .ToListAsync(cancellationToken);

            var summary = string.Join(", ", items.Take(2).Select(x => $"{x.ProductName} ({x.VariantName})"));
            result.Add(new CustomerPurchaseDto
            {
                Id = sale.Id,
                SaleId = sale.Id,
                ReceiptNumber = sale.ReceiptNumber,
                SaleDate = sale.SaleDate,
                ItemsPurchased = items.Sum(x => x.Quantity),
                ItemSummary = string.IsNullOrWhiteSpace(summary) ? "No items" : summary,
                PaymentMethod = sale.PaymentMethod.ToString(),
                TotalAmount = sale.TotalAmount
            });
        }

        return result;
    }

    private async Task<IReadOnlyList<TopPurchasedProductDto>> BuildTopProductsAsync(
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var items = await _context.SaleItems
            .AsNoTracking()
            .Include(x => x.Sale)
            .Where(x => x.Sale.CustomerId == customerId && x.Sale.Status == SaleStatus.Completed)
            .GroupBy(x => new { x.ProductName, x.VariantName })
            .Select(g => new
            {
                g.Key.ProductName,
                g.Key.VariantName,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync(cancellationToken);

        return items.Select((x, index) => new TopPurchasedProductDto
        {
            Rank = index + 1,
            ProductName = x.ProductName,
            VariantName = x.VariantName,
            PurchaseCount = x.Count
        }).ToList();
    }
}
