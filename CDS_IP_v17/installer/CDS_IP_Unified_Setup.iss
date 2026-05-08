; CDS_IP Unified Production Version installer
#define MyAppName "CDS_IP Unified Production"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "OpenAI for Troden Mukwasi"
#define MyAppExeName "CDS_IP_Unified.exe"

[Setup]
AppId={{7D3A0C51-EA4B-4A2C-A9CF-0C8E6AB8B7A1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\CDS_IP Unified Production
DefaultGroupName=CDS_IP Unified Production
UninstallDisplayIcon={app}\{#MyAppExeName}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
OutputDir=Output
OutputBaseFilename=CDS_IP_Unified_Setup
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked

[Files]
Source: "..\dist\CDS_IP_Unified\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\CDS_IP Unified Production"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\CDS_IP Unified Production"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch CDS_IP Unified Production"; Flags: nowait postinstall skipifsilent
