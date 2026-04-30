import Book from '../models/Book';
import Question from '../models/Question';
import User from '../models/User';
import bcrypt from 'bcrypt';

export default async function seedDatabase() {
  const ra = '24011609';
  const existingUser = await User.findOne({ ra });

  if (!existingUser) {
    const hash = await bcrypt.hash('123456', 10);
    await User.create({ 
      ra, 
      nome: 'Lucca Scovini', 
      senha: hash,
      email: 'lucca@exemplo.com' // [CORREÇÃO] Adicione esta linha
    });
    console.log('✓ usuário seed criado:', ra);
  } else {
    console.log('usuário seed já existe');
  }

  // cria livro magico_oz
const bookId = 'magico_oz';
  const existingBook = await Book.findById(bookId);
  if (!existingBook) {
    await Book.create({ 
      _id: bookId, 
      titulo: 'O Mágico de Oz', 
      autor: 'L. Frank Baum',
      tags: ['Fantasia', 'Aventura', 'Infantil', 'Jornada'] // <-- ADICIONADO
    });
    console.log('✓ livro seed criado com tags:', bookId);
  }

  // questões do mágico de oz (não duplicar)
  const count = await Question.countDocuments({ idLivro: bookId });
  if (count === 0) {
    const questions = [
      {
        idLivro: bookId,
        pergunta: 'Como Dorothy chega à Terra de Oz?',
        alternativas: [
          'Através de um portal escondido na floresta',
          'Após cair em um poço mágico',
          'Sendo levada por um ciclone junto com sua casa',
          'Seguindo a estrada de tijolos amarelos'
        ],
        correta: 2
      },
      {
        idLivro: bookId,
        pergunta: 'Por que o Espantalho decide acompanhar Dorothy até a Cidade das Esmeraldas?',
        alternativas: [
          'Ele quer fugir da fazenda onde vivia',
          'Ele deseja ganhar um cérebro',
          'Ele precisa salvar sua família',
          'Ele deseja se tornar rei dos Munchkins'
        ],
        correta: 1
      },
      {
        idLivro: bookId,
        pergunta: 'Ao início da história, Dorothy vive no Kansas cinzento. Isso pode ser interpretado como crítica a:',
        alternativas: [
          'À falta de educação entre os moradores do interior',
          'À modernização excessiva das cidades grandes',
          'À pobreza e às condições duras de trabalho das famílias rurais',
          'Ao clima seco do Kansas'
        ],
        correta: 2
      },
      {
        idLivro: bookId,
        pergunta: 'Qual é a reação dos Munchkins ao verem Dorothy pela primeira vez?',
        alternativas: [
          'Acham que ela é uma princesa e pedem ajuda',
          'Ficam com medo porque nunca viram humanos',
          'Acreditam que ela é uma feiticeira que libertou o povo',
          'Pensam que ela veio tomar o lugar da Bruxa Má'
        ],
        correta: 2
      },
      {
        idLivro: bookId,
        pergunta: 'A marca brilhante na testa de Dorothy, deixada pelo beijo da Bruxa do Norte, tem a função de:',
        alternativas: [
          'Torná-la invisível aos inimigos',
          'Identificar Dorothy como rainha do Norte',
          'Proteger Dorothy de qualquer mal',
          'Dar poderes mágicos temporários'
        ],
        correta: 2
      }
    ];

    await Question.insertMany(questions);
    console.log('✓ questões seed inseridas para', bookId);
  } else {
    console.log('questões seed já existem para', bookId);
  }

    // ===== LIVRO: Vidas Secas =====

  const bookId2 = 'vidas_secas';
  const existingBook2 = await Book.findById(bookId2);
  if (!existingBook2) {
    await Book.create({
      _id: bookId2,
      titulo: 'Vidas Secas',
      autor: 'Graciliano Ramos',
      tags: ['Regionalismo', 'Drama', 'Clássico', 'Realismo'] // <-- ADICIONADO
    });
    console.log('✓ livro seed criado com tags:', bookId2);
  }

  // questões de Vidas Secas
  const count2 = await Question.countDocuments({ idLivro: bookId2 });

  if (count2 === 0) {
    const qs2 = [
      {
        idLivro: bookId2,
        pergunta: 'A fuga inicial da família no capítulo “Mudança” simboliza principalmente:',
        alternativas: [
          'A busca por novas oportunidades na cidade grande',
          'A luta contra a seca e a repetição de um ciclo de sofrimento',
          'A tentativa de encontrar parentes distantes',
          'A curiosidade de Fabiano sobre o sertão'
        ],
        correta: 1
      },
      {
        idLivro: bookId2,
        pergunta: 'O tratamento que Fabiano recebe do patrão e do soldado revela uma crítica de Graciliano Ramos a:',
        alternativas: [
          'O excesso de liberdade no sertão',
          'A falta de mão de obra qualificada',
          'A exploração das classes pobres pelo poder econômico e estatal',
          'O despreparo as autoridades diante da seca'
        ],
        correta: 2
      },
      {
        idLivro: bookId2,
        pergunta: 'O capítulo “Baleia”, ao narrar a morte da cadela, tem como efeito principal:',
        alternativas: [
          'Aumentar o suspense sobre a seca',
          'Humanizar o sofrimento e criar empatia com a família',
          'Explicar por que a família tem tantos animais',
          'Mostrar a violência dos meninos contra a cachorra'
        ],
        correta: 1
      },
      {
        idLivro: bookId2,
        pergunta: 'A dureza emocional de Fabiano com a família é explicada por:',
        alternativas: [
          'Falta de amor por Sinhá Vitória',
          'Traumas de infância nunca mencionados',
          'A brutalidade da vida no sertão, que o desumaniza para sobreviver',
          'Seu desejo de viver sozinho'
        ],
        correta: 2
      },
      {
        idLivro: bookId2,
        pergunta: 'Por que a cachorra da família recebeu o nome de “Baleia”?',
        alternativas: [
          'Porque era muito grande e pesada',
          'Porque gostava de nadar nos açudes durante a época de chuva',
          'Porque a cadela era magra e a família usava nomes irônicos para brincar com a realidade dura',
          'Porque Fabiano encontrou a cadela perto de um rio cheio de peixes'
        ],
        correta: 2
      }
    ];

    await Question.insertMany(qs2);
    console.log('✓ questões seed inseridas para', bookId2);

  } else {
    console.log('questões seed já existem para', bookId2);
  }

    // ===== LIVRO: Dom Casmurro =====

  const bookId3 = 'dom_casmurro';
  const existingBook3 = await Book.findById(bookId3);
  if (!existingBook3) {
    await Book.create({
      _id: bookId3,
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      tags: ['Realismo', 'Romance', 'Clássico', 'Análise Psicológica'] // <-- ADICIONADO
    });
    console.log('✓ livro seed criado com tags:', bookId3);
  }

  // questões de Dom Casmurro
  const count3 = await Question.countDocuments({ idLivro: bookId3 });

  if (count3 === 0) {
    const qs3 = [
      {
        idLivro: bookId3,
        pergunta: 'Por que Bentinho recebe o apelido de “Dom Casmurro”?',
        alternativas: [
          'Porque era um jovem muito estudioso',
          'Porque vivia brigando com Capitu',
          'Porque era calado, retraído e evitava conversas',
          'Porque trabalhava como juiz na juventude'
        ],
        correta: 2
      },
      {
        idLivro: bookId3,
        pergunta: 'A forma como José Dias manipula a família de Bentinho revela uma crítica de Machado a:',
        alternativas: [
          'A importância das regras da Igreja',
          'A ingenuidade das crianças',
          'A influência de “agregados” e bajuladores na vida da elite',
          'A vida confortável dos religiosos'
        ],
        correta: 2
      },
      {
        idLivro: bookId3,
        pergunta: 'Uma das marcas mais fortes de Capitu, desde a infância, é:',
        alternativas: [
          'Sua paixão por música clássica',
          'Seu olhar “de ressaca”, profundo e enigmático',
          'Seu desejo de abandonar o bairro',
          'Seu medo de contrariar a mãe'
        ],
        correta: 1
      },
      {
        idLivro: bookId3,
        pergunta: 'A forma como Bentinho se torna “Dom Casmurro” no fim do livro mostra:',
        alternativas: [
          'A superação completa do passado',
          'A aceitação madura da vida conjugal',
          'O isolamento causado pelo ciúme e pela culpa',
          'A vitória sobre Capitu'
        ],
        correta: 2
      },
      {
        idLivro: bookId3,
        pergunta: 'A forma como Capitu é julgada ao longo do romance pode ser interpretada como crítica a:',
        alternativas: [
          'A falta de romance nos casamentos antigos',
          'A rigidez moral e o preconceito contra mulheres inteligentes',
          'A fragilidade da justiça brasileira',
          'A influência da Igreja no casamento'
        ],
        correta: 1
      }
    ];

    await Question.insertMany(qs3);
    console.log('✓ questões seed inseridas para', bookId3);

  } else {
    console.log('questões seed já existem para', bookId3);
  }

}

