# Script para limpar e reinstalar tudo
# Use quando tiver problemas com dependências ou cache

Write-Host "🧹 Limpando ambiente..." -ForegroundColor Cyan
Write-Host ""

# Parar processos Node.js
Write-Host "🛑 Parando processos Node.js..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Stop-Process -Name node -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Processos Node.js parados" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "   ℹ️  Nenhum processo Node.js rodando" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Não foi possível parar processos Node.js" -ForegroundColor Yellow
}

# Limpar API
Write-Host ""
Write-Host "📦 Limpando API..." -ForegroundColor Yellow
if (Test-Path "api") {
    Set-Location api
    
    if (Test-Path "node_modules") {
        Write-Host "   Removendo node_modules..." -ForegroundColor Gray
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "dist") {
        Write-Host "   Removendo dist..." -ForegroundColor Gray
        Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Write-Host "   Removendo package-lock.json..." -ForegroundColor Gray
        Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    }
    
    Write-Host "   ✅ API limpa" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "   ⚠️  Pasta api não encontrada" -ForegroundColor Yellow
}

# Limpar Admin
Write-Host ""
Write-Host "📦 Limpando Admin..." -ForegroundColor Yellow
if (Test-Path "admin") {
    Set-Location admin
    
    if (Test-Path "node_modules") {
        Write-Host "   Removendo node_modules..." -ForegroundColor Gray
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    }
    
    if (Test-Path ".next") {
        Write-Host "   Removendo .next..." -ForegroundColor Gray
        Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Write-Host "   Removendo package-lock.json..." -ForegroundColor Gray
        Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "node_modules\.cache") {
        Write-Host "   Removendo cache do Next.js..." -ForegroundColor Gray
        Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
    }
    
    Write-Host "   ✅ Admin limpo" -ForegroundColor Green
    Set-Location ..
} else {
    Write-Host "   ⚠️  Pasta admin não encontrada" -ForegroundColor Yellow
}

# Reinstalar dependências da API
Write-Host ""
Write-Host "📥 Reinstalando dependências da API..." -ForegroundColor Yellow
if (Test-Path "api") {
    Set-Location api
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependências da API instaladas" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erro ao instalar dependências da API" -ForegroundColor Red
    }
    Set-Location ..
} else {
    Write-Host "   ⚠️  Pasta api não encontrada" -ForegroundColor Yellow
}

# Reinstalar dependências do Admin
Write-Host ""
Write-Host "📥 Reinstalando dependências do Admin..." -ForegroundColor Yellow
if (Test-Path "admin") {
    Set-Location admin
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependências do Admin instaladas" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erro ao instalar dependências do Admin" -ForegroundColor Red
    }
    Set-Location ..
} else {
    Write-Host "   ⚠️  Pasta admin não encontrada" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Limpeza e reinstalação concluídas!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Agora você pode iniciar os servidores:" -ForegroundColor Cyan
Write-Host "   1. Terminal 1: cd api && npm run start:dev" -ForegroundColor White
Write-Host "   2. Terminal 2: cd admin && npm run dev" -ForegroundColor White
Write-Host ""


