const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('../api/node_modules/dotenv');
const { createClient } = require('../api/node_modules/@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '..', 'api', '.env') });

const outputDir = process.argv[2];
if (!outputDir) {
  throw new Error('Informe o diretório de saída fora do repositório.');
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Credenciais do Supabase Storage não configuradas.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function listFolder(bucket, prefix = '') {
  const entries = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;

    for (const item of data || []) {
      const objectPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) {
        entries.push({
          bucket,
          path: objectPath,
          size: Number(item.metadata?.size || 0),
          mimetype: item.metadata?.mimetype || null,
          etag: item.metadata?.eTag || item.metadata?.etag || null,
          created_at: item.created_at || null,
          updated_at: item.updated_at || null,
        });
      } else {
        entries.push(...await listFolder(bucket, objectPath));
      }
    }

    if (!data || data.length < 1000) break;
    offset += data.length;
  }

  return entries;
}

async function main() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  const objects = [];
  for (const bucket of buckets || []) {
    objects.push(...await listFolder(bucket.name));
  }

  const inventory = {
    generated_at: new Date().toISOString(),
    bucket_count: buckets?.length || 0,
    object_count: objects.length,
    total_bytes: objects.reduce((total, item) => total + item.size, 0),
    buckets: (buckets || []).map(bucket => ({
      id: bucket.id,
      name: bucket.name,
      public: bucket.public,
      file_size_limit: bucket.file_size_limit,
      allowed_mime_types: bucket.allowed_mime_types,
    })),
    objects,
  };

  fs.mkdirSync(outputDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(outputDir, `storage-inventory-${stamp}.json`);
  const body = JSON.stringify(inventory, null, 2);
  fs.writeFileSync(outputPath, body, { encoding: 'utf8', flag: 'wx' });
  const sha256 = crypto.createHash('sha256').update(body).digest('hex');

  process.stdout.write(JSON.stringify({
    outputPath,
    bucketCount: inventory.bucket_count,
    objectCount: inventory.object_count,
    totalBytes: inventory.total_bytes,
    sha256,
  }));
}

main().catch(error => {
  process.stderr.write(`Falha ao gerar inventário: ${error.message}\n`);
  process.exitCode = 1;
});
