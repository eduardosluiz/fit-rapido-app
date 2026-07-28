const url = "https://occddouiyqvcdhtxpbej.supabase.co/rest/v1/treinos?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jY2Rkb3VpeXF2Y2RodHhwYmVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM1NTUzNSwiZXhwIjoyMDc3OTMxNTM1fQ.obQGYM6Uvwzp3J7t49pCY8fz4btkhgpBpLK0gcUj_jM";

fetch(url, {
  headers: {
    "apikey": key,
    "Authorization": `Bearer ${key}`
  }
}).then(r => r.json()).then(r => {
  if (r.error) console.error(r.error);
  else console.log(`Found ${r.length} treinos.`);
}).catch(console.error);
