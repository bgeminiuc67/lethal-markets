@echo off
echo Setting up Lethal Markets AI Crisis Tracker...
echo.

echo Installing dependencies...
npm install replicate
if %errorlevel% neq 0 (
    echo Failed to install replicate package
    pause
    exit /b 1
)

echo.
echo Starting development server...
npm run dev

pause
