# 📚 Leiturar – Plataforma de Biblioteca Digital Interativa

## 🧩 Sobre o Projeto

O **Leiturar** é uma plataforma digital que integra **tecnologia e educação**, oferecendo uma **biblioteca online interativa** com funcionalidades voltadas ao **apoio de professores e estudantes**.
Seu objetivo é **democratizar o acesso à leitura** e **facilitar o aprendizado**, com recursos como leitor de PDFs, questões comentadas e acompanhamento de progresso.

---

## 🚀 Objetivos

* Facilitar o acesso à leitura, eliminando barreiras físicas e logísticas.
* Oferecer ferramentas interativas de aprendizado (questões, resumos, marcações).
* Apoiar professores com materiais prontos e acompanhamento do desempenho dos alunos.
* Promover a autonomia do estudante no processo de leitura e estudo.
* Garantir um modelo sustentável e escalável para instituições de ensino.

---

## 🧠 Funcionalidades

### Funcionalidades obrigatórias (MVP)

* 📖 **Leitor de PDF** – leitura online de livros e materiais.
* 👤 **Login/Cadastro de Usuário** – autenticação e controle de acesso.
* 🔍 **Busca por Livros** – pesquisa por título, autor ou tema.
* 🧾 **Módulo de Questões** – perguntas e respostas associadas às obras.
* ✅ **Gabarito de Questões** – correção automática e feedback.

### Funcionalidades desejáveis (Pós-MVP)

* ⭐ **Favoritar Livros**
* ⏩ **Continuar Lendo**
* 💡 **Recomendações de Leitura**
* 🔑 **Recuperação de Senha**
* 🌙 **Modo Noturno / Acessibilidade**

---

## 🧰 Tecnologias Utilizadas

Com base na estrutura de arquivos, o projeto utiliza uma arquitetura de **microserviços** ou **backend dividido**, empregando **duas tecnologias de backend** e um front-end tradicional.

| Camada                            | Tecnologia                    | Função                                                    |
| --------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| **Front-end**                     | HTML, CSS, JavaScript         | Interface do usuário e lógica de apresentação.                      |
| **Back-end Principal**            | **TypeScript/Node.js (Express)**| **Gestão de Usuários, Autenticação, Livros e Rotas principais**.    |
| **Back-end de Correção**          | **Java (Spring Boot)**        | **Servidor exclusivo para a lógica de correção automática de questões.** |
| **Banco de Dados**                | MongoDB Atlas                 | Armazenamento de usuários, livros e questões.                     |
| **Gerenciamento de dependências** | Maven (Java), NPM/Yarn (Node) | Organização e build dos respectivos projetos de backend.            |
| **Design/Protótipo**              | Figma                         | Protótipos de interface e fluxo do usuário.                         |

---

## 🧱 Arquitetura da Solução

A estrutura de pastas reflete a divisão das responsabilidades entre os dois backends e o front-end. O **Server Java** é isolado e atua como um microserviço para a função específica de correção.


```
PI-4-TIME-17-
│
├── 📁 BACKEND/
│   ├── 📁 node_modules/
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   └── seed.ts
│   │   ├── 📁 controllers/
│   │   │   ├── authController.ts
│   │   │   ├── booksController.ts
│   │   │   └── helpController.ts
│   │   ├── 📁 models/          # Definições de schemas (Book, User, etc)
│   │   ├── 📁 routes/          # Definições das rotas da API
│   │   ├── app.ts              # Configuração do Express e Middlewares
│   │   └── index.ts            # Ponto de entrada (Conexão DB e Server)
│   ├── .env                    # Variáveis de ambiente (Portas, MongoDB URI)
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 FRONTEND/
│   └── 📁 pages/
│       ├── 📁 img/             # Capas dos livros e ícones
│       ├── ajuda.html
│       ├── Favoritos.html
│       ├── Login.html
│       ├── menu.html
│       ├── Question.html
│       └── register.html
│
├── package-lock.json           # Dependências de raiz 
└── README.md                   # Documentação do projeto
```

---

## ⚙️ Sistema de Recomendação de Livros por Tags (Python)

