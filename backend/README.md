# NakNaa ERP Backend

ASP.NET Core 9 Web API for the NakNaa Electronics ERP and POS system.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- EF Core CLI tools:

```bash
dotnet tool install --global dotnet-ef
```

## Database Setup

1. Install and start PostgreSQL.
2. Create the database:

```sql
CREATE DATABASE naknaa_erp_db;
```

3. Update the connection string in `src/NaknaaErp.Api/appsettings.json` or `appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=naknaa_erp_db;Username=postgres;Password=your_password"
}
```

## Getting Started

From the `backend` directory:

```bash
# Restore NuGet packages
dotnet restore

# Create the initial migration (from backend/src)
cd src
dotnet ef migrations add InitialCreate --project NaknaaErp.Infrastructure --startup-project NaknaaErp.Api

# Apply migrations to the database
dotnet ef database update --project NaknaaErp.Infrastructure --startup-project NaknaaErp.Api
cd ..

# Run the API
dotnet run --project src/NaknaaErp.Api
```

In Development, the API automatically applies pending migrations and seeds default data on startup.

## API Endpoints

| URL | Description |
|-----|-------------|
| `https://localhost:5001` | HTTPS API base URL |
| `http://localhost:5080` | HTTP API base URL (5080 avoids macOS AirPlay on port 5000) |
| `http://localhost:5080/swagger` | Swagger UI (Development only) |

## Configuration

### JWT Settings

Configure token settings in `appsettings.json`:

```json
"JwtSettings": {
  "Secret": "your-secret-key-min-32-characters",
  "Issuer": "NaknaaErp",
  "Audience": "NaknaaErpClient",
  "AccessTokenExpirationMinutes": 15,
  "RefreshTokenExpirationDays": 7
}
```

### CORS

The `ReactFrontend` policy allows the React frontend to connect. Default origins include `http://localhost:5173`. Add more origins under the `Cors:Origins` array in `appsettings.json`.

## Project Structure

```
backend/
└── src/
    ├── NaknaaErp.Api/           # Web API layer (controllers, middleware)
    ├── NaknaaErp.Application/   # Business logic, DTOs, interfaces
    ├── NaknaaErp.Domain/        # Domain entities and enums
    └── NaknaaErp.Infrastructure/ # EF Core, repositories, services
```

## Default Credentials (Development Seed)

After seeding, use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@naknaa.com | password |

## Frontend Integration

Set the React frontend API base URL to:

```
VITE_API_BASE_URL=http://localhost:5080/api
```

Or for HTTPS:

```
VITE_API_BASE_URL=https://localhost:5001/api
```

> **macOS note:** Port 5000 is often used by AirPlay Receiver. If login returns 403 or the API seems unreachable, use port **5080** (configured in `launchSettings.json`) or disable AirPlay in System Settings → General → AirDrop & Handoff.
