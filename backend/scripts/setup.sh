#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Starting PostgreSQL (Docker)"
docker compose up -d

echo "==> Restoring packages"
dotnet restore NaknaaErp.sln

echo "==> Creating EF Core migration (if missing)"
if [ ! -d "src/NaknaaErp.Infrastructure/Persistence/Migrations" ]; then
  dotnet ef migrations add InitialCreate \
    --project src/NaknaaErp.Infrastructure/NaknaaErp.Infrastructure.csproj \
    --startup-project src/NaknaaErp.Api/NaknaaErp.Api.csproj \
    --output-dir Persistence/Migrations
fi

echo "==> Applying database migrations"
dotnet ef database update \
  --project src/NaknaaErp.Infrastructure/NaknaaErp.Infrastructure.csproj \
  --startup-project src/NaknaaErp.Api/NaknaaErp.Api.csproj

echo "==> Building solution"
dotnet build NaknaaErp.sln --configuration Release

echo ""
echo "Setup complete."
echo "Run API: dotnet run --project src/NaknaaErp.Api/NaknaaErp.Api.csproj"
echo "Swagger: https://localhost:5001/swagger"
echo "Login: admin@naknaa.com / password"
