@echo off
REM Start the frontend (React) and backend (Express) servers, then launch ngrok for port 3000

REM Start backend in a new window
echo Starting backend server...
start cmd /k "cd /d %~dp0backend && node server.js"

REM Start frontend in a new window
echo Starting frontend (React) server...
start cmd /k "cd /d %~dp0 && npm start"

REM Wait a few seconds for servers to start
ping 127.0.0.1 -n 8 > nul

REM Start ngrok for port 3000
echo Starting ngrok for port 3000...
if exist %~dp0ngrok.exe (
    start cmd /k "%~dp0ngrok.exe http 3000"
) else (
    echo Please download ngrok.exe and place it in the project root folder.
    echo Download from: https://ngrok.com/download
)

pause