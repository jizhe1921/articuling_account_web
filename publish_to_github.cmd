@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish_to_github.ps1" %*
exit /b %ERRORLEVEL%
