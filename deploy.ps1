Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Building and Deploying to Cloudflare" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

bun run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`nDeploying to Cloudflare Workers (pokeayman)..." -ForegroundColor Green
if (Get-Command bun -ErrorAction SilentlyContinue) {
    bun x wrangler deploy --cwd .output/
} else {
    npx wrangler deploy --cwd .output/
}
