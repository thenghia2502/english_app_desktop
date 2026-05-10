@echo off
set "VS_DEV_CMD=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat"
if not exist "%VS_DEV_CMD%" (
	echo [tauri.cmd] Visual Studio developer environment script not found:
	echo [tauri.cmd] %VS_DEV_CMD%
	echo [tauri.cmd] Install Visual Studio Build Tools with C++ workload or adjust scripts\tauri.cmd.
	exit /b 1
)

call "%VS_DEV_CMD%" -arch=x64 -host_arch=x64
set "VS_SCOPE_ROOT=C:\Program Files\Microsoft Visual Studio\2022\Community\SDK\ScopeCppSDK\vc15"

if not exist "%VS_SCOPE_ROOT%\VC\bin\link.exe" (
	echo [tauri.cmd] link.exe not found under:
	echo [tauri.cmd] %VS_SCOPE_ROOT%\VC\bin
	echo [tauri.cmd] Install the Visual C++ build tools or adjust scripts\tauri.cmd.
	exit /b 1
)

set "PATH=%VS_SCOPE_ROOT%\VC\bin;%VS_SCOPE_ROOT%\SDK\bin;%USERPROFILE%\.cargo\bin;%PATH%"
set "LIB=%VS_SCOPE_ROOT%\VC\lib;%VS_SCOPE_ROOT%\SDK\lib;%LIB%"
set "INCLUDE=%VS_SCOPE_ROOT%\VC\include;%VS_SCOPE_ROOT%\SDK\include\shared;%VS_SCOPE_ROOT%\SDK\include\ucrt;%VS_SCOPE_ROOT%\SDK\include\um;%INCLUDE%"

tauri %*