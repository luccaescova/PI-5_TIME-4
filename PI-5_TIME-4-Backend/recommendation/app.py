from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://127.0.0.1:27017/leiturar')
client = MongoClient(MONGO_URI)
db = client.get_default_database()


def _recomendar(user_tags: list) -> list:
    """
    Para cada livro no banco, calcula quantas tags do usuário coincidem.
    Retorna os livros com pelo menos 1 tag em comum, ordenados por relevância.
    """
    user_tags_lower = {t.strip().lower() for t in user_tags}
    books = list(db.books.find({}))

    resultado = []
    for book in books:
        book_tags = {t.strip().lower() for t in book.get('tags', [])}
        tags_em_comum = user_tags_lower & book_tags
        score = len(tags_em_comum)

        if score > 0:
            resultado.append({
                '_id': book['_id'],
                'titulo': book['titulo'],
                'autor': book['autor'],
                'tags': book.get('tags', []),
                'score': score,
                'tags_em_comum': sorted(list(tags_em_comum)),
            })

    resultado.sort(key=lambda x: x['score'], reverse=True)
    return resultado


@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json(silent=True)

    if not data or 'tags' not in data:
        return jsonify({'error': 'Informe pelo menos uma tag no campo "tags"'}), 400

    tags = data['tags']
    if not isinstance(tags, list) or len(tags) == 0:
        return jsonify({'error': 'O campo "tags" deve ser uma lista não vazia'}), 400

    recomendacoes = _recomendar(tags)

    return jsonify({
        'tags_selecionadas': tags,
        'total': len(recomendacoes),
        'recomendacoes': recomendacoes,
    })


@app.route('/tags', methods=['GET'])
def list_tags():
    """Retorna todas as tags disponíveis nos livros do banco."""
    books = list(db.books.find({}))
    todas_tags = set()
    for book in books:
        for tag in book.get('tags', []):
            todas_tags.add(tag.strip().lower())

    return jsonify({'tags': sorted(list(todas_tags))})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'ok': True, 'service': 'leiturar-recommendation'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'Serviço de recomendação rodando em http://localhost:{port}')
    app.run(port=port, debug=True)
