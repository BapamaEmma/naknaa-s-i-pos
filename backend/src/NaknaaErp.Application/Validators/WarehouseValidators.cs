using FluentValidation;
using NaknaaErp.Application.DTOs.Warehouses;

namespace NaknaaErp.Application.Validators;

public class CreateWarehouseRequestValidator : AbstractValidator<CreateWarehouseRequest>
{
    public CreateWarehouseRequestValidator()
    {
        RuleFor(x => x.WarehouseName)
            .NotEmpty().WithMessage("Warehouse name is required.")
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .MaximumLength(500);

        RuleFor(x => x.Address)
            .MaximumLength(500);

        RuleFor(x => x.Manager)
            .MaximumLength(100);

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("A valid status is required.");
    }
}
