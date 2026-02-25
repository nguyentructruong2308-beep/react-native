@echo off
echo ========================================
echo  RESTART PYTHON AI SERVER
echo ========================================
echo.

echo [1/3] Dang dung Python server...
taskkill /F /IM python.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo      ^> Da dung thanh cong!
) else (
    echo      ^> Khong co Python server nao dang chay
)
echo.

echo [2/3] Doi 2 giay...
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Khoi dong lai server...
cd /d "c:\DiDong2\ServerAI"
echo      ^> Dang chay: python main.py
echo.
echo ========================================
echo  SERVER DANG CHAY
echo ========================================
echo.
echo Hay kiem tra log ben duoi:
echo - Phai thay: "Running on http://0.0.0.0:5000"
echo.
start /B python main.py
echo.
echo Sau khi server chay:
echo 1. Reload app (nhan R)
echo 2. Test gui anh
echo.
pause
