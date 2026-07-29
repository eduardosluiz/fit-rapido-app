import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { GlossarioService } from '../glossario/glossario.service';

const items = [
  { nome: '✨ Farinha de Aveia', descricao: 'Rica em fibras e nutrientes, ajuda na saciedade e controle do colesterol. Ideal para substituir farinhas refinadas em receitas de pães, bolos e panquecas.' },
  { nome: '✨ Farelo de Aveia', descricao: 'Rico em fibras, auxilia no bom funcionamento intestinal e no controle do açúcar no sangue. Pode ser adicionado a iogurtes, mingaus, bolos e biscoitos.' },
  { nome: '✨ Aveia em Flocos', descricao: 'Versátil, rica em fibras solúveis, ajuda a controlar a glicemia e promove a saciedade. Perfeita para smoothies, mingaus e biscoitos.' },
  { nome: '✨ Farinha de Amêndoas', descricao: 'Sem glúten, rica em proteínas, fibras e gorduras saudáveis. Ótima para bolos, pães e empanados, adicionando sabor adocicado.' },
  { nome: '✨ Chocolate 70% Sem Açúcar', descricao: 'Rico em antioxidantes e com menos açúcar, ajuda a manter o equilíbrio na dieta. Ideal para coberturas de bolos, bombons e doces.' },
  { nome: '✨ Adoçantes (Xilitol, Eritritol, Stevia)', descricao: 'Substituem o açúcar, com baixo índice glicêmico, controlando os níveis de açúcar no sangue. A stevia é natural e sem calorias, ideal para adoçar bebidas e sobremesas.' },
  { nome: '✨ Farinha de Coco', descricao: 'Sem glúten, rica em fibras e gorduras saudáveis, oferece sabor adocicado. Usada em bolos, pães e panquecas, especialmente em receitas sem glúten.' },
  { nome: '✨ Coco Ralado', descricao: 'Adiciona textura e sabor tropical, além de ser rico em fibras e gorduras boas. Perfeito para bolos, pães, granolas e brigadeiros saudáveis.' },
  { nome: '✨ Morangos', descricao: 'Fonte de vitamina C, antioxidantes e fibras, com baixo teor calórico. Usados em smoothies, sobremesas e como cobertura de bolos e panquecas.' },
  { nome: '✨ Tâmaras', descricao: 'Adoçante natural, rico em potássio, ferro e magnésio. Perfeitas para barras de cereais, bolos ou sobremesas saudáveis.' },
  { nome: '✨ Xarope de Tâmara', descricao: 'Alternativa saudável ao mel, adoça smoothies, panquecas e bolos com um sabor doce e rico em nutrientes.' },
  { nome: '✨ Whey Protein', descricao: 'Fonte de proteína de alto valor biológico, essencial para a construção muscular. Usado em smoothies, bolos e panquecas, especialmente após o treino.' },
  { nome: '✨ Óleo de Coco', descricao: 'Contém triglicerídeos de cadeia média, fornecendo energia instantânea e propriedades anti-inflamatórias. Ideal para receitas e como óleo de cozinha.' },
  { nome: '✨ Leite de Coco', descricao: 'Alternativa ao leite animal, rico em gorduras saudáveis e minerais como magnésio e cálcio. Livre de lactose, ideal para intolerantes.' },
  { nome: '✨ Cacau', descricao: 'Rico em flavonoides, antioxidantes que beneficiam a saúde cardiovascular. Usado em bolos, doces e bebidas.' },
  { nome: '✨ Chia e Linhaça', descricao: 'Fontes de ômega-3, fibras e antioxidantes, promovem a saúde cardiovascular e digestiva. Adicionadas a smoothies, pães e bolos.' },
  { nome: '✨ Pasta de Amendoim, Amêndoa e Castanhas', descricao: 'Ricas em gorduras insaturadas e proteínas, ajudam a controlar o apetite. Usadas em pães, bolos e como lanche saudável.' },
  { nome: '✨ Mix de Farinha Sem Glúten', descricao: 'Alternativa saudável para intolerantes ao glúten, rica em proteínas, fibras e micronutrientes, usada em receitas sem glúten.' },
  { nome: '✨ Goma Xantana', descricao: 'Espessante natural, melhora a textura e estrutura de massas sem glúten. Usada em pães, bolos e produtos de panificação sem glúten.' },
  { nome: '✨ Iogurte Natural', descricao: 'Fonte de probióticos, auxilia na saúde intestinal e imunológica. Usado em smoothies, sobremesas e receitas diversas.' },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const glossarioService = app.get(GlossarioService);

  console.log('Iniciando seed de Glossário de Ingredientes...');

  for (const item of items) {
    try {
      await glossarioService.create(item);
      console.log(`Ingrediente "${item.nome}" inserido com sucesso.`);
    } catch (error) {
      if (error.code === '23505') { // Postgres unique violation
        console.log(`Ingrediente "${item.nome}" já existe. Pulando...`);
      } else {
        console.error(`Erro ao inserir "${item.nome}":`, error);
      }
    }
  }

  console.log('Seed concluído!');
  await app.close();
}

bootstrap();
