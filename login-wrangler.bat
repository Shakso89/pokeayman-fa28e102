@echo off
echo ============================================
echo   Logging in to Cloudflare (Wrangler)
echo ============================================
echo.
echo Opening your browser to authorize Cloudflare...
echo.
call npx.cmd wrangler login
echo.
pause
