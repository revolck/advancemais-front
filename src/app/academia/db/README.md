# Academia — Banco de dados JSON

Esta pasta contém os **dados estáticos** da Academia, organizados por **role** e **tipo de conteúdo**.

## Estrutura

```
db/
├── TODOS/              # Conteúdo disponível para todas as roles
│   ├── trilhas.json
│   ├── artigos.json
│   └── tutoriais.json
├── EMPRESA/            # Conteúdo específico para empresas
│   ├── trilhas.json
│   ├── artigos.json
│   └── tutoriais.json
├── ALUNO_CANDIDATO/    # Conteúdo específico para alunos/candidatos
│   ├── trilhas.json
│   ├── artigos.json
│   └── tutoriais.json
├── INSTRUTOR/          # Conteúdo específico para instrutores
│   ├── trilhas.json
│   ├── artigos.json
│   └── tutoriais.json
├── PEDAGOGICO/         # Conteúdo específico para equipe pedagógica
│   ├── trilhas.json
│   ├── artigos.json
│   └── tutoriais.json
├── ADMIN/              # Conteúdo específico para administradores
│   ├── trilhas.json
│   ├── artigos.json
│   └── tutoriais.json
└── MODERADOR/          # Conteúdo específico para moderadores
    ├── trilhas.json
    ├── artigos.json
    └── tutoriais.json
```

## Como adicionar novo conteúdo

### 1. Escolha a pasta correta
- **TODOS**: Se o conteúdo é para todos os usuários da plataforma
- **EMPRESA**: Se é específico para gestores de empresas
- **ALUNO_CANDIDATO**: Se é específico para alunos/candidatos
- **INSTRUTOR**: Se é específico para instrutores
- **PEDAGOGICO**: Se é específico para equipe pedagógica
- **ADMIN/MODERADOR**: Se é conteúdo administrativo

### 2. Escolha o tipo de conteúdo
- **trilhas.json**: Vídeos de treinamento (YouTube, Vimeo, etc.)
- **artigos.json**: Artigos escritos (futuro)
- **tutoriais.json**: Tutoriais passo a passo (futuro)

### 3. Adicione o item no JSON

Exemplo para `trilhas.json`:

```json
{
  "id": "9",
  "title": "Como criar uma nova aula",
  "description": "Aprenda a criar e configurar aulas na plataforma.",
  "url": "https://www.youtube.com/embed/SEU_VIDEO_ID",
  "duration": "12:30",
  "thumbnailUrl": "https://i.imgur.com/SUA_IMAGEM.jpg",
  "posterUrl": "https://i.imgur.com/SUA_CAPA.jpg",
  "category": "Cursos",
  "module": "gestao-cursos",
  "level": "Iniciante",
  "tags": ["aulas", "criar", "gestão"],
  "transcript": "Transcrição opcional do vídeo...",
  "isActive": true,
  "createdAt": "2025-12-12T00:00:00.000Z",
  "updatedAt": "2025-12-12T00:00:00.000Z"
}
```

### 4. Upload de imagens (Imgur)
1. Acesse [imgur.com](https://imgur.com)
2. Faça upload da imagem/capa
3. Copie o link direto da imagem (clique direito > "Copiar endereço da imagem")
4. Use nos campos `thumbnailUrl` e `posterUrl`

### 5. Vídeos do YouTube
1. Abra o vídeo no YouTube
2. Clique em "Compartilhar" > "Incorporar"
3. Copie o link do formato: `https://www.youtube.com/embed/VIDEO_ID`
4. Use no campo `url`

## Regras de acesso
- **ADMIN** e **MODERADOR**: veem **tudo** (conteúdo de todas as pastas)
- Outras roles: veem apenas **TODOS** + conteúdo da **sua própria pasta**

## Categorias e Módulos

### Categorias disponíveis:
- `Introdução`: Primeiros passos na plataforma
- `Cursos`: Gestão e criação de cursos
- `Usuários`: Gestão de alunos, instrutores e equipe
- `Configurações`: Ajustes e configurações avançadas

### Módulos disponíveis:
- `primeiros-passos`: Introdução à plataforma
- `gestao-cursos`: Criação e gestão de cursos
- `gestao-usuarios`: Gestão de alunos e equipe
- `configuracoes`: Configurações avançadas

### Níveis disponíveis:
- `Iniciante`: Para quem está começando
- `Intermediário`: Conhecimento intermediário
- `Avançado`: Recursos e configurações avançadas

## Uso no código

```typescript
import { loadContent } from "@/app/academia/db/loader";
import { useUserRole } from "@/hooks/useUserRole";

// Dentro de um componente
const role = useUserRole();
const trilhas = await loadContent(role, "trilhas");
```

