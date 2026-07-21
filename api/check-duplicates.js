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
    
    const treinosCategoriasRes = await fetch(`${SUPABASE_URL}/rest/v1/treinos_categorias_categorias_treino?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    const categoriasRes = await fetch(`${SUPABASE_URL}/rest/v1/categorias_treino?select=*`, {
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
    for (const c of categorias) catMap[c.id] = c.nome;
    const modMap = {};
    for (const m of modalidades) modMap[m.id] = m.nome;

    // Build relations
    for (const t of treinos) {
      t.modalidade = modMap[t.modalidade_id];
      t.categorias = treinosCategorias
        .filter(tc => tc.treinoId === t.id || tc.treinosId === t.id)
        .map(tc => catMap[tc.categoriaTreinoId || tc.categoriasTreinoId]);
    }

    console.log(JSON.stringify(treinos.slice(0, 5), null, 2));

  } catch (err) {
    console.error("Error:", err);
  }
}

main();
