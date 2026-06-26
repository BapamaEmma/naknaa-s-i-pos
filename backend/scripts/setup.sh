#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.dotnet/tools:${PATH}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

LOCAL_SETTINGS="src/NaknaaErp.Api/appsettings.Development.local.json"
EXAMPLE_SETTINGS="src/NaknaaErp.Api/appsettings.Development.local.json.example"

if [ ! -f "$LOCAL_SETTINGS" ]; then
  echo "==> Supabase config missing"
  echo "Copy the example file and add your Supabase database password:"
  echo "  cp $EXAMPLE_SETTINGS $LOCAL_SETTINGS"
  echo ""
  echo "Get the connection string from Supabase:"
  echo "  Dashboard → green Connect button → Direct connection (port 5432)"
  exit 1
fi

if grep -q "YOUR_DATABASE_PASSWORD" "$LOCAL_SETTINGS" 2>/dev/null; then
  if [ -z "${ConnectionStrings__DefaultConnection:-}" ] && [ -z "${Supabase__Password:-}" ]; then
    echo "==> Supabase password not configured"
    echo ""
    echo "Your project host is already set. You only need the database password:"
    echo ""
    echo "  1. Supabase → naknaa-s-i-pos → click Connect (top bar)"
    echo "  2. Open Direct connection → Reset database password if needed"
    echo "  3. Edit: $LOCAL_SETTINGS"
    echo "     Replace YOUR_DATABASE_PASSWORD with your password (both places)"
    echo ""
    echo "Or run once in Terminal (replace YOUR_PASSWORD, do not share it):"
    echo '  export ConnectionStrings__DefaultConnection="Host=db.cogdmkjlwgkukthgzeoa.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require"'
    echo "  ./scripts/setup.sh"
    echo ""
    exit 1
  fi
fi

echo "==> Restoring packages"
dotnet restore NaknaaErp.sln

echo "==> Creating EF Core migration (if missing)"
if [ ! -d "src/NaknaaErp.Infrastructure/Persistence/Migrations" ]; then
  dotnet ef migrations add InitialCreate \
    --project src/NaknaaErp.Infrastructure/NaknaaErp.Infrastructure.csproj \
    --startup-project src/NaknaaErp.Api/NaknaaErp.Api.csproj \
    --output-dir Persistence/Migrations
fi

echo "==> Applying database migrations to Supabase"
dotnet ef database update \
  --project src/NaknaaErp.Infrastructure/NaknaaErp.Infrastructure.csproj \
  --startup-project src/NaknaaErp.Api/NaknaaErp.Api.csproj

echo "==> Building solution"
dotnet build NaknaaErp.sln --configuration Release

echo ""
echo "Setup complete."
echo "Run API: dotnet run --project src/NaknaaErp.Api/NaknaaErp.Api.csproj"
echo "Swagger: http://localhost:5080/swagger"
echo "Login: admin@naknaa.com / password"
