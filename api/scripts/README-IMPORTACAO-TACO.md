# 📥 Como Importar Dados do TACO

## Pré-requisitos

1. **Baixar arquivo TACO**:
   - Acesse: http://www.nepa.unicamp.br/taco/tabela.php
   - Baixe o arquivo Excel (.xls ou .xlsx)

2. **Instalar dependências**:
   ```bash
   cd api
   npm install xlsx pg dotenv
   ```

## Executar Importação

### Opção 1: Arquivo XLS/XLSX direto

```bash
node scripts/importar-taco.js caminho/para/taco_4_edicao_2011.xls
```

### Opção 2: Converter para CSV primeiro

Se preferir usar CSV:

1. Abra o arquivo Excel no Excel/LibreOffice
2. Salve como CSV (UTF-8)
3. Modifique o script para usar `csv-parser` ao invés de `xlsx`

## Ajustar Mapeamento de Colunas

O script tenta encontrar automaticamente as colunas, mas se o formato do TACO mudar, você pode ajustar no arquivo `importar-taco.js`:

```javascript
const indices = {
  nome: encontrarColuna(headers, 'nome'),
  calorias: encontrarColuna(headers, 'energia'),
  // ... outros campos
};
```

## Verificar Importação

Após importar, verifique no banco:

```sql
SELECT COUNT(*) FROM ingredientes;
SELECT nome, calorias, proteinas FROM ingredientes LIMIT 10;
```

## Troubleshooting

### Erro: "Coluna não encontrada"
- Verifique os headers do arquivo Excel
- Ajuste os nomes de busca no script

### Erro: "Valores inválidos"
- O script ignora linhas sem dados nutricionais válidos
- Verifique o formato numérico do arquivo

### Erro: "Ingrediente já existe"
- O script pula ingredientes duplicados automaticamente
- Para reimportar, delete os ingredientes primeiro ou ajuste o script

