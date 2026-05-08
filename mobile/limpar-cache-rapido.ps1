# Script rápido para limpar cache sem travar
Write-Host "🧹 Limpando cache rapidamente..." -ForegroundColor Yellow
Write-Host ""

# Parar processos do Metro/Expo
Write-Host "1. Parando processos..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Limpar cache do Expo
Write-Host "2. Limpando cache do Expo..." -ForegroundColor Cyan
if (Test-Path .expo) {
    Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
    Write-Host "   ✅ Removido" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Não encontrado" -ForegroundColor Gray
}

# Limpar cache do Metro (pastas temporárias)
Write-Host "3. Limpando cache do Metro..." -ForegroundColor Cyan
$metroCache = Get-ChildItem $env:TEMP -Filter "metro-*" -ErrorAction SilentlyContinue
$hasteCache = Get-ChildItem $env:TEMP -Filter "haste-map-*" -ErrorAction SilentlyContinue
if ($metroCache) {
    $metroCache | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache do Metro removido" -ForegroundColor Green
}
if ($hasteCache) {
    $hasteCache | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache do Haste removido" -ForegroundColor Green
}
if (-not $metroCache -and -not $hasteCache) {
    Write-Host "   ℹ️  Nenhum cache encontrado" -ForegroundColor Gray
}

# Verificar/corrigir arquivo .env
Write-Host "4. Verificando arquivo .env..." -ForegroundColor Cyan
if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    if ($envContent -match "image\.png") {
        Write-Host "   ⚠️  Corrigindo URL..." -ForegroundColor Yellow
        "EXPO_PUBLIC_API_URL=http://192.168.0.15:3001" | Out-File -FilePath .env -Encoding utf8 -NoNewline
        Write-Host "   ✅ Corrigido" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Arquivo correto" -ForegroundColor Green
        Write-Host "   Conteúdo: $($envContent.Trim())" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  Criando arquivo .env..." -ForegroundColor Yellow
    "EXPO_PUBLIC_API_URL=http://192.168.0.15:3001" | Out-File -FilePath .env -Encoding utf8 -NoNewline
    Write-Host "   ✅ Criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora execute:" -ForegroundColor Yellow
Write-Host "   npm start -- --clear" -ForegroundColor White
Write-Host ""
Write-Host "O --clear garante que o cache será limpo ao iniciar." -ForegroundColor Gray
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan




