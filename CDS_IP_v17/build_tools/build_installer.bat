@echo off
setlocal
cd /d "%~dp0\.."
if not exist dist\CDS_IP_Unified\CDS_IP_Unified.exe (
  echo EXE not found. Run build_tools\build_exe.bat first.
  exit /b 1
)
set ISCC="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %ISCC% set ISCC="C:\Program Files\Inno Setup 6\ISCC.exe"
if not exist %ISCC% (
  echo Inno Setup 6 not found. Install it first, then rerun this script.
  exit /b 1
)
%ISCC% installer\CDS_IP_Unified_Setup.iss
if errorlevel 1 (
  echo Installer build failed.
  exit /b 1
)
echo.
echo Installer build complete.
echo Output: installer\Output\CDS_IP_Unified_Setup.exe
endlocal
