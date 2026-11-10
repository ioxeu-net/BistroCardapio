# BistroCardapio no Cloudflare Pages + D1

Seu site já está em: https://bistrocardapio.pages.dev/

## 1. Criar o banco D1
No dashboard Cloudflare:
Storage & Databases > D1 > Create > nome: bistro-db > Create

## 2. Criar as tabelas
Dentro do bistro-db > Console > cole o conteúdo de schema.sql > Execute
Ou: npx wrangler d1 execute bistro-db --file schema.sql

## 3. Ligar o D1 no Pages
Workers & Pages > bistrocardapio > Settings > Functions > D1 database bindings
Variable name: DB
D1 database: bistro-db
Save + Redeploy

## 4. Subir a API
Copie a pasta functions/ para a raiz do repo BistroCardapio no GitHub, junto com index.html
Deu push, a Cloudflare publica sozinha.

## 5. Testar
https://bistrocardapio.pages.dev/api/health
Tem que responder: {"ok": true, "db": "bistro-db", ...}

## O que muda no site
Hoje o site usa localStorage (cada aparelho tem seus dados).
Com D1, o site passa a buscar em /api/orders, /api/menu, /api/sales
e aí caixa em um celular e cozinha em outro se enxergam de verdade.
