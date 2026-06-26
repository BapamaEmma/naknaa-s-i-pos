using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using NaknaaErp.Api.Middleware;
using NaknaaErp.Application;
using NaknaaErp.Infrastructure;
using NaknaaErp.Infrastructure.Persistence;
using NaknaaErp.Infrastructure.Persistence.Seed;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
var resetInventoryOnly = args.Contains("--reset-inventory", StringComparer.OrdinalIgnoreCase);
var resetCatalogOnly = args.Contains("--reset-catalog", StringComparer.OrdinalIgnoreCase);
var purgeInactiveCustomersOnly = args.Contains("--purge-inactive-customers", StringComparer.OrdinalIgnoreCase);
var repairAdminOnly = args.Contains("--repair-admin", StringComparer.OrdinalIgnoreCase);
var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile(
        "appsettings.Development.local.json",
        optional: true,
        reloadOnChange: true);
}

builder.Host.UseSerilog((context, services, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NakNaa ERP API",
        Version = "v1",
        Description = "REST API for NakNaa Electronics ERP and POS system"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy
                .SetIsOriginAllowed(static origin =>
                    origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase) ||
                    origin.StartsWith("https://localhost:", StringComparison.OrdinalIgnoreCase))
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            return;
        }

        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (resetInventoryOnly)
{
    if (!app.Environment.IsDevelopment())
    {
        throw new InvalidOperationException("--reset-inventory is only available in Development.");
    }

    await EnsureEmptyWarehouseInventorySeeder.ClearAllInventoryAsync(app.Services);
    Log.Information("Warehouse inventory reset complete.");
    return;
}

if (resetCatalogOnly)
{
    if (!app.Environment.IsDevelopment())
    {
        throw new InvalidOperationException("--reset-catalog is only available in Development.");
    }

    await ResetCatalogSeeder.ClearAllProductsAsync(app.Services);
    Log.Information("Catalog reset complete.");
    return;
}

if (purgeInactiveCustomersOnly)
{
    if (!app.Environment.IsDevelopment())
    {
        throw new InvalidOperationException("--purge-inactive-customers is only available in Development.");
    }

    await PurgeInactiveCustomersSeeder.PurgeWithoutPurchaseHistoryAsync(app.Services);
    Log.Information("Inactive customer purge complete.");
    return;
}

if (repairAdminOnly)
{
    if (!app.Environment.IsDevelopment())
    {
        throw new InvalidOperationException("--repair-admin is only available in Development.");
    }

    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    await EnsureAdminAccountSeeder.RepairAsync(app.Services);
    await EnsureAdminAccountSeeder.ResetPasswordAsync(app.Services);
    Log.Information("Admin account repair complete.");
    return;
}

app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionHandlingMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();
    await EnsureDefaultUsersSeeder.SeedAsync(app.Services);
    await EnsureProductVariantsSeeder.SeedAsync(app.Services);
    await EnsureAdminAccountSeeder.RepairAsync(app.Services);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "NakNaa ERP API v1");
        options.RoutePrefix = "swagger";
    });

    await DatabaseSeeder.SeedAsync(app.Services);
    await DemoDashboardSeeder.RemoveLegacyDemoSalesAsync(app.Services);
}

app.UseHttpsRedirection();
app.UseCors("ReactFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
