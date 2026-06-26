# NakNaa ERP Backend

ASP.NET Core 9 Web API for the NakNaa Electronics ERP and POS system.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Supabase](https://supabase.com/) project (PostgreSQL database)
- EF Core CLI tools:

```bash
dotnet tool install --global dotnet-ef
```

## Database (Supabase)

This project uses **[Supabase](https://supabase.com/)** for PostgreSQL.

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **Project Settings → Database → Connection string**.
3. Click the green **Connect** button → **Session pooler** (port **5432**).  
   Use this if the direct connection fails with IPv6 / “No route to host” on your network.
4. Create a local config file (git-ignored):

```bash
cd backend
cp src/NaknaaErp.Api/appsettings.Development.local.json.example \
   src/NaknaaErp.Api/appsettings.Development.local.json
```

5. Edit `appsettings.Development.local.json` and paste your Supabase credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=aws-0-eu-west-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.cogdmkjlwgkukthgzeoa;Password=YOUR_DATABASE_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
  }
}
```

Alternatively, set environment variables:

```bash
export ConnectionStrings__DefaultConnection="Host=db.xxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
```

Or use the `Supabase` section in `appsettings.Development.json`:

```json
"Supabase": {
  "Host": "db.YOUR_PROJECT_REF.supabase.co",
  "Port": 5432,
  "Database": "postgres",
  "Username": "postgres",
  "Password": "YOUR_DATABASE_PASSWORD"
}
```

> **Authentication:** When `Supabase.JwtSecret` is set in local config, the API validates **Supabase Auth** access tokens and links them to ERP users by email on first login. Leave `JwtSecret` empty to use the built-in JWT login endpoints instead.

### Supabase Auth setup

1. In Supabase Dashboard → **Authentication → Users**, create a user with the same email as an ERP user (e.g. `admin@naknaa.com`).
2. Copy **Project URL** and **anon key** from **Project Settings → API** into the frontend `.env`:
   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Copy the **JWT Secret** from **Project Settings → API → JWT Settings** into `appsettings.Development.local.json`:
   ```json
   "Supabase": {
     "ProjectUrl": "https://YOUR_PROJECT_REF.supabase.co",
     "JwtSecret": "your-jwt-secret",
     "JwtAudience": "authenticated"
   }
   ```
4. Restart the API. On first Supabase login, the ERP user is linked automatically via email.

## Getting Started

From the `backend` directory:

```bash
# One-time setup (migrations + build)
./scripts/setup.sh

# Run the API
dotnet run --project src/NaknaaErp.Api
```

On first run in Development, the API automatically applies migrations and seeds demo data (admin user, sample products, etc.).

## API Endpoints

| URL | Description |
|-----|-------------|
| `http://localhost:5080` | HTTP API base URL (5080 avoids macOS AirPlay on port 5000) |
| `http://localhost:5080/swagger` | Swagger UI (Development only) |

## Configuration

### JWT Settings

Configure token settings in `appsettings.json` or `appsettings.Development.json`.

### CORS

In Development, any `http://localhost:*` origin is allowed. For production, set `Cors:Origins` in `appsettings.json`.

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

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@naknaa.com | password |
| Cashier | cashier.accra@naknaa.com | password |

## Frontend Integration

Set in the project root `.env`:

```
VITE_API_BASE_URL=http://localhost:5080/api
```
