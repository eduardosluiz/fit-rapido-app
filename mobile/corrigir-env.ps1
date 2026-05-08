# Script para corrigir o arquivo .env do mobile
$envPath = Join-Path $PSScriptRoot ".env"
$content = "EXPO_PUBLIC_API_URL=http://192.168.0.15:3001"

Write-Host "🔧 Corrigindo arquivo .env..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path $envPath) {
    Remove-Item $envPath -Force
    Write-Host "✅ Arquivo .env antigo removido" -ForegroundColor Green
}

$content | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Conteúdo do arquivo:" -ForegroundColor Cyan
Get-Content $envPath
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Reinicie o aplicativo mobile após esta correção!" -ForegroundColor Yellow




