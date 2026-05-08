# Script para limpar cache e reiniciar o aplicativo mobile
Write-Host "🧹 Limpando cache do Expo e Metro..." -ForegroundColor Yellow
Write-Host ""

# Parar processos do Metro/Expo se estiverem rodando
Write-Host "1. Parando processos do Metro/Expo..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*metro*" -or $_.CommandLine -like "*expo*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Limpar cache do Expo
Write-Host "2. Limpando cache do Expo..." -ForegroundColor Cyan
if (Test-Path .expo) {
    Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache do Expo removido" -ForegroundColor Green
}

# Limpar cache do Metro (sem iniciar o servidor)
Write-Host "3. Limpando cache do Metro..." -ForegroundColor Cyan
# Limpar cache do watchman
if (Get-Command watchman -ErrorAction SilentlyContinue) {
    watchman watch-del-all 2>&1 | Out-Null
}
# Limpar cache do Metro bundler
if (Test-Path "$env:TEMP\metro-*") {
    Remove-Item -Recurse -Force "$env:TEMP\metro-*" -ErrorAction SilentlyContinue
}
if (Test-Path "$env:TEMP\haste-map-*") {
    Remove-Item -Recurse -Force "$env:TEMP\haste-map-*" -ErrorAction SilentlyContinue
}
Write-Host "   ✅ Cache do Metro limpo" -ForegroundColor Green

# Limpar cache do npm
Write-Host "4. Limpando cache do npm..." -ForegroundColor Cyan
npm cache clean --force 2>&1 | Out-Null
Write-Host "   ✅ Cache do npm limpo" -ForegroundColor Green

# Verificar arquivo .env
Write-Host "5. Verificando arquivo .env..." -ForegroundColor Cyan
if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    Write-Host "   ✅ Arquivo .env encontrado" -ForegroundColor Green
    Write-Host "   Conteúdo: $($envContent.Trim())" -ForegroundColor Gray
    if ($envContent -match "image\.png") {
        Write-Host "   ⚠️  ATENÇÃO: URL ainda contém 'image.png'!" -ForegroundColor Red
        Write-Host "   Corrigindo..." -ForegroundColor Yellow
        "EXPO_PUBLIC_API_URL=http://192.168.0.15:3001" | Out-File -FilePath .env -Encoding utf8 -NoNewline
        Write-Host "   ✅ Arquivo .env corrigido" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Arquivo .env não encontrado! Criando..." -ForegroundColor Yellow
    "EXPO_PUBLIC_API_URL=http://192.168.0.15:3001" | Out-File -FilePath .env -Encoding utf8 -NoNewline
    Write-Host "   ✅ Arquivo .env criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Execute: npm start -- --clear" -ForegroundColor White
Write-Host "   (O --clear garante que o cache será limpo ao iniciar)" -ForegroundColor Gray
Write-Host "2. Pressione 'r' no terminal do Metro para recarregar" -ForegroundColor White
Write-Host "3. Ou agite o dispositivo e toque em 'Reload'" -ForegroundColor White
Write-Host ""
Write-Host "💡 Dica: Se ainda tiver problemas, feche completamente o app" -ForegroundColor Cyan
Write-Host "   e abra novamente após iniciar o Metro bundler." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

