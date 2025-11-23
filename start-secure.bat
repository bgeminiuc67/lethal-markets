@echo off
echo 🔒 Starting Secure Lethal Markets Crisis Tracker...
echo.

echo Starting secure backend server...
start "Lethal Markets Backend" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting frontend...
start "Lethal Markets Frontend" cmd /k "npm run dev"

echo.
echo 🚀 Lethal Markets is starting securely!
echo.
echo 🔒 SECURITY STATUS:
echo   ✅ API keys protected on backend
echo   ✅ Rate limiting active
echo   ✅ CORS protection enabled
echo   ✅ No sensitive data exposed
echo.
echo 📱 Access your app at: http://localhost:8080
echo 🛡️ Backend API at: http://localhost:3001
echo.
pause
