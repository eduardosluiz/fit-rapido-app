process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const client = new Client({ 
  connectionString: 'postgresql://postgres:Fitrapido248622@db.occddouiyqvcdhtxpbej.supabase.co:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'categorias_receitas';"))
  .then(res => { console.log(res.rows); client.end(); })
  .catch(console.error);
