/**
 * Converte os 3 PDFs do frontend (dom_casmurro, magico_oz, vidas_secas)
 * em HTML estruturado por capítulos e copia a capa correspondente.
 *
 * Saída: public/books/<id>/index.html + cover.jpg, e atualiza MongoDB
 * setando htmlUrl + coverUrl + fonte = 'pdf-convertido'.
 *
 * Uso:
 *   npm run convert-pdfs
 *
 * Env opcional:
 *   FRONTEND_PAGES_DIR  caminho absoluto da pasta `pages/` do frontend
 *                       (default: ../../PI-5_TIME-4-Frontend/pages)
 */

// Polyfills mínimos para o pdfjs-dist (dep do pdf-parse v2) no Node >= 20
// — só precisamos extrair texto, não renderizar, então stubs vazios bastam.
const g = globalThis as any;
if (typeof g.DOMMatrix === 'undefined') {
  g.DOMMatrix = class DOMMatrix {
    constructor() {}
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    invertSelf() { return this; }
    transformPoint(p: any) { return p; }
  };
}
if (typeof g.ImageData === 'undefined') {
  g.ImageData = class ImageData {
    constructor(public data: any, public width: number, public height: number) {}
  };
}
if (typeof g.Path2D === 'undefined') {
  g.Path2D = class Path2D {};
}

import { PDFParse } from 'pdf-parse';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Book from '../models/Book';

const FRONTEND_PAGES = process.env.FRONTEND_PAGES_DIR
  || path.resolve(__dirname, '../../../PI-5_TIME-4-Frontend/pages');
const PDFS_DIR = path.join(FRONTEND_PAGES, 'pdfs');
const COVERS_DIR = path.join(FRONTEND_PAGES, 'img');
const OUTPUT_DIR = path.resolve(__dirname, '../../public/books');
const BASE_URL = (process.env.PUBLIC_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leiturar';

const BOOKS = [
  { id: 'dom_casmurro', titulo: 'Dom Casmurro', autor: 'Machado de Assis' },
  { id: 'magico_oz', titulo: 'O Mágico de Oz', autor: 'L. Frank Baum' },
  { id: 'vidas_secas', titulo: 'Vidas Secas', autor: 'Graciliano Ramos' },
];

// PDFs com texto em letras espaçadas (ex: "C A PÍ T U LO V II")
// — \s? entre cada letra permite zero ou um espaço.
// — usamos apenas [IVXLC] (sem D e M) porque "D" é a primeira letra de muitos
//   títulos de capítulo em Machado ("Do título", "Do livro"…) e libros com
//   menos de 1000 capítulos não precisam de D/M.
const CHAPTER_RE = /C\s?A\s?P\s?[IÍ]\s?T\s?U\s?L\s?O\s+([IVXLC]+(?:\s+[IVXLC]+)*|\d+)/gi;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as Record<string, string>)[c]
  );
}

function cleanText(text: string): string {
  // junta palavras quebradas no fim da linha por hifenização
  text = text.replace(/(\w)-\n([a-záéíóúâêôãõçñ])/g, '$1$2');

  // remove cabeçalhos/rodapés típicos: "MACHADO DE ASSIS • 21 •", "• 21 •", números soltos
  const lines = text.split('\n').filter(line => {
    const l = line.trim();
    if (!l) return true; // preserva blank lines
    if (/^•\s*\d+\s*•$/.test(l)) return false;
    if (/^\s*\d+\s*$/.test(l) && l.length <= 4) return false;
    if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ\s.]+•\s*\d+\s*•$/.test(l)) return false;
    return true;
  });
  return lines.join('\n');
}

interface Chapter {
  numero: string;
  titulo: string;
  paragraphs: string[];
}