O projeto conta com um microserviço em **Python (Flask)** responsável por recomendar livros com base nas preferências do usuário.

### Como funciona

- Cada livro possui uma lista de **tags** (ex: `"romance"`, `"aventura"`, `"clássico"`, `"infantil"`)
- O usuário seleciona uma ou mais tags de interesse
- O sistema retorna os livros que possuem tags em comum, **ordenados por relevância** (quanto mais tags em comum, maior a prioridade)

### Endpoints disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/books/recommend` | Recebe tags e retorna livros recomendados (via backend TS) |
| `GET` | `localhost:5000/tags` | Lista todas as tags disponíveis no banco |
| `GET` | `localhost:5000/health` | Verifica se o serviço Python está rodando |

### Exemplo de requisição

```json
POST /books/recommend
{ "tags": ["romance", "brasileiro"] }
```

```json
{
  "tags_selecionadas": ["romance", "brasileiro"],
  "total": 2,
  "recomendacoes": [
    { "titulo": "Vidas Secas", "score": 2, "tags_em_comum": ["romance", "brasileiro"] },
    { "titulo": "Dom Casmurro", "score": 2, "tags_em_comum": ["romance", "brasileiro"] }
  ]
}
```

### Tags dos livros atuais

| Livro | Tags |
|-------|------|
| O Mágico de Oz | `fantasia`, `aventura`, `clássico`, `domínio público`, `infantil`, `família` |
| Vidas Secas | `romance`, `leitura obrigatória`, `realismo`, `brasileiro`, `drama`, `histórico`, `sertão` |
| Dom Casmurro | `romance`, `leitura obrigatória`, `clássico`, `brasileiro`, `drama`, `ciúme`, `realismo` |

---

## 📦 Importação do Dataset de Livros

O backend agora serve **HTML estático** dos livros (em vez de PDF) para o leitor com sumário lateral. O fluxo tem duas fontes:

1. **Dataset Project Gutenberg** — arquivo `livros_gutenberg_zip.zip` com ~46 livros clássicos em HTML.
2. **3 PDFs em português** já existentes no frontend (`pages/pdfs/dom_casmurro.pdf`, `magico_oz.pdf`, `vidas_secas.pdf`) — convertidos automaticamente para HTML estruturado por capítulos.

### Variáveis de ambiente extras

Adicione ao `.env`:

```bash
# base usada nas URLs salvas no MongoDB (capa + html dos livros)
PUBLIC_BASE_URL=http://localhost:4000

# caminho ABSOLUTO do ZIP do dataset Gutenberg (qualquer pasta local)
BOOKS_ZIP_PATH=C:\caminho\para\livros_gutenberg_zip.zip

# (opcional) caminho da pasta `pages/` do frontend, usado para localizar
# os PDFs e as capas. Default: ../PI-5_TIME-4-Frontend/pages
FRONTEND_PAGES_DIR=C:\caminho\para\PI-5_TIME-4-Frontend\pages
```

### Scripts

```bash
# 1x — descompacta o ZIP do Gutenberg em public/books/<slug>/ e popula o Mongo
npm run extract-books

# 1x — converte os 3 PDFs (dom_casmurro, magico_oz, vidas_secas) em HTML
#      e atualiza os mesmos registros do Mongo com htmlUrl + coverUrl
npm run convert-pdfs
```

Após rodar os dois, a coleção `books` no MongoDB terá ~47 livros com os campos:

| Campo       | Exemplo                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `_id`       | `dom_casmurro`, `dracula`, `the-great-gatsby`                          |
| `titulo`    | `Dom Casmurro`                                                         |
| `autor`     | `Machado de Assis`                                                     |
| `coverUrl`  | `http://localhost:4000/books-content/dom_casmurro/cover.jpg`           |
| `htmlUrl`   | `http://localhost:4000/books-content/dom_casmurro/index.html`          |
| `fonte`     | `gutenberg` ou `pdf-convertido`                                         |

### Endpoint estático

O Express monta os arquivos extraídos em:

