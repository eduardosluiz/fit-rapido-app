const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Fitrapido248622@db.occddouiyqvcdhtxpbej.supabase.co:5432/postgres' });
client.connect().then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'treinos_modalidades'"))
  .then(r => console.log(r.rows))
  .then(() => client.end())
  .catch(console.error);
