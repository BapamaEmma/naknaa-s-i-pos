using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NaknaaErp.Domain.Entities;

namespace NaknaaErp.Infrastructure.Persistence.Configurations;

public class InventoryRecordConfiguration : IEntityTypeConfiguration<InventoryRecord>
{
    public void Configure(EntityTypeBuilder<InventoryRecord> builder)
    {
        builder.ToTable("inventory_records");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Section).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Rack).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Bin).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => new { x.ProductVariantId, x.WarehouseId, x.Section, x.Rack, x.Bin }).IsUnique();
        builder.HasOne(x => x.ProductVariant).WithMany(x => x.InventoryRecords).HasForeignKey(x => x.ProductVariantId);
        builder.HasOne(x => x.Warehouse).WithMany(x => x.InventoryRecords).HasForeignKey(x => x.WarehouseId);
    }
}

public class InventoryTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
{
    public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
    {
        builder.ToTable("inventory_transactions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ReferenceNumber).HasMaxLength(100);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.HasIndex(x => x.ReferenceNumber);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasOne(x => x.ProductVariant).WithMany().HasForeignKey(x => x.ProductVariantId);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId);
        builder.HasOne(x => x.Branch).WithMany().HasForeignKey(x => x.BranchId);
    }
}
