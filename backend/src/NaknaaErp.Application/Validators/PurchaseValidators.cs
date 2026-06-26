using FluentValidation;
using NaknaaErp.Application.DTOs.Purchases;

namespace NaknaaErp.Application.Validators;

public class CreatePurchaseRequestValidator : AbstractValidator<CreatePurchaseRequest>
{
    public CreatePurchaseRequestValidator()
    {
        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("Supplier is required.");

        RuleFor(x => x.WarehouseId)
            .NotEmpty().WithMessage("Warehouse is required.");

        RuleFor(x => x.PurchaseDate)
            .NotEmpty().WithMessage("Purchase date is required.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("A valid purchase status is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one purchase item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductVariantId)
                .NotEmpty().WithMessage("Product variant is required.");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

            item.RuleFor(i => i.CostPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Cost price cannot be negative.");

            item.RuleFor(i => i.Section)
                .NotEmpty().WithMessage("Section is required.");

            item.RuleFor(i => i.Rack)
                .NotEmpty().WithMessage("Rack is required.");

            item.RuleFor(i => i.Bin)
                .NotEmpty().WithMessage("Bin is required.");
        });
    }
}
