@echo off
title MindCare OS - Deploy Eduzz Webhook
cls

echo =======================================================
echo   MindCare OS - Deploy Eduzz Webhook Edge Function
echo =======================================================
echo.
echo Executando deploy...
echo.

npx supabase functions deploy eduzz-webhook --no-verify-jwt

echo.
echo =======================================================
echo   Concluido! Verifique a URL gerada acima no terminal.
echo   Copie a URL e cole no painel da Eduzz.
echo =======================================================
echo.
pause
