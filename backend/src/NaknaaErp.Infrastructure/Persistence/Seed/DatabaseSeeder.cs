using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NaknaaErp.Application.DTOs.Settings;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class DatabaseSeeder
{
    private static readonly Guid AdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111101");
    private static readonly Guid StorekeeperRoleId = Guid.Parse("11111111-1111-1111-1111-111111111102");
    private static readonly Guid AccraBranchId = Guid.Parse("22222222-2222-2222-2222-222222222201");
    private static readonly Guid AdminUserId = Guid.Parse("33333333-3333-3333-3333-333333333301");

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        if (await context.Roles.AnyAsync())
        {
            logger.LogInformation("Database already seeded.");
            return;
        }

        logger.LogInformation("Seeding NakNaa ERP database...");

        var permissions = CreatePermissions();
        var roles = CreateRoles();
        var rolePermissions = LinkRolePermissions(roles, permissions);
        var branch = CreateBranch();
        var adminUser = CreateAdminUser(branch.Id, AdminRoleId);
        var warehouses = CreateWarehouses();
        var categories = CreateCategories();
        var products = CreateProducts(categories);
        var variants = CreateVariants(products);
        var inventoryRecords = CreateInventory(warehouses, variants);
        var settings = CreateSettings();

        context.Permissions.AddRange(permissions);
        context.Roles.AddRange(roles);
        context.RolePermissions.AddRange(rolePermissions);
        context.Branches.Add(branch);
        context.Users.Add(adminUser);
        context.Warehouses.AddRange(warehouses);
        context.Categories.AddRange(categories);
        context.Products.AddRange(products);
        context.ProductVariants.AddRange(variants);
        context.InventoryRecords.AddRange(inventoryRecords);
        context.AppSettings.AddRange(settings);

        await context.SaveChangesAsync();
        logger.LogInformation("Database seeding completed.");
    }

    private static List<Permission> CreatePermissions() =>
    [
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001"), Code = "users.view", Name = "View Users", Module = "Users" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002"), Code = "users.manage", Name = "Manage Users", Module = "Users" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003"), Code = "products.view", Name = "View Products", Module = "Products" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004"), Code = "products.manage", Name = "Manage Products", Module = "Products" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005"), Code = "inventory.view", Name = "View Inventory", Module = "Inventory" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006"), Code = "inventory.manage", Name = "Manage Inventory", Module = "Inventory" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007"), Code = "sales.view", Name = "View Sales", Module = "Sales" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008"), Code = "sales.manage", Name = "Manage Sales", Module = "Sales" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009"), Code = "purchases.view", Name = "View Purchases", Module = "Purchases" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010"), Code = "purchases.manage", Name = "Manage Purchases", Module = "Purchases" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0011"), Code = "reports.view", Name = "View Reports", Module = "Reports" },
        new() { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0012"), Code = "settings.manage", Name = "Manage Settings", Module = "Settings" }
    ];

    private static List<Role> CreateRoles() =>
    [
        new()
        {
            Id = AdminRoleId,
            Name = "Administrator",
            Description = "Full system access"
        },
        new()
        {
            Id = StorekeeperRoleId,
            Name = "Storekeeper",
            Description = "Inventory and warehouse operations"
        }
    ];

    private static List<RolePermission> LinkRolePermissions(IReadOnlyList<Role> roles, IReadOnlyList<Permission> permissions)
    {
        var adminRole = roles.First(x => x.Name == "Administrator");
        var storekeeperRole = roles.First(x => x.Name == "Storekeeper");

        var adminLinks = permissions.Select(p => new RolePermission
        {
            RoleId = adminRole.Id,
            PermissionId = p.Id
        });

        var storekeeperCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "products.view",
            "inventory.view",
            "inventory.manage",
            "purchases.view",
            "purchases.manage",
            "sales.view",
            "sales.manage",
        };

        var storekeeperLinks = permissions
            .Where(p => storekeeperCodes.Contains(p.Code))
            .Select(p => new RolePermission
            {
                RoleId = storekeeperRole.Id,
                PermissionId = p.Id
            });

        return adminLinks.Concat(storekeeperLinks).ToList();
    }

    private static Branch CreateBranch() =>
        new()
        {
            Id = AccraBranchId,
            BranchCode = "ACC",
            BranchName = "Accra Branch",
            Address = "Ring Road Central, Accra",
            PhoneNumber = "+233 30 123 4567",
            Status = EntityStatus.Active
        };

    private static User CreateAdminUser(Guid branchId, Guid roleId) =>
        new()
        {
            Id = AdminUserId,
            FirstName = "System",
            LastName = "Administrator",
            Username = "admin",
            Email = "admin@naknaa.com",
            PhoneNumber = "+233 30 123 4567",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
            RoleId = roleId,
            BranchId = branchId,
            IsActive = true
        };

    private static List<Warehouse> CreateWarehouses() =>
    [
        new()
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444401"),
            WarehouseCode = "WH-001",
            WarehouseName = "Chairman Down",
            Description = "Ground floor storage for speakers and heavy equipment.",
            Address = "Chairman Block, Ground Floor",
            Manager = "Kwame Mensah",
            Status = EntityStatus.Active
        },
        new()
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444402"),
            WarehouseCode = "WH-002",
            WarehouseName = "Chairman Top",
            Description = "Upper floor storage for instruments and accessories.",
            Address = "Chairman Block, Top Floor",
            Manager = "Ama Osei",
            Status = EntityStatus.Active
        },
        new()
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444403"),
            WarehouseCode = "WH-003",
            WarehouseName = "Nasoo",
            Description = "Nasoo warehouse for overflow and seasonal stock.",
            Address = "Nasoo Industrial Area",
            Manager = "Kojo Asante",
            Status = EntityStatus.Active
        },
        new()
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444404"),
            WarehouseCode = "WH-004",
            WarehouseName = "Masalachi",
            Description = "Masalachi storage for fast-moving retail items.",
            Address = "Masalachi Market Road",
            Manager = "Esi Boateng",
            Status = EntityStatus.Active
        }
    ];

    private static List<Category> CreateCategories() =>
    [
        new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555501"), Name = "Event Speakers", Description = "Professional live sound speakers" },
        new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555502"), Name = "Guitars", Description = "Electric and acoustic guitars" },
        new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555503"), Name = "Piano Keyboards", Description = "Keyboards and pianos" },
        new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555504"), Name = "Mixers", Description = "Audio mixing consoles" }
    ];

    private static List<Product> CreateProducts(IReadOnlyList<Category> categories)
    {
        var speakers = categories.First(x => x.Name == "Event Speakers");
        var guitars = categories.First(x => x.Name == "Guitars");
        var keyboards = categories.First(x => x.Name == "Piano Keyboards");
        var mixers = categories.First(x => x.Name == "Mixers");

        return
        [
            new()
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666601"),
                ProductCode = "PRD-000001",
                ProductName = "JBL SRX815",
                CategoryId = speakers.Id,
                Brand = "JBL",
                Model = "SRX815",
                CostPrice = 4500,
                SellingPrice = 6200,
                ReorderLevel = 3,
                IsActive = true
            },
            new()
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666602"),
                ProductCode = "PRD-000002",
                ProductName = "Fender Stratocaster",
                CategoryId = guitars.Id,
                Brand = "Fender",
                Model = "Stratocaster",
                CostPrice = 2800,
                SellingPrice = 3900,
                ReorderLevel = 2,
                IsActive = true
            },
            new()
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666603"),
                ProductCode = "PRD-000003",
                ProductName = "Yamaha PSR",
                CategoryId = keyboards.Id,
                Brand = "Yamaha",
                Model = "PSR Series",
                CostPrice = 1800,
                SellingPrice = 2500,
                ReorderLevel = 2,
                IsActive = true
            },
            new()
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666604"),
                ProductCode = "PRD-000004",
                ProductName = "Soundcraft Mixer",
                CategoryId = mixers.Id,
                Brand = "Soundcraft",
                Model = "Signature Series",
                CostPrice = 3200,
                SellingPrice = 4500,
                ReorderLevel = 2,
                IsActive = true
            }
        ];
    }

    private static List<ProductVariant> CreateVariants(IReadOnlyList<Product> products)
    {
        var jbl = products.First(x => x.ProductName == "JBL SRX815");
        var fender = products.First(x => x.ProductName == "Fender Stratocaster");
        var yamaha = products.First(x => x.ProductName == "Yamaha PSR");
        var mixer = products.First(x => x.ProductName == "Soundcraft Mixer");

        return
        [
            new()
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777701"),
                ProductId = jbl.Id,
                VariantName = "Color",
                VariantValue = "Black",
                CostPrice = 4500,
                SellingPrice = 6200,
                ReorderLevel = 3,
                IsActive = true
            },
            new()
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777702"),
                ProductId = fender.Id,
                VariantName = "Finish",
                VariantValue = "Sunburst",
                CostPrice = 2800,
                SellingPrice = 3900,
                ReorderLevel = 2,
                IsActive = true
            },
            new()
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777703"),
                ProductId = yamaha.Id,
                VariantName = "Model",
                VariantValue = "PSR-E473",
                CostPrice = 1800,
                SellingPrice = 2500,
                ReorderLevel = 2,
                IsActive = true
            },
            new()
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777704"),
                ProductId = mixer.Id,
                VariantName = "Channels",
                VariantValue = "16 Channel",
                CostPrice = 3200,
                SellingPrice = 4500,
                ReorderLevel = 2,
                IsActive = true
            }
        ];
    }

    private static List<InventoryRecord> CreateInventory(
        IReadOnlyList<Warehouse> warehouses,
        IReadOnlyList<ProductVariant> variants)
    {
        var chairmanDown = warehouses.First(x => x.WarehouseName == "Chairman Down");
        var chairmanTop = warehouses.First(x => x.WarehouseName == "Chairman Top");
        var nasoo = warehouses.First(x => x.WarehouseName == "Nasoo");
        var masalachi = warehouses.First(x => x.WarehouseName == "Masalachi");

        return
        [
            new()
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888801"),
                ProductVariantId = variants[0].Id,
                WarehouseId = chairmanDown.Id,
                Section = "A",
                Rack = "R1",
                Bin = "B1",
                Quantity = 8,
                MinimumStockLevel = 3
            },
            new()
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888802"),
                ProductVariantId = variants[1].Id,
                WarehouseId = chairmanTop.Id,
                Section = "B",
                Rack = "R2",
                Bin = "B1",
                Quantity = 5,
                MinimumStockLevel = 2
            },
            new()
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888803"),
                ProductVariantId = variants[2].Id,
                WarehouseId = nasoo.Id,
                Section = "C",
                Rack = "R1",
                Bin = "B2",
                Quantity = 6,
                MinimumStockLevel = 2
            },
            new()
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888804"),
                ProductVariantId = variants[3].Id,
                WarehouseId = masalachi.Id,
                Section = "D",
                Rack = "R3",
                Bin = "B1",
                Quantity = 4,
                MinimumStockLevel = 2
            }
        ];
    }

    private static List<AppSetting> CreateSettings()
    {
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var business = new BusinessSettingsDto
        {
            BusinessName = "NakNaa S&I",
            BusinessPhone = "+233 30 123 4567",
            AlternatePhone = "+233 24 987 6543",
            EmailAddress = "info@naknaa.com",
            Website = "https://naknaa.com",
            BusinessAddress = "Ring Road Central, Accra",
            City = "Accra",
            Country = "Ghana",
            TaxIdentificationNumber = "C0001234567",
            UpdatedAt = DateTime.UtcNow
        };

        var receipt = new ReceiptSettingsDto
        {
            ReceiptHeader = "NakNaa S&I",
            ReceiptFooter = "Thank You For Shopping With Us!",
            ShowBusinessLogo = true,
            ShowCustomerDetails = true,
            ShowCashierName = true,
            ShowBranchName = true,
            ReceiptSize = "80mm",
            ReceiptNumberPrefix = "NAK",
            ReceiptNumberFormat = "NAK-{year}-{sequence}",
            UpdatedAt = DateTime.UtcNow
        };

        var system = new SystemSettingsDto
        {
            Currency = "GHS",
            DateFormat = "DD/MM/YYYY",
            TimeFormat = "24h",
            ThemeMode = "system",
            Numbering = new NumberingSettingsDto
            {
                ReceiptPrefix = "NAK",
                ReceiptFormat = "NAK-{year}-{sequence}",
                CustomerPrefix = "CUS",
                CustomerFormat = "CUS-{sequence}",
                SupplierPrefix = "SUP",
                SupplierFormat = "SUP-{sequence}",
                ProductPrefix = "PRD",
                ProductFormat = "PRD-{sequence}",
                WarehousePrefix = "WH",
                WarehouseFormat = "WH-{sequence}"
            },
            UpdatedAt = DateTime.UtcNow
        };

        return
        [
            new AppSetting { Category = "Business", Key = "Payload", Value = JsonSerializer.Serialize(business, jsonOptions) },
            new AppSetting { Category = "Business", Key = "BusinessName", Value = business.BusinessName },
            new AppSetting { Category = "Receipt", Key = "Payload", Value = JsonSerializer.Serialize(receipt, jsonOptions) },
            new AppSetting { Category = "System", Key = "Payload", Value = JsonSerializer.Serialize(system, jsonOptions) },
            new AppSetting { Category = "Counters", Key = "product", Value = "4" },
            new AppSetting { Category = "Counters", Key = "warehouse", Value = "4" },
            new AppSetting { Category = "Counters", Key = "customer", Value = "0" },
            new AppSetting { Category = "Counters", Key = "supplier", Value = "0" },
            new AppSetting { Category = "Counters", Key = "receipt", Value = "0" },
            new AppSetting { Category = "Counters", Key = "sale", Value = "0" },
            new AppSetting { Category = "Counters", Key = "purchase", Value = "0" }
        ];
    }
}
