@echo off
echo ==========================================
echo  Environment Setup - Playwright + opencart
echo ==========================================

REM Versions pinned to latest stable releases (npm audit clean).
REM xlsx: npm registry copy (0.18.5) has HIGH vulns (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9)
REM       and is no longer published there. Patched build comes from the official SheetJS CDN.

echo [1/8] Installing Playwright test runner...
call npm install -D --save-exact @playwright/test@1.64.1
if errorlevel 1 goto :error

echo [2/8] Installing test data, env vars, date/time handling...
call npm install --save-exact dotenv@18.0.8 luxon@3.7.2
if errorlevel 1 goto :error
call npm install -D --save-exact @faker-js/faker@10.6.0
if errorlevel 1 goto :error

echo [3/8] Installing API / data validation...
call npm install --save-exact ajv@8.20.0
if errorlevel 1 goto :error
call npm install -D --save-exact csv-parse@7.0.3
if errorlevel 1 goto :error
REM npm 12 blocks remote tarballs by default (allow-remote=none); allow it for this one install only.
call npm install -D --save-exact --allow-remote=all https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
if errorlevel 1 goto :error

echo [4/8] Installing accessibility testing (WCAG)...
call npm install --save-exact @axe-core/playwright@4.14.0
if errorlevel 1 goto :error

echo [5/8] Installing Allure reporting...
call npm install -D --save-exact allure-playwright@3.14.0
if errorlevel 1 goto :error

echo [6/8] Installing Node.js TypeScript type definitions...
call npm install -D --save-exact @types/node@26.6.5
if errorlevel 1 goto :error

echo [7/8] Installing MySQL DB validation / DML...
call npm install -D --save-exact mysql2@3.24.6
if errorlevel 1 goto :error

echo [8/8] Installing Playwright browser binaries...
call npx playwright install
if errorlevel 1 goto :error

echo.
echo Running security audit...
call npm audit --audit-level=high
if errorlevel 1 goto :error

echo.
echo ==========================================
echo  Environment setup completed successfully!
echo ==========================================
pause
exit /b 0

:error
echo.
echo ERROR: Setup failed. See output above.
pause
exit /b 1