function parseChapters(text: string): Chapter[] {
  const chapters: Chapter[] = [];
  const matches = [...text.matchAll(CHAPTER_RE)];
  if (matches.length === 0) return chapters;

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = m.index! + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const numero = m[1].replace(/\s+/g, '');

    const block = text.slice(start, end).trim();
    const nonEmptyLines = block.split('\n').map(l => l.trim()).filter(l => l);
    const titulo = nonEmptyLines[0] || `Capítulo ${numero}`;
    const bodyLines = nonEmptyLines.slice(1);

    // Detecção pragmática de parágrafos:
    //  - linha começando com '—' (em-dash) inicia fala/parágrafo
    //  - linha começando com maiúscula APÓS uma linha anterior terminada
    //    em '.', '!' ou '?' inicia novo parágrafo
    //  - resto é continuação da linha anterior (junta com espaço)
    const paragraphs: string[] = [];
    let current = '';
    const endsSentence = (s: string) => /[.!?]["”’)]?\s*$/.test(s);
    const startsNewPara = (line: string, prev: string) => {
      if (line.startsWith('—')) return true;
      if (!prev) return true;
      if (endsSentence(prev) && /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ"“(]/.test(line)) return true;
      return false;
    };

    for (const line of bodyLines) {
      if (startsNewPara(line, current)) {
        if (current) paragraphs.push(current.replace(/\s+/g, ' ').trim());
        current = line;
      } else {
        current = current ? current + ' ' + line : line;
      }
    }
    if (current) paragraphs.push(current.replace(/\s+/g, ' ').trim());

    chapters.push({ numero, titulo, paragraphs: paragraphs.filter(p => p.length > 0) });
  }
  return chapters;
}

function buildHtml(book: typeof BOOKS[0], chapters: Chapter[]): string {
  const chaptersHtml = chapters.map((ch, idx) => {
    const anchorId = `chap${String(idx + 1).padStart(2, '0')}`;
    const paras = ch.paragraphs.map(p => `    <p>${escapeHtml(p)}</p>`).join('\n');
    return `<div class="chapter">
  <h2><a id="${anchorId}"></a>Capítulo ${escapeHtml(ch.numero)} — ${escapeHtml(ch.titulo)}</h2>
${paras}
</div>`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${escapeHtml(book.titulo)} — ${escapeHtml(book.autor)}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; max-width: 760px; margin: 40px auto; padding: 0 24px; line-height: 1.65; color: #222; background: #fff; }
  h1 { text-align: center; font-size: 28px; margin-bottom: 0.3em; }
  h1 + p { text-align: center; font-style: italic; margin-top: 0; }
  h2 { margin-top: 3em; text-align: center; font-size: 20px; font-weight: bold; }
  .chapter { padding-top: 0.5em; border-top: 1px solid #eee; }
  .chapter:first-of-type { border-top: none; }
  p { text-align: justify; margin: 0 0 1em; text-indent: 1.6em; }
</style>
</head>
<body>
<h1>${escapeHtml(book.titulo)}</h1>
<p>por ${escapeHtml(book.autor)}</p>
${chaptersHtml}
</body>
</html>`;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('[OK] conectado ao MongoDB');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const book of BOOKS) {
    const pdfPath = path.join(PDFS_DIR, `${book.id}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      console.warn(`[AVISO] pulando ${book.id}: PDF não encontrado em ${pdfPath}`);
      continue;
    }

    console.log(`\nconvertendo ${book.titulo}...`);
    const buf = fs.readFileSync(pdfPath);
    const result = await new PDFParse({ data: buf }).getText();

    const rawText = result.pages.map((p: { text?: string }) => p.text || '').join('\n\n');
    const cleaned = cleanText(rawText);
    let chapters = parseChapters(cleaned);

    if (chapters.length === 0) {
      console.warn(`[AVISO] ${book.id}: nenhum capítulo detectado, gerando texto único`);
      chapters = [{
        numero: '1',
        titulo: book.titulo,
        paragraphs: cleaned
          .split(/\n\s*\n/)
          .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
          .filter(p => p.length > 30),
      }];
    }

    const totalParas = chapters.reduce((s, c) => s + c.paragraphs.length, 0);
    console.log(`   ${chapters.length} capítulos, ${totalParas} parágrafos`);

    const bookDir = path.join(OUTPUT_DIR, book.id);
    if (!fs.existsSync(bookDir)) fs.mkdirSync(bookDir, { recursive: true });

    fs.writeFileSync(path.join(bookDir, 'index.html'), buildHtml(book, chapters));

    // copia a capa do frontend para o backend
    let coverUrl: string | undefined;
    const coverSrc = path.join(COVERS_DIR, `${book.id}.jpg`);
    if (fs.existsSync(coverSrc)) {
      fs.copyFileSync(coverSrc, path.join(bookDir, 'cover.jpg'));
      coverUrl = `${BASE_URL}/books-content/${book.id}/cover.jpg`;
    }

    const htmlUrl = `${BASE_URL}/books-content/${book.id}/index.html`;
    await Book.updateOne(
      { _id: book.id },
      { $set: { coverUrl, htmlUrl, fonte: 'pdf-convertido' } }
    );
    console.log(`[OK] ${book.id}: HTML pronto + Mongo atualizado`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('erro fatal:', err);
  process.exit(1);
});
