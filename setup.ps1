# BITY Project Setup Script
# Run this script from the BITY directory

Write-Host "=== BITY - IoT Crop Quality Assessment & Market Linkage ===" -ForegroundColor Green
Write-Host ""

# Backend setup
Write-Host ">>> Setting up backend..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
npm install --no-audit --no-fund
if ($?) {
    Write-Host "Backend dependencies installed." -ForegroundColor Green
    # Generate Prisma client (requires PostgreSQL running)
    # npx prisma generate
    # npx prisma db push
} else {
    Write-Host "Backend npm install failed." -ForegroundColor Red
}

# Frontend setup
Write-Host ">>> Setting up frontend..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"
npm install --no-audit --no-fund
if ($?) {
    Write-Host "Frontend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "Frontend npm install failed." -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To run the project:"
Write-Host "  1. Start PostgreSQL and update backend\.env if needed"
Write-Host "  2. cd backend && npx prisma generate && npx prisma db push"
Write-Host "  3. cd backend && npm run dev"
Write-Host "  4. cd frontend && npm run dev"
Write-Host "  5. Open http://localhost:3000"
