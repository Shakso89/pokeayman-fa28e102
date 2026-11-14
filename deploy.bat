@echo off
cd /d "%~dp0"
set PATH=C:\Users\ayman\AppData\Local\Programs\@codebufffreebuff-desktop\resources\bun;%PATH%
echo ============================================
echo   Building and Deploying to Cloudflare Workers
echo ============================================

call bun run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Deploying .output to Cloudflare (pokeayman)...
call bun run wrangler deploy --cwd .output/

echo.
echo Deployment finished!
pause
