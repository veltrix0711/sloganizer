@echo off
echo ===============================================
echo   SLOGANIZER ADMIN UI LAUNCHER
echo ===============================================
echo.
echo Loading admin tools...
echo.

REM Open main admin dashboard
start "" "admin-dashboard.html"

REM Wait a moment then open subscription manager
timeout /t 2 /nobreak >nul
start "" "subscription-manager.html"

REM Wait a moment then open user manager
timeout /t 2 /nobreak >nul
start "" "user-manager.html"

echo.
echo ✅ Admin UI tools opened successfully!
echo.
echo Available tools:
echo - Admin Dashboard (main control panel)
echo - Subscription Manager (manage user subscriptions)
echo - User Manager (view and edit user data)
echo.
echo Press any key to close this window...
pause >nul