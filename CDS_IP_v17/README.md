# CDS_IP Unified Production Version

This package provides one unified CDS_IP system for both desktop and web use.
The desktop version is a shell that opens the exact same FastAPI web interface used in the browser, so there are no additions or subtractions between offline and online use.

## What is included
- unified backend (`backend/server.py`)
- shared database (`backend/db.py`)
- shared intake + IP draft interface (`frontend/static/`)
- desktop shell (`desktop/desktop_shell.py`)
- intake template (`templates/IP Intake Template.docx`)
- original IP report template (`templates/IP_Report_Template.docm`)
- working Python merge template (`templates/IP_Report_Template_WORKING.docx`)
- Buliswa sample report (`samples/IP Report for Buliswa Blanchi.docx`)
- PyInstaller spec (`CDS_IP_Unified.spec`)
- Windows EXE build script (`build_tools/build_exe.bat`)
- Inno Setup installer script (`installer/CDS_IP_Unified_Setup.iss`)
- Windows installer build script (`build_tools/build_installer.bat`)

## Default logins
- admin / admin123
- ip1 / ip123
- ip2 / ip123
- ip3 / ip123
- ip4 / ip123
- ip5 / ip123
- ip6 / ip123
- reviewer / review123

## Run from source on Windows
### Desktop
Double-click `RUN_APP_WINDOWS.bat`

### Web
Double-click `RUN_WEB_WINDOWS.bat`
Then open `http://127.0.0.1:8000`

## Build a Windows EXE
1. Extract this package.
2. Install Python 3.12 or 3.13 on Windows.
3. Open the project folder.
4. Run `build_toolsuild_exe.bat`.
5. The EXE folder will be created at `dist\CDS_IP_Unified\`.

## Build a single-click Windows installer
1. Build the EXE first using `build_toolsuild_exe.bat`.
2. Install **Inno Setup 6** on Windows.
3. Run `build_toolsuild_installer.bat`.
4. The installer will be created at `installer\Output\CDS_IP_Unified_Setup.exe`.

## Notes
- Autosave runs while typing and stores snapshots in the database.
- Generated Word reports are tracked per case in the dashboard.
- The desktop shell includes an **Open in Browser** button to open the same system in the browser.
- For network use inside an office, start the web app on the host PC and open `http://HOST_PC_IP:8000` from other PCs on the same network.
- This package is Windows-ready, but the actual `.exe` and `.exe` installer must still be built on a Windows machine.


Download fix in this build:
- generated Intake Reports and IP Draft Reports now appear with both Open and Download actions
- after report generation, the browser automatically starts the file download
