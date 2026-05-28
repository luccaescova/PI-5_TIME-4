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

## ⚙️ Integração Inteligência Artificial de Recomendação e Integgração ao Gemini

Em Breve...

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

* Java 17+
* Maven
* **Node.js e NPM/Yarn**
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
   b. Instale as dependências e configure o arquivo `.env` com sua URI do MongoDB.
   ```bash
   npm install
   # Exemplo de conteúdo do .env:
   # MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/leiturar
   # PORT=3000
   ```
   c. Execute o servidor (o comando pode variar, mas geralmente é):
   ```bash
   npm run dev # ou npm start
   ```

3. **Execução do Front-end**:

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
