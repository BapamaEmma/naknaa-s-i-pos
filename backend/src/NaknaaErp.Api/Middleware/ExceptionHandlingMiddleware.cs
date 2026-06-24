using System.Net;
using System.Text.Json;
using NaknaaErp.Application.Common;
using NaknaaErp.Application.Exceptions;

namespace NaknaaErp.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            NotFoundException notFound => (HttpStatusCode.NotFound, notFound.Message),
            ValidationException validation => (HttpStatusCode.BadRequest, validation.Message),
            UnauthorizedException unauthorized => (HttpStatusCode.Unauthorized, unauthorized.Message),
            AppException appException => (HttpStatusCode.BadRequest, appException.Message),
            _ when IsDatabaseConnectionFailure(exception) => (
                HttpStatusCode.ServiceUnavailable,
                "Unable to connect to the database. Start PostgreSQL (e.g. run `docker compose up -d` in the backend folder) and try again."),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception for {Method} {Path}",
                context.Request.Method, context.Request.Path);
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception for {Method} {Path}: {Message}",
                context.Request.Method, context.Request.Path, message);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.Fail(message);
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }

    private static bool IsDatabaseConnectionFailure(Exception exception)
    {
        for (var current = exception; current is not null; current = current.InnerException)
        {
            if (current.Message.Contains("Failed to connect", StringComparison.OrdinalIgnoreCase)
                || current.Message.Contains("Connection refused", StringComparison.OrdinalIgnoreCase)
                || current.Message.Contains("transient failure", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }
}
