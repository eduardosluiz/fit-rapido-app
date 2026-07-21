const SUPABASE_URL = "https://occddouiyqvcdhtxpbej.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jY2Rkb3VpeXF2Y2RodHhwYmVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM1NTUzNSwiZXhwIjoyMDc3OTMxNTM1fQ.obQGYM6Uvwzp3J7t49pCY8fz4btkhgpBpLK0gcUj_jM";

async function main() {
  console.log("Fetching treinos from Supabase...");

  try {
    const treinosRes = await fetch(`${SUPABASE_URL}/rest/v1/treinos?select=id,titulo,modalidade_id,created_at`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });
    
    const treinosCategoriasRes = await fetch(`${SUPABASE_URL}/rest/v1/treinos_categorias_categorias_treinos?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    const categoriasRes = await fetch(`${SUPABASE_URL}/rest/v1/categorias_treinos?select=*`, {
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

    const treinos = await treinosRes.json();
    const treinosCategorias = await treinosCategoriasRes.json();
    const categorias = await categoriasRes.json();
    const modalidades = await modRes.json();

    const catMap = {};
    if (Array.isArray(categorias)) {
      for (const c of categorias) catMap[c.id] = c.nome;
    }
    
    const modMap = {};
    if (Array.isArray(modalidades)) {
      for (const m of modalidades) modMap[m.id] = m.nome;
    }

    // Process duplicates
    const counts = {};
    for (const t of treinos) {
      const modNome = modMap[t.modalidade_id];
      if (!modNome || (!modNome.toLowerCase().includes('academia') && !modNome.toLowerCase().includes('em casa'))) {
        continue;
      }

      // Find categories for this treino
      let catIds = [];
      if (Array.isArray(treinosCategorias)) {
        catIds = treinosCategorias
          .filter(tc => tc.treinoId === t.id || tc.treinosId === t.id)
          .map(tc => tc.categoriaTreinoId || tc.categoriasTreinosId);
      }
      
      const catNomes = catIds.map(id => catMap[id] || 'Unknown').sort().join(',');

      // Key for grouping: modalidade + category names + titulo
      const key = `${modNome}::${catNomes}::${t.titulo.trim().toLowerCase()}`;
      if (!counts[key]) counts[key] = { titulo: t.titulo, modalidade: modNome, categorias: catNomes, treinos: [] };
      counts[key].treinos.push(t);
    }

    const duplicatesGrouped = Object.values(counts).filter(c => c.treinos.length > 1);

    console.log(`Encontrei ${duplicatesGrouped.length} grupos de treinos repetidos para deletar.`);

    for (const group of duplicatesGrouped) {
      // Sort by created_at ascending (keep the oldest one)
      group.treinos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      const toKeep = group.treinos[0];
      const toDelete = group.treinos.slice(1);
      
      console.log(`\n- ${group.titulo} (${group.categorias}): Mantendo 1, apagando ${toDelete.length}...`);
      
      for (const t of toDelete) {
        // DELETE request
        const delRes = await fetch(`${SUPABASE_URL}/rest/v1/treinos?id=eq.${t.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          }
        });
        
        if (delRes.ok) {
          console.log(`  > Apagado: ${t.id}`);
        } else {
          console.log(`  > Falha ao apagar ${t.id}: ${delRes.statusText}`);
        }
      }
    }
    
    console.log("Concluído!");

  } catch (err) {
    console.error("Error running script:", err);
  }
}

main();
