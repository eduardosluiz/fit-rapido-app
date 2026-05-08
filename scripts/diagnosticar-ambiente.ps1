# Script de Diagnóstico do Ambiente
# Verifica se tudo está configurado corretamente antes de iniciar os servidores

Write-Host "🔍 Diagnosticando ambiente..." -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
    
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -lt 18) {
        Write-Host "   ⚠️  AVISO: Node.js 18+ recomendado. Versão atual: $nodeVersion" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Node.js não encontrado! Instale Node.js 18+ primeiro." -ForegroundColor Red
    exit 1
}

# Verificar npm
Write-Host "📦 Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar PostgreSQL
Write-Host "🐘 Verificando PostgreSQL..." -ForegroundColor Yellow
$postgresRunning = $false
try {
    $postgresService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
    if ($postgresService) {
        $runningService = $postgresService | Where-Object { $_.Status -eq 'Running' }
        if ($runningService) {
            Write-Host "   ✅ PostgreSQL rodando: $($runningService.Name)" -ForegroundColor Green
            $postgresRunning = $true
        } else {
            Write-Host "   ⚠️  PostgreSQL instalado mas não está rodando" -ForegroundColor Yellow
        }
    } else {
        # Tentar verificar por processo
        $postgresProcess = Get-Process -Name postgres -ErrorAction SilentlyContinue
        if ($postgresProcess) {
            Write-Host "   ✅ PostgreSQL rodando (processo encontrado)" -ForegroundColor Green
            $postgresRunning = $true
        } else {
            Write-Host "   ⚠️  PostgreSQL não encontrado ou não está rodando" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ⚠️  Não foi possível verificar PostgreSQL" -ForegroundColor Yellow
}

# Verificar portas
Write-Host "🔌 Verificando portas..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000"
$port3001 = netstat -ano | findstr ":3001"

if ($port3000) {
    Write-Host "   ⚠️  Porta 3000 está em uso (Admin)" -ForegroundColor Yellow
    Write-Host "      Execute: netstat -ano | findstr :3000 para ver o processo" -ForegroundColor Gray
} else {
    Write-Host "   ✅ Porta 3000 disponível (Admin)" -ForegroundColor Green
}

if ($port3001) {
    Write-Host "   ⚠️  Porta 3001 está em uso (API)" -ForegroundColor Yellow
    Write-Host "      Execute: netstat -ano | findstr :3001 para ver o processo" -ForegroundColor Gray
} else {
    Write-Host "   ✅ Porta 3001 disponível (API)" -ForegroundColor Green
}

# Verificar arquivos .env
Write-Host "📄 Verificando arquivos de configuração..." -ForegroundColor Yellow
$apiEnvPath = "api\.env"
$adminEnvPath = "admin\.env.local"

if (Test-Path $apiEnvPath) {
    Write-Host "   ✅ api\.env encontrado" -ForegroundColor Green
    
    # Verificar variáveis importantes
    $envContent = Get-Content $apiEnvPath -Raw
    $requiredVars = @("DATABASE_URL", "PORT", "JWT_SECRET")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var=") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "   ⚠️  Variáveis faltando em api\.env: $($missingVars -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Variáveis essenciais configuradas" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ api\.env NÃO encontrado!" -ForegroundColor Red
    Write-Host "      Crie o arquivo api\.env com as configurações necessárias" -ForegroundColor Gray
}

if (Test-Path $adminEnvPath) {
    Write-Host "   ✅ admin\.env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  admin\.env.local não encontrado (opcional)" -ForegroundColor Yellow
}

# Verificar node_modules
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
if (Test-Path "api\node_modules") {
    Write-Host "   ✅ api\node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  api\node_modules não encontrado. Execute: cd api && npm install" -ForegroundColor Yellow
}

if (Test-Path "admin\node_modules") {
    Write-Host "   ✅ admin\node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  admin\node_modules não encontrado. Execute: cd admin && npm install" -ForegroundColor Yellow
}

# Resumo
Write-Host ""
Write-Host "📊 Resumo do Diagnóstico:" -ForegroundColor Cyan
Write-Host ""

$issues = @()

if (-not $postgresRunning) {
    $issues += "PostgreSQL não está rodando"
}

if ($port3000) {
    $issues += "Porta 3000 em uso"
}

if ($port3001) {
    $issues += "Porta 3001 em uso"
}

if (-not (Test-Path $apiEnvPath)) {
    $issues += "Arquivo api\.env não encontrado"
}

if ($issues.Count -eq 0) {
    Write-Host "✅ Ambiente parece estar configurado corretamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Terminal 1: cd api && npm run start:dev" -ForegroundColor White
    Write-Host "   2. Terminal 2: cd admin && npm run dev" -ForegroundColor White
} else {
    Write-Host "⚠️  Problemas encontrados:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "   - $issue" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "📖 Consulte docs/DIAGNOSTICO-ERROS.md para soluções" -ForegroundColor Cyan
}

Write-Host ""


