# Clerk Authentication Migration Installation Script (PowerShell)
# This script installs required packages and sets up the Clerk authentication system

Write-Host "🔧 Installing Clerk packages..." -ForegroundColor Cyan

# Install Clerk packages
pnpm add @clerk/clerk-react @clerk/themes convex/react-clerk

Write-Host "✅ Packages installed successfully!" -ForegroundColor Green

Write-Host "🔑 Setting up environment variables..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    New-Item -Path ".env" -ItemType File
}

# Add Clerk environment variables if they don't exist
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
if ($envContent -notcontains "*VITE_CLERK_PUBLISHABLE_KEY*") {
    Add-Content -Path ".env" -Value ""
    Add-Content -Path ".env" -Value "# Clerk Authentication"
    Add-Content -Path ".env" -Value "VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here"
    Add-Content -Path ".env" -Value "CLERK_SECRET_KEY=your_clerk_secret_key_here"
    Add-Content -Path ".env" -Value "CLERK_JWT_ISSUER_DOMAIN=your_clerk_issuer_domain_here"
}

Write-Host "📝 Environment variables added to .env file" -ForegroundColor Green
Write-Host ""
Write-Host "🚨 IMPORTANT: Update your .env file with your actual Clerk keys:" -ForegroundColor Red
Write-Host "   1. VITE_CLERK_PUBLISHABLE_KEY - Get from Clerk dashboard"
Write-Host "   2. CLERK_SECRET_KEY - Get from Clerk dashboard"
Write-Host "   3. CLERK_JWT_ISSUER_DOMAIN - Usually https://your-app.clerk.accounts.dev"
Write-Host ""
Write-Host "📖 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update your .env file with Clerk keys"
Write-Host "   2. Run: pnpm run convex:setup"
Write-Host "   3. Follow the CLERK_MIGRATION_GUIDE.md for file replacements"
Write-Host ""
Write-Host "🎉 Installation complete!" -ForegroundColor Green