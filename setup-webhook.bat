@echo off
title Meu Sistema PSI - Setup Webhook
cls

echo =======================================================
echo   Meu Sistema PSI - Setup Webhook (Login e Link)
echo =======================================================
echo.

echo [Passo 1] Fazendo Login no Supabase...
echo -------------------------------------------------------
echo.
echo (Isso abrira uma aba no seu navegador. Clique em "Authorize").
echo.
call npx supabase login

echo.
echo =======================================================
echo [Passo 2] Vinculando o projeto...
echo -------------------------------------------------------
echo.
echo (Se pedir a senha do banco de dados, digite-a).
echo.
call npx supabase link --project-ref rwqiptuxjnnuoolxslio

echo.
echo =======================================================
echo   TUDO PRONTO! 
echo   Agora de duplo-clique no arquivo 'deploy-webhook.bat'
echo =======================================================
echo.
pause

