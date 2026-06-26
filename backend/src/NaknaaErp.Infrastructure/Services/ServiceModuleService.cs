using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.DTOs.ServiceJobs;
using NaknaaErp.Application.DTOs.Services;
using NaknaaErp.Application.Exceptions;
using NaknaaErp.Application.Interfaces;
using NaknaaErp.Application.Interfaces.Services;
using NaknaaErp.Domain.Entities;
using NaknaaErp.Domain.Enums;
using NaknaaErp.Infrastructure.Common;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Services;

public class ServiceModuleService : IServiceModuleService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public ServiceModuleService(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ServiceListItemDto>> GetAllServicesAsync(
        ServiceListQuery query,
        CancellationToken cancellationToken = default)
    {
        var servicesQuery = _context.Services.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            servicesQuery = servicesQuery.Where(x =>
                x.ServiceName.ToLower().Contains(search) ||
                x.ServiceCode.ToLower().Contains(search));
        }

        if (query.IsActive.HasValue)
        {
            servicesQuery = servicesQuery.Where(x => x.IsActive == query.IsActive);
        }

        var total = await servicesQuery.CountAsync(cancellationToken);
        var items = await servicesQuery
            .OrderBy(x => x.ServiceName)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new ServiceListItemDto
            {
                Id = x.Id,
                ServiceCode = x.ServiceCode,
                ServiceName = x.ServiceName,
                Price = x.Price,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ServiceListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<ServiceDetailDto> GetServiceByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var service = await _context.Services.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Service", id);

        return new ServiceDetailDto
        {
            Id = service.Id,
            ServiceCode = service.ServiceCode,
            ServiceName = service.ServiceName,
            Price = service.Price,
            Description = service.Description,
            IsActive = service.IsActive,
            CreatedAt = service.CreatedAt,
            UpdatedAt = service.UpdatedAt
        };
    }

    public async Task<ServiceDetailDto> CreateServiceAsync(
        CreateServiceRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = await SequenceGenerator.NextAsync(
            _context, "service", "SRV", "SRV-{sequence}", cancellationToken);

        var service = new Service
        {
            ServiceCode = code,
            ServiceName = request.ServiceName,
            Price = request.Price,
            Description = request.Description,
            IsActive = request.IsActive
        };

        await _unitOfWork.Services.AddAsync(service, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetServiceByIdAsync(service.Id, cancellationToken);
    }

    public async Task<ServiceDetailDto> UpdateServiceAsync(
        Guid id,
        UpdateServiceRequest request,
        CancellationToken cancellationToken = default)
    {
        var service = await _context.Services.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Service", id);

        service.ServiceName = request.ServiceName;
        service.Price = request.Price;
        service.Description = request.Description;
        service.IsActive = request.IsActive;

        _unitOfWork.Services.Update(service);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetServiceByIdAsync(id, cancellationToken);
    }

    public async Task DeleteServiceAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var service = await _unitOfWork.Services.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Service", id);
        service.IsActive = false;
        _unitOfWork.Services.Update(service);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<ServiceJobListItemDto>> GetAllJobsAsync(
        ServiceJobListQuery query,
        CancellationToken cancellationToken = default)
    {
        var jobsQuery = _context.ServiceJobs
            .AsNoTracking()
            .Include(x => x.Service)
            .Include(x => x.Customer)
            .Include(x => x.AssignedUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            jobsQuery = jobsQuery.Where(x =>
                x.JobNumber.ToLower().Contains(search) ||
                x.Service.ServiceName.ToLower().Contains(search));
        }

        if (query.Status.HasValue)
        {
            jobsQuery = jobsQuery.Where(x => x.Status == query.Status);
        }

        if (query.CustomerId.HasValue)
        {
            jobsQuery = jobsQuery.Where(x => x.CustomerId == query.CustomerId);
        }

        if (query.DateFrom.HasValue)
        {
            jobsQuery = jobsQuery.Where(x => x.CreatedAt >= query.DateFrom);
        }

        if (query.DateTo.HasValue)
        {
            jobsQuery = jobsQuery.Where(x => x.CreatedAt <= query.DateTo);
        }

        var total = await jobsQuery.CountAsync(cancellationToken);
        var items = await jobsQuery
            .OrderByDescending(x => x.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new ServiceJobListItemDto
            {
                Id = x.Id,
                JobNumber = x.JobNumber,
                ServiceId = x.ServiceId,
                ServiceName = x.Service.ServiceName,
                CustomerId = x.CustomerId,
                CustomerName = x.Customer != null ? x.Customer.CustomerName : null,
                AssignedUserId = x.AssignedUserId,
                AssignedUserName = x.AssignedUser != null ? $"{x.AssignedUser.FirstName} {x.AssignedUser.LastName}" : null,
                Status = x.Status,
                Price = x.Price,
                Notes = x.Notes,
                CompletedAt = x.CompletedAt,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ServiceJobListItemDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<ServiceJobDetailDto> GetJobByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var job = await _context.ServiceJobs
            .AsNoTracking()
            .Include(x => x.Service)
            .Include(x => x.Customer)
            .Include(x => x.AssignedUser)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("ServiceJob", id);

        return MapJobDetail(job);
    }

    public async Task<ServiceJobDetailDto> CreateJobAsync(
        CreateServiceJobRequest request,
        CancellationToken cancellationToken = default)
    {
        _ = await _unitOfWork.Services.GetByIdAsync(request.ServiceId, cancellationToken)
            ?? throw new NotFoundException("Service", request.ServiceId);

        var jobNumber = await SequenceGenerator.NextAsync(
            _context, "service_job", "JOB", "JOB-{year}-{sequence}", cancellationToken);

        var job = new ServiceJob
        {
            JobNumber = jobNumber,
            ServiceId = request.ServiceId,
            CustomerId = request.CustomerId,
            AssignedUserId = request.AssignedUserId,
            Price = request.Price,
            Notes = request.Notes,
            Status = ServiceJobStatus.Pending
        };

        await _unitOfWork.ServiceJobs.AddAsync(job, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetJobByIdAsync(job.Id, cancellationToken);
    }

    public async Task<ServiceJobDetailDto> UpdateJobAsync(
        Guid id,
        UpdateServiceJobRequest request,
        CancellationToken cancellationToken = default)
    {
        var job = await _context.ServiceJobs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("ServiceJob", id);

        job.ServiceId = request.ServiceId;
        job.CustomerId = request.CustomerId;
        job.AssignedUserId = request.AssignedUserId;
        job.Status = request.Status;
        job.Price = request.Price;
        job.Notes = request.Notes;
        job.CompletedAt = request.Status == ServiceJobStatus.Completed
            ? request.CompletedAt ?? DateTime.UtcNow
            : request.CompletedAt;

        _unitOfWork.ServiceJobs.Update(job);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetJobByIdAsync(id, cancellationToken);
    }

    public async Task<ServiceJobReceiptDto> GetJobReceiptAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var job = await GetJobByIdAsync(id, cancellationToken);
        var businessSetting = await _context.AppSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Category == "Business" && x.Key == "BusinessName", cancellationToken);

        return new ServiceJobReceiptDto
        {
            Id = job.Id,
            JobNumber = job.JobNumber,
            CustomerName = job.CustomerName ?? "Walk-in Customer",
            ServiceName = job.ServiceName,
            Amount = job.Price,
            Status = job.Status,
            AssignedUserName = job.AssignedUserName,
            CompletedAt = job.CompletedAt,
            BusinessName = businessSetting?.Value ?? "NakNaa S&I",
            IssuedAt = DateTime.UtcNow
        };
    }

    public async Task<ServiceDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var jobs = await _context.ServiceJobs.AsNoTracking().ToListAsync(cancellationToken);
        return new ServiceDashboardSummaryDto
        {
            TotalServices = await _context.Services.CountAsync(x => x.IsActive, cancellationToken),
            CompletedJobs = jobs.Count(x => x.Status == ServiceJobStatus.Completed),
            PendingJobs = jobs.Count(x => x.Status is ServiceJobStatus.Pending or ServiceJobStatus.InProgress),
            ServiceRevenue = jobs.Where(x => x.Status == ServiceJobStatus.Completed).Sum(x => x.Price)
        };
    }

    private static ServiceJobDetailDto MapJobDetail(ServiceJob job) =>
        new()
        {
            Id = job.Id,
            JobNumber = job.JobNumber,
            ServiceId = job.ServiceId,
            ServiceCode = job.Service.ServiceCode,
            ServiceName = job.Service.ServiceName,
            CustomerId = job.CustomerId,
            CustomerName = job.Customer?.CustomerName,
            CustomerPhone = job.Customer?.PhoneNumber,
            AssignedUserId = job.AssignedUserId,
            AssignedUserName = job.AssignedUser != null ? $"{job.AssignedUser.FirstName} {job.AssignedUser.LastName}" : null,
            Status = job.Status,
            Price = job.Price,
            Notes = job.Notes,
            CompletedAt = job.CompletedAt,
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt
        };
}
