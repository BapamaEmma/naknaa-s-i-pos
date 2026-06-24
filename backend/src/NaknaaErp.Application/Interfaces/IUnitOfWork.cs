using NaknaaErp.Domain.Entities;

namespace NaknaaErp.Application.Interfaces;

public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    IRepository<User> Users { get; }
    IRepository<Role> Roles { get; }
    IRepository<Permission> Permissions { get; }
    IRepository<RolePermission> RolePermissions { get; }
    IRepository<Branch> Branches { get; }
    IRepository<RefreshToken> RefreshTokens { get; }
    IRepository<Warehouse> Warehouses { get; }
    IRepository<Category> Categories { get; }
    IRepository<Product> Products { get; }
    IRepository<ProductVariant> ProductVariants { get; }
    IRepository<InventoryRecord> InventoryRecords { get; }
    IRepository<InventoryTransaction> InventoryTransactions { get; }
    IRepository<Customer> Customers { get; }
    IRepository<Supplier> Suppliers { get; }
    IRepository<Purchase> Purchases { get; }
    IRepository<PurchaseItem> PurchaseItems { get; }
    IRepository<PurchaseOrder> PurchaseOrders { get; }
    IRepository<PurchaseOrderItem> PurchaseOrderItems { get; }
    IRepository<Sale> Sales { get; }
    IRepository<SaleItem> SaleItems { get; }
    IRepository<Service> Services { get; }
    IRepository<ServiceJob> ServiceJobs { get; }
    IRepository<AuditLog> AuditLogs { get; }
    IRepository<AppSetting> AppSettings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
