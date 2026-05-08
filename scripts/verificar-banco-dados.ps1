# Script para verificar e diagnosticar conexão com banco de dados

Write-Host "🔍 Verificando configuração do banco de dados..." -ForegroundColor Cyan
Write-Host ""

# Verificar se arquivo .env existe
$envPath = "api\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Arquivo api\.env não encontrado!" -ForegroundColor Red
    Write-Host "   Crie o arquivo api\.env primeiro." -ForegroundColor Yellow
    exit 1
}

# Ler arquivo .env
Write-Host "📄 Lendo arquivo api\.env..." -ForegroundColor Yellow
$envContent = Get-Content $envPath -Raw

# Extrair DATABASE_URL
if ($envContent -match 'DATABASE_URL\s*=\s*["\']?([^"\'\r\n]+)["\']?') {
    $databaseUrl = $matches[1]
    Write-Host "   ✅ DATABASE_URL encontrado" -ForegroundColor Green
    Write-Host ""
    
    # Analisar tipo de conexão
    Write-Host "🔍 Analisando tipo de conexão..." -ForegroundColor Yellow
    
    if ($databaseUrl -match 'supabase\.co') {
        Write-Host "   📊 Tipo: Supabase (PostgreSQL Online)" -ForegroundColor Cyan
        
        # Extrair informações
        if ($databaseUrl -match 'db\.([^.]+)\.supabase\.co') {
            $projectRef = $matches[1]
            Write-Host "   📋 Project Reference: $projectRef" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "⚠️  Verificando se o projeto Supabase existe..." -ForegroundColor Yellow
        
        # Tentar fazer ping no hostname
        $hostname = ""
        if ($databaseUrl -match '@([^:]+)') {
            $hostname = $matches[1]
            Write-Host "   🌐 Hostname: $hostname" -ForegroundColor Gray
            
            try {
                $result = Test-NetConnection -ComputerName $hostname -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
                if ($result.TcpTestSucceeded) {
                    Write-Host "   ✅ Conexão TCP bem-sucedida na porta 5432" -ForegroundColor Green
                } else {
                    Write-Host "   ❌ Não foi possível conectar na porta 5432" -ForegroundColor Red
                    Write-Host "      Possíveis causas:" -ForegroundColor Yellow
                    Write-Host "      • Projeto Supabase foi deletado ou pausado" -ForegroundColor Gray
                    Write-Host "      • URL está incorreta" -ForegroundColor Gray
                    Write-Host "      • Problemas de conexão de internet" -ForegroundColor Gray
                }
            } catch {
                Write-Host "   ❌ Erro ao testar conexão: $_" -ForegroundColor Red
            }
            
            # Tentar resolver DNS
            try {
                $dnsResult = Resolve-DnsName -Name $hostname -ErrorAction Stop
                Write-Host "   ✅ DNS resolvido corretamente" -ForegroundColor Green
            } catch {
                Write-Host "   ❌ Erro ao resolver DNS: $_" -ForegroundColor Red
                Write-Host "      O hostname '$hostname' não pode ser resolvido." -ForegroundColor Yellow
                Write-Host "      Isso indica que o projeto Supabase pode ter sido deletado." -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "💡 Soluções possíveis:" -ForegroundColor Cyan
        Write-Host "   1. Verificar se o projeto ainda existe em https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "   2. Criar um novo projeto no Supabase e atualizar a URL" -ForegroundColor White
        Write-Host "   3. Usar PostgreSQL local (veja docs/GUIA-POSTGRESQL.md)" -ForegroundColor White
        
    } elseif ($databaseUrl -match 'localhost|127\.0\.0\.1') {
        Write-Host "   📊 Tipo: PostgreSQL Local" -ForegroundColor Cyan
        
        # Extrair informações
        if ($databaseUrl -match '://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
            $user = $matches[1]
            $pass = "***" # Não mostrar senha
            $host = $matches[3]
            $port = $matches[4]
            $database = $matches[5]
            
            Write-Host "   👤 Usuário: $user" -ForegroundColor Gray
            Write-Host "   🗄️  Banco: $database" -ForegroundColor Gray
            Write-Host "   🔌 Host: $host:$port" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "🔍 Verificando PostgreSQL local..." -ForegroundColor Yellow
        
        # Verificar se PostgreSQL está rodando
        $postgresService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
        if ($postgresService) {
            $runningService = $postgresService | Where-Object { $_.Status -eq 'Running' }
            if ($runningService) {
                Write-Host "   ✅ Serviço PostgreSQL está rodando: $($runningService.Name)" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Serviço PostgreSQL encontrado mas não está rodando" -ForegroundColor Yellow
                Write-Host "      Execute: Start-Service -Name '$($postgresService[0].Name)'" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ⚠️  Serviço PostgreSQL não encontrado" -ForegroundColor Yellow
            Write-Host "      Verifique se PostgreSQL está instalado" -ForegroundColor Gray
        }
        
        # Tentar conectar
        Write-Host ""
        Write-Host "🔌 Testando conexão..." -ForegroundColor Yellow
        try {
            if ($databaseUrl -match '://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
                $user = $matches[1]
                $host = $matches[3]
                $port = $matches[4]
                $database = $matches[5]
                
                # Tentar usar psql se disponível
                $psqlAvailable = Get-Command psql -ErrorAction SilentlyContinue
                if ($psqlAvailable) {
                    Write-Host "   ℹ️  Para testar conexão manualmente, execute:" -ForegroundColor Gray
                    Write-Host "      psql -U $user -d $database -h $host -p $port" -ForegroundColor Gray
                } else {
                    Write-Host "   ℹ️  psql não encontrado. Instale PostgreSQL para testar conexão." -ForegroundColor Gray
                }
            }
        } catch {
            Write-Host "   ⚠️  Não foi possível testar conexão automaticamente" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "   📊 Tipo: Outro (provavelmente PostgreSQL remoto)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "📋 URL completa (ocultando senha):" -ForegroundColor Yellow
    $safeUrl = $databaseUrl -replace '://([^:]+):([^@]+)@', '://$1:***@'
    Write-Host "   $safeUrl" -ForegroundColor Gray
    
} else {
    Write-Host "❌ DATABASE_URL não encontrado no arquivo .env!" -ForegroundColor Red
    Write-Host "   Adicione a linha DATABASE_URL no arquivo api\.env" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📚 Documentação:" -ForegroundColor Cyan
Write-Host "   • docs/SOLUCAO-ERRO-SUPABASE.md - Soluções para erro de conexão" -ForegroundColor Gray
Write-Host "   • docs/GUIA-POSTGRESQL.md - Guia completo de configuração" -ForegroundColor Gray
Write-Host "   • docs/GUIA-SUPABASE-RAPIDO.md - Guia rápido do Supabase" -ForegroundColor Gray
Write-Host ""

