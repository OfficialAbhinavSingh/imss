# IntelliStore Project Startup Script for PowerShell
# Usage: .\START.ps1

Clear-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INTELLISTORE - PROJECT STARTUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will start:" -ForegroundColor Yellow
Write-Host "  1. Backend Server (port 5000)" -ForegroundColor White
Write-Host "  2. Frontend Server (port 3000)" -ForegroundColor White
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  - MongoDB must be running (local or cloud)" -ForegroundColor White
Write-Host "  - Node.js and npm installed" -ForegroundColor White
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "backend\package.json")) {
    Write-Host "ERROR: backend/package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting IntelliStore..." -ForegroundColor Green
Write-Host ""

# Display MongoDB status
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $testConnection = Test-NetConnection localhost -Port 27017 -WarningAction SilentlyContinue
    if ($testConnection.TcpTestSucceeded) {
        Write-Host "✓ MongoDB is accessible on port 27017" -ForegroundColor Green
    }
}
catch {
    Write-Host "Note: MongoDB not detected locally. Using cloud (if configured)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Launching Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; npm run dev`""

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Launching Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"npm run client`""

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STARTUP COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Access your application:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

Write-Host "The application windows have been opened in new terminals." -ForegroundColor White
Write-Host "You can close this window - the servers will keep running." -ForegroundColor White
Write-Host ""

Write-Host "Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Open browser
Write-Host "Opening http://localhost:3000 in your browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Done! Check your browser." -ForegroundColor Green
Read-Host "Press Enter to close this window"
