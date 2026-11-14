Set-Location $PSScriptRoot
$env:PATH = "C:\Users\ayman\AppData\Local\Programs\@codebufffreebuff-desktop\resources\bun;" + $env:PATH
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Building and Deploying to Cloudflare" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

bun run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`nDeploying to Cloudflare Workers (pokeayman)..." -ForegroundColor Green
bun run wrangler deploy --cwd .output/
