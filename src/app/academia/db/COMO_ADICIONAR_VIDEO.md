# Como adicionar um vídeo na Academia

## Passo a passo rápido

### 1️⃣ Escolha a pasta correta
Vá para `src/app/academia/db/` e escolha a pasta da role:
- **TODOS**: Para todos os usuários
- **EMPRESA**: Só para empresas
- **ALUNO_CANDIDATO**: Só para alunos/candidatos
- **INSTRUTOR**: Só para instrutores
- **PEDAGOGICO**: Só para equipe pedagógica
- **ADMIN**: Só para administradores
- **MODERADOR**: Só para moderadores

### 2️⃣ Abra o arquivo correto
- **trilhas.json**: Vídeos de treinamento
- **artigos.json**: Artigos (futuro)
- **tutoriais.json**: Tutoriais (futuro)

### 3️⃣ Faça upload das imagens no Imgur
1. Acesse https://imgur.com
2. Clique em "New post"
3. Faça upload da **capa** do vídeo (imagem 16:9 recomendado)
4. Clique direito na imagem > "Copiar endereço da imagem"
5. Cole no campo `posterUrl`

### 4️⃣ Pegue o embed do YouTube
1. Abra o vídeo no YouTube
2. Clique em "Compartilhar" > "Incorporar"
3. Copie a URL que aparece em `src="..."`
4. Exemplo: `https://www.youtube.com/embed/dQw4w9WgXcQ`
5. Cole no campo `url`

### 5️⃣ Adicione o JSON

```json
{
  "id": "999",
  "title": "Título do seu vídeo",
  "description": "Descrição curta e clara do conteúdo.",
  "url": "https://www.youtube.com/embed/SEU_VIDEO_ID",
  "duration": "12:30",
  "thumbnailUrl": "https://i.imgur.com/SUA_THUMB.jpg",
  "posterUrl": "https://i.imgur.com/SUA_CAPA.jpg",
  "category": "Cursos",
  "module": "gestao-cursos",
  "level": "Iniciante",
  "tags": ["tag1", "tag2", "tag3"],
  "transcript": "Transcrição opcional do vídeo...",
  "isActive": true,
  "createdAt": "2025-12-12T00:00:00.000Z",
  "updatedAt": "2025-12-12T00:00:00.000Z"
}
```

### 6️⃣ Salve e teste
- Salve o arquivo JSON
- Recarregue a página /academia
- O vídeo vai aparecer automaticamente para os usuários com a role correta

## Campos obrigatórios
- ✅ `id`: Único (use número sequencial)
- ✅ `title`: Título do vídeo
- ✅ `description`: Descrição
- ✅ `url`: Link embed do YouTube
- ✅ `duration`: Formato "MM:SS" ou "HH:MM:SS"
- ✅ `category`: "Introdução" | "Cursos" | "Usuários" | "Configurações"
- ✅ `module`: "primeiros-passos" | "gestao-cursos" | "gestao-usuarios" | "configuracoes"
- ✅ `level`: "Iniciante" | "Intermediário" | "Avançado"

## Campos opcionais
- `thumbnailUrl`: Miniatura (se não tiver, usa posterUrl)
- `posterUrl`: Capa do vídeo (recomendado)
- `tags`: Array de palavras-chave
- `transcript`: Transcrição do vídeo
- `isActive`: true/false (padrão: true)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

## Dicas
- Use IDs únicos em todos os JSONs
- Para vídeos longos, divida em partes menores
- Use tags descritivas para facilitar busca futura
- Prefira capas em proporção 16:9 (1920x1080 ou 1280x720)

