using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.Categories;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CategoryDto>>>> GetAll(
        CancellationToken cancellationToken)
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new CategoryDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
            })
            .ToListAsync(cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<CategoryDto>>.Ok(categories));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new CategoryDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (category is null)
        {
            return NotFound(ApiResponse<CategoryDto>.Fail("Category not found"));
        }

        return Ok(ApiResponse<CategoryDto>.Ok(category));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create(
        [FromBody] CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("Category name is required.");
        }

        var nameExists = await _context.Categories
            .AnyAsync(x => x.Name.ToLower() == name.ToLower(), cancellationToken);

        if (nameExists)
        {
            throw new ValidationException("A category with this name already exists.");
        }

        var category = new Category
        {
            Name = name,
            Description = request.Description?.Trim(),
            IsActive = request.IsActive,
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = category.Id },
            ApiResponse<CategoryDto>.Ok(MapCategory(category), "Category created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(
        Guid id,
        [FromBody] UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Category", id);

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("Category name is required.");
        }

        var nameExists = await _context.Categories
            .AnyAsync(
                x => x.Id != id && x.Name.ToLower() == name.ToLower(),
                cancellationToken);

        if (nameExists)
        {
            throw new ValidationException("A category with this name already exists.");
        }

        category.Name = name;
        category.Description = request.Description?.Trim();
        category.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(ApiResponse<CategoryDto>.Ok(MapCategory(category), "Category updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Category", id);

        var hasProducts = await _context.Products.AnyAsync(x => x.CategoryId == id, cancellationToken);
        if (hasProducts)
        {
            throw new ValidationException("Categories with assigned products cannot be deleted.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(ApiResponse<object>.Ok(new { }, "Category deleted successfully"));
    }

    private static CategoryDto MapCategory(Category category) =>
        new()
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt,
        };
}
