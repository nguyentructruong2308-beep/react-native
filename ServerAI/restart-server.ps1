# Script tu dong restart Python AI Server
# Chay script nay thay vi restart thu cong

Write-Host "Dang dung Python AI Server..." -ForegroundColor Yellow

# Kill tat ca process Python
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Da dung Python server" -ForegroundColor Green
Write-Host ""
Write-Host "Dang khoi dong lai server..." -ForegroundColor Cyan
Write-Host ""

# Chuyen den thu muc ServerAI
Set-Location "c:\DiDong2\ServerAI"

# Chay lai Python server
python main.py
