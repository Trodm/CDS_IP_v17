@echo off
setlocal
cd /d "%~dp0\.."
if not exist .venv (
  py -m venv .venv
)
call .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -r build_tools\requirements-build.txt
pyinstaller --noconfirm CDS_IP_Unified.spec
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)
echo.
echo EXE build complete.
echo Output: dist\CDS_IP_Unified\CDS_IP_Unified.exe
endlocal
