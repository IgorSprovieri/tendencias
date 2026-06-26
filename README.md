# Tendencias

Monorepo com [Turborepo](https://turbo.build/), API [NestJS](https://nestjs.com/) e web app [Next.js](https://nextjs.org/).

## Estrutura

```
tendencias/
├── apps/
│   ├── api/    # API NestJS (porta 3001)
│   └── web/    # Web app Next.js (porta 3000)
└── packages/
    └── typescript-config/  # Configurações TypeScript compartilhadas
```

## Pré-requisitos

- Node.js 18+
- pnpm 9+

## Instalação

```bash
pnpm install
```

## Desenvolvimento

Inicia API e web app em paralelo:

```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

## Scripts

| Comando       | Descrição                    |
|---------------|------------------------------|
| `pnpm dev`    | Inicia todos os apps em dev  |
| `pnpm build`  | Build de produção            |
| `pnpm lint`   | Lint em todos os pacotes     |