```
GET /books-content/<slug>/index.html
GET /books-content/<slug>/cover.jpg
GET /books-content/<slug>/images/...
```

A pasta `public/books/` é gerada localmente pelos scripts acima e está no `.gitignore` (~400MB).

---

## 🧩 Estrutura do Banco de Dados

| Coleção         | Campos principais                                   | Descrição                                  |
| --------------- | --------------------------------------------------- | ------------------------------------------ |
| `usuarios`      | nome, email, senha, favoritos, progresso            | Gerencia perfis e progresso de leitura     |
| `livros`        | título, autor, pdf, tags, resumo                    | Armazena metadados e arquivos de livros    |
| `questoes`      | pergunta, alternativas, resposta_correta, id_livro  | Questões vinculadas aos livros             |
| `respostas`     | id_usuario, id_questao, resposta_usuario, resultado | Histórico de respostas                     |
| `recomendacoes` | id_usuario, histórico                               | Sugestões baseadas em leitura e desempenho |

---

## 🧪 Como Executar o Projeto

### Pré-requisitos

* **Node.js e NPM**
* **Python 3.10+**
* Conta no [MongoDB Atlas](https://www.mongodb.com/atlas)

### Passos

1. Clone o repositório:

   ```bash
   git clone ([https://github.com/luccaescova/PI-4-Time-17-.git](https://github.com/luccaescova/PI-4-Time-17-.git))
   ```
2. **Configuração e Execução do Backend TypeScript (Principal)**:

   a. Acesse a pasta do backend Node.js:
   ```bash
   cd leiturar/BACKEND
   ```

   b. Instale as dependências e configure o arquivo `.env`:
   ```bash
   npm install
   # Exemplo de conteúdo do .env:
   # MONGO_URI=mongodb://127.0.0.1:27017/leiturar
   # PORT=4000
   # JWT_SECRET=alguma_string_aleatoria
   # PUBLIC_BASE_URL=http://localhost:4000
   # BOOKS_ZIP_PATH=C:\caminho\para\livros_gutenberg_zip.zip
   ```
   c. Importe os livros (apenas na primeira execução):
   ```bash
   npm run extract-books   # ~30s, descompacta o dataset Gutenberg
   npm run convert-pdfs    # converte os 3 PDFs em português em HTML
   ```
   d. Execute o servidor:
   ```bash
   npm run dev # ou npm start
   ```

3. **Configuração e Execução do Serviço de Recomendação (Python)**:

   a. Acesse a pasta do serviço:
   ```bash
   cd PI-5_TIME-4-Backend/recommendation
   ```
   b. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
   c. Configure o `.env` com a URI do MongoDB:
   ```bash
   copy .env.example .env
   # Abra o .env e preencha:
   # MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/leiturar
   ```
   d. Execute o serviço (porta 5000):
   ```bash
   python app.py
   ```

4. **Execução do Front-end**:

   a. Acesse a pasta do front-end:
   ```bash
   cd ../../FRONTEND/pages
   ```
   b. Acesse a interface abrindo `Login.html` no navegador.

---

## 🧑‍💻 Equipe de Desenvolvimento

| Nome                               | RA       |
| -----------------------------------| -------- | 
| Felipe Andretta                    | 23007744 | 
| João Victor Lunardini              | 23028241 |
| Kaio Augusto Burilli               | 23020613 |
| Lucca Schroelder Scovini           | 24011609 |
| Paulo Cesar Whitehead Junior       | 24018776 |
| Pedro Henrique Ribeiro Silva Murta | 24015586 | 
---

## 📆 Roadmap

1. ✅ Levantamento de requisitos e ideação
2. 🧩 Definição do MVP e arquitetura
3. ⚙️ Desenvolvimento da IA
4. 💾 Integração com MongoDB
5. 🎨 Implementação do front-end
6. 🧪 Testes e refinamento
7. 🚀 Lançamento do Beta

---

## 📄 Licença

Este projeto é de uso educacional, desenvolvido no contexto da disciplina **Ideação e Validação em Engenharia de Software – PUC-Campinas (2026)**.
Distribuído sob a licença **MIT**.
