const SUPABASE_URL = "https://occddouiyqvcdhtxpbej.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jY2Rkb3VpeXF2Y2RodHhwYmVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM1NTUzNSwiZXhwIjoyMDc3OTMxNTM1fQ.obQGYM6Uvwzp3J7t49pCY8fz4btkhgpBpLK0gcUj_jM";

async function main() {
  console.log("Fetching treinos from Supabase...");

  try {
    const treinosRes = await fetch(`${SUPABASE_URL}/rest/v1/treinos?select=id,titulo,modalidade_id`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });
    
    const modRes = await fetch(`${SUPABASE_URL}/rest/v1/treinos_modalidades?select=id,nome`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    if (!treinosRes.ok) {
      throw new Error(`Failed to fetch treinos: ${treinosRes.status} ${treinosRes.statusText}`);
    }
    if (!modRes.ok) {
      throw new Error(`Failed to fetch modalidades: ${modRes.status} ${modRes.statusText}`);
    }

    const treinos = await treinosRes.json();
    const modalidades = await modRes.json();
    const modMap = {};
    for (const m of modalidades) modMap[m.id] = m.nome;
    
    // Process duplicates
    const counts = {};
    for (const t of treinos) {
      const modNome = modMap[t.modalidade_id];
      if (!modNome || (!modNome.toLowerCase().includes('academia') && !modNome.toLowerCase().includes('em casa'))) {
        continue;
      }
      
      const key = `${modNome}::${t.titulo}`;
      if (!counts[key]) counts[key] = { titulo: t.titulo, modalidade: modNome, count: 0, ids: [] };
      counts[key].count++;
      counts[key].ids.push(t.id);
    }

    const duplicates = Object.values(counts).filter(c => c.count > 1).sort((a, b) => b.count - a.count);

    console.log("--- RESULTADOS DE TREINOS REPETIDOS ---");
    console.log(JSON.stringify(duplicates, null, 2));
    if (duplicates.length === 0) {
      console.log("Nenhum treino repetido encontrado.");
    }
  } catch (err) {
    console.error("Error running script:", err);
  }
}

main();
