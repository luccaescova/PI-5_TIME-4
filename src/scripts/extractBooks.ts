/**
 * Extrai o dataset do Project Gutenberg (ZIP de ZIPs) para `public/books/<slug>/`
 * e popula o MongoDB com os livros.
 *
 * Cada livro vira: public/books/<slug>/index.html + cover.jpg + images/...
 *
 * Uso:
 *   npm run extract-books
 *
 * Variáveis de env:
 *   BOOKS_ZIP_PATH   caminho absoluto do ZIP master (obrigatório)
 *   PUBLIC_BASE_URL  base usada nas URLs salvas no banco (default http://localhost:4000)
 *   MONGO_URI        conexão Mongo (default mongodb://127.0.0.1:27017/leiturar)
 */

import AdmZip from 'adm-zip';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Book from '../models/Book';

const ZIP_PATH = process.env.BOOKS_ZIP_PATH;
const BASE_URL = (process.env.PUBLIC_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leiturar';
const OUTPUT_DIR = path.resolve(__dirname, '../../public/books');

function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

// extrai título/autor a partir do nome do arquivo no padrão Gutenberg:
//   "<titulo> by <autor> (<gutenberg_id>).zip"
function parseFilename(filename: string): { titulo: string; autor: string; gutenbergId: string } | null {
  const noExt = filename.replace(/\.zip$/i, '');
  const m = noExt.match(/^(.+?)\s+by\s+(.+?)\s*\((\d+)\)\s*$/i);
  if (!m) return null;
  return {
    titulo: m[1].trim(),
    autor: m[2].replace(/\s+/g, ' ').trim(),
    gutenbergId: m[3],
  };
}

async function main() {
  if (!ZIP_PATH) {
    console.error('❌ defina BOOKS_ZIP_PATH no .env (caminho absoluto do ZIP do Gutenberg)');
    process.exit(1);
  }
  if (!fs.existsSync(ZIP_PATH)) {
    console.error(`❌ ZIP não encontrado em: ${ZIP_PATH}`);
    process.exit(1);
  }

  console.log(`📦 abrindo ZIP master: ${ZIP_PATH}`);
  const master = new AdmZip(ZIP_PATH);
  const entries = master.getEntries();

  // pega só os .zip internos (ignora pastas)
  const innerZips = entries.filter(e => !e.isDirectory && /\.zip$/i.test(e.entryName));
  console.log(`📚 encontrados ${innerZips.length} livros no dataset`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  await mongoose.connect(MONGO_URI);
  console.log('✓ conectado ao MongoDB');

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of innerZips) {
    const fileName = path.basename(entry.entryName);
    const parsed = parseFilename(fileName);
    if (!parsed) {
      console.warn(`⚠ pulando (nome não bate o padrão): ${fileName}`);
      skipped++;
      continue;
    }

    const slug = slugify(parsed.titulo).slice(0, 80);
    if (!slug) {
      console.warn(`⚠ pulando (slug vazio após normalizar): ${fileName}`);
      skipped++;
      continue;
    }
    const bookDir = path.join(OUTPUT_DIR, slug);

    try {
      const innerBuffer = entry.getData();
      const innerZip = new AdmZip(innerBuffer);

      if (!fs.existsSync(bookDir)) {
        fs.mkdirSync(bookDir, { recursive: true });
      }

      // extrai todo o conteúdo do ZIP interno na pasta do livro
      innerZip.extractAllTo(bookDir, /* overwrite */ true);

      // localiza o HTML principal (padrão: pgXXXX-images.html)
      const innerEntries = innerZip.getEntries();
      const htmlEntry = innerEntries.find(e => /\.x?html$/i.test(e.entryName) && !e.isDirectory);
      if (!htmlEntry) {
        console.warn(`⚠ sem HTML em ${fileName}, pulando`);
        skipped++;
        continue;
      }

      // garante um index.html pra URL ficar limpa
      const htmlSrcPath = path.join(bookDir, htmlEntry.entryName);
      const indexPath = path.join(bookDir, 'index.html');
      if (htmlSrcPath !== indexPath && fs.existsSync(htmlSrcPath)) {
        fs.copyFileSync(htmlSrcPath, indexPath);
      }

      // localiza a capa
      const coverEntry = innerEntries.find(e =>
        /images\/cover\.(jpe?g|png|webp)$/i.test(e.entryName)
      );
      let coverUrl: string | undefined;
      if (coverEntry) {
        coverUrl = `${BASE_URL}/books-content/${slug}/${coverEntry.entryName.replace(/\\/g, '/')}`;
      }

      const htmlUrl = `${BASE_URL}/books-content/${slug}/index.html`;

      await Book.findByIdAndUpdate(
        slug,
        {
          _id: slug,
          titulo: parsed.titulo,
          autor: parsed.autor,
          coverUrl,
          htmlUrl,
          fonte: 'gutenberg',
        },
        { upsert: true, setDefaultsOnInsert: true }
      );

      console.log(`✓ ${slug.padEnd(50)} — ${parsed.titulo}`);
      ok++;
    } catch (err) {
      console.error(`✗ falhou ${fileName}:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log('\n--- RESUMO ---');
  console.log(`ok:      ${ok}`);
  console.log(`pulados: ${skipped}`);
  console.log(`falhas:  ${failed}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('erro fatal:', err);
  process.exit(1);
});
