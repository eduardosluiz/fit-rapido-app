import os
import csv
from collections import defaultdict
import re

EXTRATOS_DIR = r"C:\Users\User\extratos"

# Dictionary to hold total received by person/entity
received_totals = defaultdict(float)

# Regex to extract name from Nubank transfer description
# Usually looks like: "Transferência recebida pelo Pix - NOME DA PESSOA - CPF/CNPJ..."
# Or "Transferência Recebida - NOME DA PESSOA - CPF/CNPJ..."
def extract_name(description):
    # Only care about transfers
    if not ("Transferência recebida pelo Pix" in description or "Transferência Recebida" in description):
        return None
    
    # Split by ' - '
    parts = description.split(' - ')
    if len(parts) >= 2:
        name = parts[1].strip()
        # Clean up things like "52134575 " at the beginning (if it's an ID)
        name = re.sub(r'^\d+\s+', '', name)
        # Clean up things like " 03032642094" at the end (CPF suffix)
        name = re.sub(r'\s+\d+$', '', name)
        return name.title()
    return None

for filename in os.listdir(EXTRATOS_DIR):
    if filename.endswith(".csv"):
        filepath = os.path.join(EXTRATOS_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    valor = float(row['Valor'])
                except:
                    continue
                
                # We only care about positive values (receipts)
                if valor > 0:
                    name = extract_name(row['Descrição'])
                    if name:
                        received_totals[name] += valor

# Sort by value descending
sorted_totals = sorted(received_totals.items(), key=lambda item: item[1], reverse=True)

print("Relatório de Recebimentos por Pessoa/Empresa")
print("============================================")
total_geral = 0
for name, total in sorted_totals:
    print(f"{name}: R$ {total:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    total_geral += total

print("============================================")
print(f"TOTAL GERAL RECEBIDO: R$ {total_geral:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
