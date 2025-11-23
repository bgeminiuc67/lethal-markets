@echo off
echo Starting Chrome with disabled security for API testing...
echo.

REM Try common Chrome installation paths
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\temp\chrome-dev" --disable-web-security --disable-features=VizDisplayCompositor --allow-running-insecure-content http://localhost:8080
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\temp\chrome-dev" --disable-web-security --disable-features=VizDisplayCompositor --allow-running-insecure-content http://localhost:8080
) else (
    echo Chrome not found in standard locations
    echo Please run this command manually:
    echo chrome.exe --user-data-dir="C:\temp\chrome-dev" --disable-web-security --disable-features=VizDisplayCompositor --allow-running-insecure-content http://localhost:8080
    pause
)

echo.
echo Chrome should now open with disabled security
echo Look for a yellow warning bar - this means it's working!
pause
