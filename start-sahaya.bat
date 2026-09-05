@echo off
title SAHAYA-LAND

start "SAHAYA-LAND Backend" cmd /k "cd /d C:\Users\Afzal\SAHAYA-LAND\backend && call venv\Scripts\activate && uvicorn main:app --reload"

timeout /t 3 /nobreak >nul

start "SAHAYA-LAND Frontend" cmd /k "cd /d C:\Users\Afzal\SAHAYA-LAND\frontend && npm run dev"

timeout /t 5 /nobreak >nul

start http://localhost:5173/

echo SAHAYA-LAND is running.