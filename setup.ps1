# IntelliStore Quick Start PowerShell Script

Write-Host "`n" -ForegroundColor White
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   IntelliStore Project Setup           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "[✓] npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "`nChecking MongoDB..." -ForegroundColor Cyan
$mongod = Get-Command mongod -ErrorAction SilentlyContinue
if ($mongod) {
    Write-Host "[✓] MongoDB found" -ForegroundColor Green
} else {
    Write-Host "[WARNING] MongoDB not found in PATH" -ForegroundColor Yellow
    Write-Host "Please ensure MongoDB is installed and running" -ForegroundColor Yellow
    Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "`nSetting up backend..." -ForegroundColor Cyan
Push-Location backend

if (-Not (Test-Path node_modules)) {
    Write-Host "Installing npm packages..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install npm packages" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[✓] node_modules already exists" -ForegroundColor Green
}

# Create .env if it doesn't exist
if (-Not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Write-Host "Creating .env file..." -ForegroundColor Cyan
        Copy-Item .env.example -Destination .env
        Write-Host "[✓] .env created" -ForegroundColor Green
    }
} else {
    Write-Host "[✓] .env already exists" -ForegroundColor Green
}

Pop-Location

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Setup Complete!                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Run the backend server: npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "`nFor more information, see SETUP_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
