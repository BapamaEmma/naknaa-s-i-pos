using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.DTOs.Settings;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class BranchService : IBranchService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public BranchService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SettingsBranchDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Branches
            .AsNoTracking()
            .OrderBy(x => x.BranchName)
            .Select(x => new SettingsBranchDto
            {
                Id = x.Id,
                BranchName = x.BranchName,
                BranchCode = x.BranchCode,
                Address = x.Address,
                PhoneNumber = x.PhoneNumber,
                Status = x.Status,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

    public async Task<SettingsBranchDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var branch = await _context.Branches
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Branch", id);

        return MapBranch(branch);
    }

    public async Task<SettingsBranchDto> CreateAsync(
        CreateBranchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (await _context.Branches.AnyAsync(x => x.BranchCode == request.BranchCode, cancellationToken))
        {
            throw new ValidationException("Branch code already exists.");
        }

        var branch = new Branch
        {
            BranchCode = request.BranchCode,
            BranchName = request.BranchName,
            Address = request.Address,
            PhoneNumber = request.PhoneNumber,
            Status = request.Status
        };

        await _unitOfWork.Branches.AddAsync(branch, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapBranch(branch);
    }

    public async Task<SettingsBranchDto> UpdateAsync(
        Guid id,
        UpdateBranchRequest request,
        CancellationToken cancellationToken = default)
    {
        var branch = await _context.Branches.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Branch", id);

        if (await _context.Branches.AnyAsync(x => x.Id != id && x.BranchCode == request.BranchCode, cancellationToken))
        {
            throw new ValidationException("Branch code already exists.");
        }

        branch.BranchName = request.BranchName;
        branch.BranchCode = request.BranchCode;
        branch.Address = request.Address;
        branch.PhoneNumber = request.PhoneNumber;
        branch.Status = request.Status;

        _unitOfWork.Branches.Update(branch);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapBranch(branch);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var branch = await _unitOfWork.Branches.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Branch", id);

        branch.Status = EntityStatus.Inactive;
        _unitOfWork.Branches.Update(branch);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static SettingsBranchDto MapBranch(Branch branch) =>
        new()
        {
            Id = branch.Id,
            BranchName = branch.BranchName,
            BranchCode = branch.BranchCode,
            Address = branch.Address,
            PhoneNumber = branch.PhoneNumber,
            Status = branch.Status,
            CreatedAt = branch.CreatedAt
        };
}
