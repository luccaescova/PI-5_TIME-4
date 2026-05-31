/**
 * Atribui tags aos livros do Gutenberg que foram extraídos sem categoria.
 * Todos recebem um conjunto base ('clássico', 'domínio público', 'literatura estrangeira').
 * Livros conhecidos recebem tags específicas de gênero a partir de um mapa curado.
 *
 * Uso:
 *   npm run tag-books
 */

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Book from '../models/Book';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leiturar';

const BASE_TAGS = ['clássico', 'domínio público', 'literatura estrangeira'];

// mapa slug -> tags específicas (gênero/tema)
const TAGS_POR_LIVRO: Record<string, string[]> = {
  'a-room-with-a-view': ['romance', 'drama'],
  'a-tale-of-two-cities': ['histórico', 'drama', 'romance'],
  'alice-s-adventures-in-wonderland': ['infantil', 'fantasia', 'aventura'],
  'an-anthology-of-german-literature': ['poesia', 'antologia'],
  'apologia-pro-vita-sua': ['filosofia', 'religião', 'autobiografia'],
  'color-images-from-mars-rovers': ['ciência', 'não-ficção'],
  'concrete-construction-methods-and-costs': ['técnico', 'não-ficção'],
  'cranford': ['romance', 'drama'],
  'crime-and-punishment': ['drama', 'filosofia', 'realismo'],
  'dracula': ['terror', 'gótico', 'aventura'],
  'expositions-of-holy-scripture': ['religião', 'filosofia'],
  'frankenstein-or-the-modern-prometheus': ['terror', 'ficção científica', 'gótico'],
  'history-of-tom-jones-a-foundling': ['romance', 'aventura', 'drama'],
  'jane-eyre-an-autobiography': ['romance', 'drama', 'autobiografia'],
  'little-women-or-meg-jo-beth-and-amy': ['romance', 'família', 'drama', 'infantil'],
  'middlemarch': ['romance', 'drama', 'realismo'],
  'millionen-der-tod-des-iwan-lande-zwei-novellen': ['drama', 'realismo'],
  'moby-dick-or-the-whale': ['aventura', 'drama'],
  'my-life-volume-1': ['autobiografia', 'música'],
  'pride-and-prejudice': ['romance', 'drama'],
  'romeo-and-juliet': ['romance', 'drama', 'teatro', 'tragédia'],
  'sammtliche-werke-5-dramatische-werke': ['teatro', 'drama'],
  'the-2006-cia-world-factbook': ['não-ficção', 'referência'],
  'the-adventures-of-ferdinand-count-fathom-complete': ['aventura', 'drama'],
  'the-adventures-of-roderick-random': ['aventura', 'drama'],
  'the-adventures-of-sherlock-holmes': ['mistério', 'detetive', 'aventura'],
  'the-adventures-of-tom-sawyer-complete': ['aventura', 'infantil', 'família'],
  'the-blue-castle-a-novel': ['romance', 'drama'],
  'the-book-of-the-national-parks': ['não-ficção', 'natureza'],
  'the-brothers-karamazov': ['drama', 'filosofia', 'realismo'],
  'the-city-of-god-volume-i': ['religião', 'filosofia'],
  'the-complete-works-of-william-shakespeare': ['teatro', 'drama', 'poesia'],
  'the-count-of-monte-cristo': ['aventura', 'histórico', 'drama'],
  'the-enchanted-april': ['romance', 'drama'],
  'the-expedition-of-humphry-clinker': ['aventura', 'drama', 'comédia'],
  'the-great-gatsby': ['romance', 'drama'],
  'the-king-in-yellow': ['terror', 'fantasia'],
  'the-picture-of-dorian-gray': ['terror', 'gótico', 'drama'],
  'the-strange-case-of-dr-jekyll-and-mr-hyde': ['terror', 'gótico', 'ficção científica'],
  'the-works-of-mr-george-gillespie-vol-1-of-2': ['religião', 'filosofia'],
  'thus-spake-zarathustra-a-book-for-all-and-none': ['filosofia'],
  'twenty-years-after': ['aventura', 'histórico', 'drama'],
  'war-and-peace': ['histórico', 'drama', 'romance', 'realismo'],
  'wuthering-heights': ['romance', 'drama', 'gótico'],
};

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('[OK] conectado ao MongoDB');

  const todos = await Book.find({}).lean();
  console.log(`encontrados ${todos.length} livros no banco`);

  let atualizados = 0;
  let semMapaEspecifico = 0;

  for (const b of todos as Array<{ _id: string; fonte?: string; tags?: string[] }>) {
    // livros que vieram dos PDFs (dom_casmurro, magico_oz, vidas_secas) já têm tags do seed
    if (b.fonte !== 'gutenberg') continue;

    const especificas = TAGS_POR_LIVRO[b._id] || [];
    if (especificas.length === 0) semMapaEspecifico++;

    // combina e dedup
    const tags = Array.from(new Set([...BASE_TAGS, ...especificas]));

    await Book.updateOne({ _id: b._id }, { $set: { tags } });
    atualizados++;
  }

  console.log(`atualizados: ${atualizados}`);
  if (semMapaEspecifico > 0) {
    console.log(`(${semMapaEspecifico} ficaram só com as tags base — sem mapa específico)`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('erro:', err);
  process.exit(1);
});
