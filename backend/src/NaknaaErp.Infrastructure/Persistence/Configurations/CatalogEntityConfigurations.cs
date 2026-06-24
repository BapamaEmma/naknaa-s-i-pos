using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NaknaaErp.Domain.Entities;

namespace NaknaaErp.Infrastructure.Persistence.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("warehouses");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.WarehouseCode).HasMaxLength(20).IsRequired();
        builder.Property(x => x.WarehouseName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.Address).HasMaxLength(500);
        builder.Property(x => x.Manager).HasMaxLength(200);
        builder.HasIndex(x => x.WarehouseCode).IsUnique();
        builder.HasIndex(x => x.WarehouseName);
    }
}

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ProductCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ProductName).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Brand).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Model).HasMaxLength(200);
        builder.Property(x => x.CostPrice).HasPrecision(18, 2);
        builder.Property(x => x.SellingPrice).HasPrecision(18, 2);
        builder.Property(x => x.ImageUrl).HasColumnType("text");
        builder.HasIndex(x => x.ProductCode).IsUnique();
        builder.HasIndex(x => x.ProductName);
        builder.HasIndex(x => x.Brand);
        builder.HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId);
    }
}

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("product_variants");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.VariantName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.VariantValue).HasMaxLength(200).IsRequired();
        builder.Property(x => x.CostPrice).HasPrecision(18, 2);
        builder.Property(x => x.SellingPrice).HasPrecision(18, 2);
        builder.HasIndex(x => new { x.ProductId, x.VariantName, x.VariantValue }).IsUnique();
        builder.HasOne(x => x.Product).WithMany(x => x.Variants).HasForeignKey(x => x.ProductId);
    }
}
