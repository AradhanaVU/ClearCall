# ClearCall Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting ClearCall Application..." -ForegroundColor Green

# Set environment variables
$env:GEMINI_API_KEY = "AIzaSyDZNa-DQDn72j2EyrY4pOsePuj-Y6Iq8ac"
$env:PORT = "5000"

Write-Host "✅ Environment variables set" -ForegroundColor Yellow

# Start backend server
Write-Host "🔧 Starting backend server..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "backend" -WindowStyle Hidden

# Wait a moment for backend to start
Start-Sleep 3

# Start frontend server
Write-Host "🎨 Starting frontend server..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden

# Wait for frontend to start
Start-Sleep 5

Write-Host "🎉 ClearCall is now running!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor White
Write-Host "🤖 AI Insights are now enabled!" -ForegroundColor Magenta

Write-Host "`nPress any key to stop all servers..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop all Node processes
Write-Host "`n🛑 Stopping servers..." -ForegroundColor Red
taskkill /F /IM node.exe
Write-Host "✅ Servers stopped" -ForegroundColor Green
