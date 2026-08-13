const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('../api/node_modules/dotenv');
const { createClient } = require('../api/node_modules/@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '..', 'api', '.env') });

const outputDir = process.argv[2];
if (!outputDir) throw new Error('Informe o diretório de saída.');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function fetchAll(table, columns) {
  const rows = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }

  return rows;
}

function groupByUrl(rows) {
  const groups = new Map();
  for (const row of rows) {
    const url = row.video_url?.trim();
    if (!url) continue;
    const entries = groups.get(url) || [];
    entries.push(row);
    groups.set(url, entries);
  }
  return [...groups.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([video_url, entries]) => ({ video_url, count: entries.length, entries }));
}

function normalizeName(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase();
}

function groupByName(rows) {
  const groups = new Map();
  for (const row of rows) {
    const normalized_name = normalizeName(row.nome);
    if (!normalized_name) continue;
    const entries = groups.get(normalized_name) || [];
    entries.push(row);
    groups.set(normalized_name, entries);
  }
  return [...groups.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([normalized_name, entries]) => ({
      normalized_name,
      count: entries.length,
      distinct_urls: new Set(entries.map(entry => entry.video_url).filter(Boolean)).size,
      entries,
    }));
}

function collectReferences(treinos, url) {
  return treinos.filter(treino => {
    if (treino.video_url === url || treino.video_explicativo_url === url) return true;
    return (treino.exercicios_detalhados || []).some(exercicio =>
      exercicio?.video_url === url || exercicio?.video_explicativo_url === url
    );
  }).map(treino => ({ id: treino.id, titulo: treino.titulo }));
}

async function main() {
  const [library, treinos] = await Promise.all([
    fetchAll('exercicios_biblioteca', 'id,nome,video_url,categoria,createdAt,updatedAt'),
    fetchAll('treinos', 'id,titulo,video_url,video_explicativo_url,exercicios_detalhados'),
  ]);

  const duplicates = groupByUrl(library).map(group => ({
    ...group,
    referenced_by_treinos: collectReferences(treinos, group.video_url),
  }));
  const duplicateNames = groupByName(library);

  const report = {
    generated_at: new Date().toISOString(),
    mode: 'read-only',
    library_records: library.length,
    treino_records: treinos.length,
    duplicate_url_groups: duplicates.length,
    duplicate_records: duplicates.reduce((total, group) => total + group.count, 0),
    duplicate_name_groups: duplicateNames.length,
    duplicate_name_records: duplicateNames.reduce((total, group) => total + group.count, 0),
    duplicates,
    duplicate_names: duplicateNames,
  };

  fs.mkdirSync(outputDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(outputDir, `media-duplicates-${stamp}.json`);
  const body = JSON.stringify(report, null, 2);
  fs.writeFileSync(outputPath, body, { encoding: 'utf8', flag: 'wx' });
  const sha256 = crypto.createHash('sha256').update(body).digest('hex');

  process.stdout.write(JSON.stringify({
    outputPath,
    libraryRecords: report.library_records,
    treinoRecords: report.treino_records,
    duplicateGroups: report.duplicate_url_groups,
    duplicateRecords: report.duplicate_records,
    duplicateNameGroups: report.duplicate_name_groups,
    duplicateNameRecords: report.duplicate_name_records,
    sha256,
  }));
}

main().catch(error => {
  process.stderr.write(`Falha na auditoria: ${error.message}\n`);
  process.exitCode = 1;
});
