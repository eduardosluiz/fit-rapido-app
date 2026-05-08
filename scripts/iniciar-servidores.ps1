# Script para iniciar os servidores com verificação prévia
# Executa diagnóstico antes de iniciar

Write-Host "🚀 Iniciando servidores Fit & Rápido..." -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos na pasta raiz
if (-not (Test-Path "api") -or -not (Test-Path "admin")) {
    Write-Host "❌ Erro: Execute este script da pasta raiz do projeto!" -ForegroundColor Red
    Write-Host "   Pasta atual: $(Get-Location)" -ForegroundColor Gray
    exit 1
}

# Executar diagnóstico primeiro
Write-Host "🔍 Executando diagnóstico..." -ForegroundColor Yellow
& "$PSScriptRoot\diagnosticar-ambiente.ps1"

Write-Host ""
Write-Host "⏳ Aguardando 3 segundos antes de iniciar..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Verificar se as portas estão livres
$port3000 = netstat -ano | findstr ":3000"
$port3001 = netstat -ano | findstr ":3001"

if ($port3000) {
    Write-Host ""
    Write-Host "⚠️  Porta 3000 já está em uso!" -ForegroundColor Yellow
    $response = Read-Host "   Deseja continuar mesmo assim? (s/N)"
    if ($response -ne "s" -and $response -ne "S") {
        Write-Host "   Operação cancelada." -ForegroundColor Gray
        exit 0
    }
}

if ($port3001) {
    Write-Host ""
    Write-Host "⚠️  Porta 3001 já está em uso!" -ForegroundColor Yellow
    $response = Read-Host "   Deseja continuar mesmo assim? (s/N)"
    if ($response -ne "s" -and $response -ne "S") {
        Write-Host "   Operação cancelada." -ForegroundColor Gray
        exit 0
    }
}

# Verificar se .env existe
if (-not (Test-Path "api\.env")) {
    Write-Host ""
    Write-Host "❌ Arquivo api\.env não encontrado!" -ForegroundColor Red
    Write-Host "   Crie o arquivo api\.env antes de continuar." -ForegroundColor Yellow
    Write-Host "   Consulte docs/INICIAR-SERVIDORES.md para mais informações." -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando servidores em segundo plano..." -ForegroundColor Cyan
Write-Host ""

# Iniciar API em novo terminal
Write-Host "📡 Iniciando API (porta 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\api'; Write-Host '🚀 API Backend - Fit & Rápido' -ForegroundColor Cyan; Write-Host ''; npm run start:dev"

# Aguardar um pouco antes de iniciar o admin
Start-Sleep -Seconds 3

# Iniciar Admin em novo terminal
Write-Host "🖥️  Iniciando Admin (porta 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\admin'; Write-Host '🚀 Admin Frontend - Fit & Rápido' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Informações:" -ForegroundColor Cyan
Write-Host "   • API: http://localhost:3001" -ForegroundColor White
Write-Host "   • Admin: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Dica: Os servidores foram iniciados em janelas separadas." -ForegroundColor Gray
Write-Host "   Para parar, pressione Ctrl+C em cada janela ou feche-as." -ForegroundColor Gray
Write-Host ""


