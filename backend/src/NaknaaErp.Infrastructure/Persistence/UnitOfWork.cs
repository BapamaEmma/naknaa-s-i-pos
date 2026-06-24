using Microsoft.EntityFrameworkCore.Storage;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Persistence.Repositories;

namespace NaknaaErp.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    private IRepository<User>? _users;
    private IRepository<Role>? _roles;
    private IRepository<Permission>? _permissions;
    private IRepository<RolePermission>? _rolePermissions;
    private IRepository<Branch>? _branches;
    private IRepository<RefreshToken>? _refreshTokens;
    private IRepository<Warehouse>? _warehouses;
    private IRepository<Category>? _categories;
    private IRepository<Product>? _products;
    private IRepository<ProductVariant>? _productVariants;
    private IRepository<InventoryRecord>? _inventoryRecords;
    private IRepository<InventoryTransaction>? _inventoryTransactions;
    private IRepository<Customer>? _customers;
    private IRepository<Supplier>? _suppliers;
    private IRepository<Purchase>? _purchases;
    private IRepository<PurchaseItem>? _purchaseItems;
    private IRepository<PurchaseOrder>? _purchaseOrders;
    private IRepository<PurchaseOrderItem>? _purchaseOrderItems;
    private IRepository<Sale>? _sales;
    private IRepository<SaleItem>? _saleItems;
    private IRepository<Service>? _services;
    private IRepository<ServiceJob>? _serviceJobs;
    private IRepository<AuditLog>? _auditLogs;
    private IRepository<AppSetting>? _appSettings;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<Role> Roles => _roles ??= new Repository<Role>(_context);
    public IRepository<Permission> Permissions => _permissions ??= new Repository<Permission>(_context);
    public IRepository<RolePermission> RolePermissions => _rolePermissions ??= new Repository<RolePermission>(_context);
    public IRepository<Branch> Branches => _branches ??= new Repository<Branch>(_context);
    public IRepository<RefreshToken> RefreshTokens => _refreshTokens ??= new Repository<RefreshToken>(_context);
    public IRepository<Warehouse> Warehouses => _warehouses ??= new Repository<Warehouse>(_context);
    public IRepository<Category> Categories => _categories ??= new Repository<Category>(_context);
    public IRepository<Product> Products => _products ??= new Repository<Product>(_context);
    public IRepository<ProductVariant> ProductVariants => _productVariants ??= new Repository<ProductVariant>(_context);
    public IRepository<InventoryRecord> InventoryRecords => _inventoryRecords ??= new Repository<InventoryRecord>(_context);
    public IRepository<InventoryTransaction> InventoryTransactions => _inventoryTransactions ??= new Repository<InventoryTransaction>(_context);
    public IRepository<Customer> Customers => _customers ??= new Repository<Customer>(_context);
    public IRepository<Supplier> Suppliers => _suppliers ??= new Repository<Supplier>(_context);
    public IRepository<Purchase> Purchases => _purchases ??= new Repository<Purchase>(_context);
    public IRepository<PurchaseItem> PurchaseItems => _purchaseItems ??= new Repository<PurchaseItem>(_context);
    public IRepository<PurchaseOrder> PurchaseOrders => _purchaseOrders ??= new Repository<PurchaseOrder>(_context);
    public IRepository<PurchaseOrderItem> PurchaseOrderItems => _purchaseOrderItems ??= new Repository<PurchaseOrderItem>(_context);
    public IRepository<Sale> Sales => _sales ??= new Repository<Sale>(_context);
    public IRepository<SaleItem> SaleItems => _saleItems ??= new Repository<SaleItem>(_context);
    public IRepository<Service> Services => _services ??= new Repository<Service>(_context);
    public IRepository<ServiceJob> ServiceJobs => _serviceJobs ??= new Repository<ServiceJob>(_context);
    public IRepository<AuditLog> AuditLogs => _auditLogs ??= new Repository<AuditLog>(_context);
    public IRepository<AppSetting> AppSettings => _appSettings ??= new Repository<AppSetting>(_context);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
        {
            return;
        }

        await _transaction.CommitAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
        {
            return;
        }

        await _transaction.RollbackAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction is not null)
        {
            await _transaction.DisposeAsync();
        }

        await _context.DisposeAsync();
    }
}
