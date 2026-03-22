@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo    MindCare OS - Diagnostico de Sistema
echo ==========================================
echo.

echo [1/4] Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do echo   OK: Node.js encontrado (%%i)
) else (
    echo   ERRO: Node.js nao encontrado no PATH!
)

echo.
echo [2/4] Verificando NPM...
where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('npm -v') do echo   OK: NPM encontrado (%%i)
) else (
    echo   ERRO: NPM nao encontrado no PATH!
)

echo.
echo [3/4] Verificando Dependencias...
if exist node_modules (
    echo   OK: Pasta node_modules existe.
) else (
    echo   AVISO: Pasta node_modules nao encontrada.
)

echo.
echo [4/4] Verificando Vite...
if exist node_modules\.bin\vite.cmd (
    echo   OK: Executavel do Vite encontrado.
) else (
    echo   ERRO: Executavel do Vite NAO encontrado.
)

echo.
echo ==========================================
echo Diagnostico concluido.
echo Se houver um ERRO acima, envie um print desta tela.
echo ==========================================
pause
