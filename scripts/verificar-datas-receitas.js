const axios = require('axios');

async function verificarDatas() {
  try {
    const idsSemImagem = [
      'ce510e1d-1946-4ef4-938d-5f59760b0905', // Chocolate com Grão-de-Bico (nova)
      'c2f2eed5-54a2-425a-9170-0cc464a7cdc6', // Banana Dourada
      'b7f1e84a-e35e-4546-ac99-53dbdb53d236', // Bolo de Laranja
      '710120c3-c7c3-4a3b-a285-5cca91568c18', // Bolinho de Brócolis
      '48688511-6c26-4611-8250-483929aab43c', // Coxinha Fit
      '70971a3f-c7c2-430d-ae34-4e069448f1e9', // Doce de Leite de Coco
      '02f661a4-daa8-4492-a6f4-b4b74dd94175', // Creme de Castanhas
      '115d9466-df37-4223-8738-fffdcc421d4d', // Molho de Tomate
      '5db812b4-b18f-4e72-9c4f-b34134abc4f1', // Pão de Queijo
      '340c2689-2ce4-4c13-880c-7257ef521421'  // Leite de Coco
    ];

    console.log('\n📅 Verificando datas de criação das receitas sem imagem:\n');
    
    const results = await Promise.all(
      idsSemImagem.map(id => axios.get(`http://localhost:3001/receitas/${id}`))
    );

    results.forEach((response, i) => {
      const rec = response.data;
      const created = new Date(rec.created_at);
      const now = new Date();
      const diffHours = (now - created) / (1000 * 60 * 60);
      const diffDays = diffHours / 24;
      
      console.log(`${i + 1}. ${rec.titulo}`);
      console.log(`   ID: ${rec.id}`);
      console.log(`   Criada: ${created.toLocaleString('pt-BR')}`);
      console.log(`   Há: ${diffHours.toFixed(1)} horas (${diffDays.toFixed(1)} dias)`);
      console.log(`   Sem imagem: ${!rec.imagem_url && (!rec.imagens_url || rec.imagens_url.length === 0) ? 'SIM' : 'NÃO'}`);
      console.log('');
    });

    // Verificar se há receitas duplicadas (mesmo título)
    console.log('\n🔍 Verificando se há receitas duplicadas com o mesmo título:\n');
    const allRecipes = await axios.get('http://localhost:3001/receitas');
    const receitas = allRecipes.data;
    
    const titulos = {};
    receitas.forEach(rec => {
      const tituloLimpo = rec.titulo.replace(/[🍫🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️]/g, '').trim().toLowerCase();
      if (!titulos[tituloLimpo]) {
        titulos[tituloLimpo] = [];
      }
      titulos[tituloLimpo].push({ id: rec.id, titulo: rec.titulo, created_at: rec.created_at, temImagem: !!(rec.imagem_url || (rec.imagens_url && rec.imagens_url.length > 0)) });
    });

    const duplicatas = Object.entries(titulos).filter(([_, recs]) => recs.length > 1);
    if (duplicatas.length > 0) {
      console.log(`⚠️  Encontradas ${duplicatas.length} receitas com títulos duplicados:\n`);
      duplicatas.forEach(([titulo, recs]) => {
        console.log(`Título: ${recs[0].titulo}`);
        recs.forEach((rec, idx) => {
          console.log(`  ${idx + 1}. ID: ${rec.id}`);
          console.log(`     Criada: ${new Date(rec.created_at).toLocaleString('pt-BR')}`);
          console.log(`     Tem imagem: ${rec.temImagem ? 'SIM' : 'NÃO'}`);
        });
        console.log('');
      });
    } else {
      console.log('✅ Nenhuma receita duplicada encontrada.\n');
    }

  } catch (error) {
    console.error('Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

verificarDatas();


