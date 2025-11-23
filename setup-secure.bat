@echo off
echo 🔒 Setting up Secure Lethal Markets Crisis Tracker...
echo.

echo Installing frontend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Installing secure backend dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete! 
echo.
echo 🔒 SECURITY FEATURES ENABLED:
echo   - API keys hidden on backend server
echo   - Rate limiting (10 requests per 15 minutes)
echo   - CORS protection
echo   - Helmet security headers
echo   - No sensitive data in frontend
echo.
echo 🚀 TO START THE SECURE APP:
echo   1. Start backend: npm run dev (in server folder)
echo   2. Start frontend: npm run dev (in main folder)
echo.
pause
