using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Persistence.Seed;

public static class EnsureProductVariantsSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var productsWithoutVariants = await context.Products
            .Where(product =>
                !context.ProductVariants.Any(variant => variant.ProductId == product.Id))
            .ToListAsync();

        var variantsCreated = 0;

        foreach (var product in productsWithoutVariants)
        {
            context.ProductVariants.Add(new ProductVariant
            {
                ProductId = product.Id,
                VariantName = "Standard",
                VariantValue = "Default",
                CostPrice = product.CostPrice,
                SellingPrice = product.SellingPrice > 0 ? product.SellingPrice : product.CostPrice,
                ReorderLevel = product.ReorderLevel,
                IsActive = true,
            });
            variantsCreated++;
        }

        if (variantsCreated == 0)
        {
            return;
        }

        await context.SaveChangesAsync();

        if (variantsCreated > 0)
        {
            logger.LogInformation(
                "Created default variants for {Count} product(s) missing variants.",
                variantsCreated);
        }
    }
}
