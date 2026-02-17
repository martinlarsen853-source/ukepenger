@echo off
setlocal

REM --- SETTINGS ---
set REPO_DIR=C:\Users\admin\spareapp
set LOG_FILE=%REPO_DIR%\auto-push.log

echo.>> "%LOG_FILE%"
echo ===== %date% %time% =====>> "%LOG_FILE%"

cd /d "%REPO_DIR%" || (
  echo ERROR: Could not cd to repo>> "%LOG_FILE%"
  exit /b 1
)

REM 1) Make sure we are on main
git checkout main >> "%LOG_FILE%" 2>&1

REM 2) Pull first (rebase) to avoid conflicts
git pull --rebase origin main >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo ERROR: git pull --rebase failed>> "%LOG_FILE%"
  exit /b 1
)

REM 3) Stage everything
git add -A >> "%LOG_FILE%" 2>&1

REM 4) If no changes, exit cleanly
git diff --cached --quiet
if %errorlevel%==0 (
  echo No changes to commit.>> "%LOG_FILE%"
  exit /b 0
)

REM 5) Commit with timestamp
set TS=%date% %time%
git commit -m "Auto backup %TS%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo ERROR: git commit failed>> "%LOG_FILE%"
  exit /b 1
)

REM 6) Push
git push origin main >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo ERROR: git push failed>> "%LOG_FILE%"
  exit /b 1
)

echo OK: pushed successfully>> "%LOG_FILE%"
exit /b 0
