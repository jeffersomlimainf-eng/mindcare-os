@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo    Iniciando Servidor Meu Sistema PSI
echo ==========================================
echo.

:: Verifica se a pasta node_modules existe
if not exist node_modules (
    echo [AVISO] Pasta node_modules nao encontrada. 
    echo Tentando instalar dependencias...
    call npm.cmd install
)

echo [INFO] Iniciando o servidor web...
echo [INFO] O navegador deve abrir automaticamente em breve.
echo.

:: Tenta rodar via npx para maior compatibilidade no Windows
call npx.cmd vite

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] O servidor nao conseguiu iniciar.
    echo.
    echo Possiveis causas:
    echo 1. O Node.js nao esta instalado (https://nodejs.org)
    echo 2. Outro programa ja esta usando a porta 5173
    echo.
    echo Tente rodar o arquivo "diagnostico.bat" para mais detalhes.
)

pause

