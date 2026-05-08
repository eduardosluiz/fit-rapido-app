# 🔧 Corrigir Nomes dos Ingredientes Importados

## Problema

Os ingredientes foram importados com números (10, 11, 12...) ao invés dos nomes reais porque o script estava usando a coluna errada do arquivo TACO.

## ✅ Solução

Execute o script de correção:

```powershell
cd api
node scripts/corrigir-nomes-taco.js "C:\Users\dude_\Downloads\Taco-4a-Edicao.xlsx"
```

Este script vai:
1. ✅ Ler o arquivo TACO novamente
2. ✅ Criar um mapa de números → nomes
3. ✅ Atualizar os nomes no banco de dados
4. ✅ Mostrar um resumo da correção

---

## 🔄 Alternativa: Re-importar Tudo

Se preferir re-importar tudo do zero:

1. **Limpar tabela** (cuidado!):
   ```sql
   TRUNCATE TABLE ingredientes CASCADE;
   ```

2. **Re-executar importação**:
   ```powershell
   node scripts/importar-taco.js "C:\Users\dude_\Downloads\Taco-4a-Edicao.xlsx"
   ```

---

## 📝 Nota

O script de importação (`importar-taco.js`) já foi corrigido para usar a coluna correta (coluna [1] "Descrição dos alimentos") em futuras importações.

