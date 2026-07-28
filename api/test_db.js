const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const res = await pool.query("SELECT nome, descricao, descricao_intermediario FROM treinos_modalidades WHERE nome = 'Academia'");
    if (res.rows.length > 0) {
      console.log("DB DATA:");
      console.log("Descricao:", JSON.stringify(res.rows[0].descricao));
      console.log("Descricao Intermediario:", JSON.stringify(res.rows[0].descricao_intermediario));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
