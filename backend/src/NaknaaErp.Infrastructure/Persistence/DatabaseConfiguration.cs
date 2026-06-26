using Microsoft.Extensions.Configuration;
using Npgsql;

namespace NaknaaErp.Infrastructure.Persistence;

public static class DatabaseConfiguration
{
    public static string ResolveConnectionString(IConfiguration configuration)
    {
        var configured = configuration.GetConnectionString("DefaultConnection");
        if (IsUsableConnectionString(configured))
        {
            return ApplyRemotePostgresSsl(configured!);
        }

        var supabase = configuration.GetSection("Supabase");
        var host = supabase["Host"];

        if (string.IsNullOrWhiteSpace(host))
        {
            throw new InvalidOperationException(
                "Supabase is not configured. Add ConnectionStrings:DefaultConnection or Supabase settings. " +
                "See backend/README.md for setup steps.");
        }

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = host,
            Port = supabase.GetValue("Port", 5432),
            Database = supabase["Database"] ?? "postgres",
            Username = supabase["Username"] ?? "postgres",
            Password = supabase["Password"] ?? string.Empty,
            SslMode = SslMode.Require,
        };

        return builder.ConnectionString;
    }

    private static bool IsUsableConnectionString(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) ||
            value.Contains("YOUR_", StringComparison.OrdinalIgnoreCase) ||
            value.Contains("your-project", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var builder = new NpgsqlConnectionStringBuilder(value);
        return !IsLocalHost(builder.Host);
    }

    private static string ApplyRemotePostgresSsl(string connectionString)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);

        if (IsLocalHost(builder.Host))
        {
            throw new InvalidOperationException(
                "Local PostgreSQL connections are not supported. Configure Supabase instead. " +
                "See backend/README.md.");
        }

        builder.SslMode = SslMode.Require;
        return builder.ConnectionString;
    }

    private static bool IsLocalHost(string? host) =>
        string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase) ||
        host == "127.0.0.1" ||
        host == "::1";
}
