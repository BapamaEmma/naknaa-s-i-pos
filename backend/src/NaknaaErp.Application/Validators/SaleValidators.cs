using FluentValidation;
using NaknaaErp.Application.DTOs.Sales;

namespace NaknaaErp.Application.Validators;

public class CreateSaleRequestValidator : AbstractValidator<CreateSaleRequest>
{
    public CreateSaleRequestValidator()
    {
        RuleFor(x => x.BranchId)
            .NotEmpty().WithMessage("Branch is required.");

        RuleFor(x => x.PaymentMethod)
            .IsInEnum().WithMessage("A valid payment method is required.");

        RuleFor(x => x.Discount)
            .GreaterThanOrEqualTo(0).WithMessage("Discount cannot be negative.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one sale item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductVariantId)
                .NotEmpty().WithMessage("Product variant is required.");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

            item.RuleFor(i => i.UnitPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Unit price cannot be negative.");
        });

        When(x => x.CustomerId is null, () =>
        {
            RuleFor(x => x.CustomerName)
                .NotEmpty().WithMessage("Customer name is required for walk-in sales.");
        });
    }
}
