# Documentação Técnica - Contraton

## Arquitetura

### Frontend
- **Framework**: Next.js 15 com App Router
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Estado**: Context API / Zustand (quando necessário)
- **Validação**: Zod + React Hook Form

### Backend
- **API Routes**: Next.js Route Handlers
- **Validação**: Middleware com Zod
- **Autenticação**: A definir
- **Rate Limiting**: Implementar
- **Dados**: Mock data (sem banco de dados inicialmente)

### Segurança
- CSP Headers configurados
- CORS com whitelist
- Input sanitization
- SQL injection prevention
- XSS protection

## Padrões de Código

### Estrutura de Pastas
```
src/
├── app/                 # Rotas e páginas
├── components/          # Componentes reutilizáveis
│   └── ui/              # Shadcn components
│   └── features/         # Componentes de features
├── lib/                 # Utilitários e configurações
│   └── security/        # Funções de segurança
│   └── mock-data/       # Dados mockados
│   └── validations/     # Schemas Zod
├── hooks/               # Custom hooks
└── types/               # TypeScript types
```

### Convenções
- Componentes: PascalCase
- Funções utilitárias: camelCase
- Constantes: UPPER_SNAKE_CASE
- Arquivos: kebab-case

## APIs e Endpoints

### Padrões de API
- Versionamento: /api/v1/
- Autenticação: Bearer token
- Rate limiting: 100 req/min
- CORS: Configurado por endpoint

### Endpoints Públicos
- A definir conforme necessidade (ex: health check, formulário público)

## Mock Data Strategy
Inicialmente o projeto utiliza dados mockados para desenvolvimento rápido:
- Dados armazenados em `/src/lib/mock-data/`
- Simular delays de rede para realismo
- Estrutura preparada para migração futura para banco de dados

## Segurança

### Headers HTTP
Configurados no middleware (CSP, X-Frame-Options, etc.).

### Validações
Toda entrada de dados deve ser validada com Zod antes do processamento.
