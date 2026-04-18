---
name: instagram-card-template
description: Template padrão de card Instagram 1080x1080 para divulgar produtos da Kazoom
type: preference
---
Quando o usuário pedir "gere card do produto X" / "card pra Instagram", criar PNG 1080x1080 seguindo EXATAMENTE este template:

**Estrutura (top→bottom):**
1. Faixa superior roxa (#5B21B6) com texto "🔥 MAIS VENDIDO DA SEMANA" em verde lima (#A3E635), fonte bold
2. Foto do produto centralizada em fundo cinza claro (#F3F4F6), com padding generoso, cantos arredondados
3. Nome do produto em roxo (#5B21B6) bold, centralizado
4. Preço original riscado em cinza: "De R$ XX,XX"
5. Preço atual GIGANTE em roxo bold: "R$ XX,XX"
6. Linha pequena cinza: "ou R$ XX,XX no PIX" (5% off)
7. Faixa inferior verde lima (#A3E635) com texto roxo bold: "LINK NA BIO • FRETE GRÁTIS • ATÉ 6X"

**Promoções "compre X leve Y":**
Se o nome do produto contém "[COMPRE N, LEVE M]" (ex.: "[COMPRE 2, LEVE 3]"):
- Adicionar selo vermelho (#DC2626) no canto superior esquerdo da foto: "PAGUE N / LEVE M"
- Linha grande vermelha bold abaixo do nome: "PAGUE N, LEVE M"
- Preço exibido = price_cents * N (valor que o cliente realmente paga)
- Preço riscado = price_cents * M (valor cheio dos M itens) com label "(M unid.)"
- PIX = preço exibido * 0.95
- Sublinha PIX: "ou R$ X no PIX • leva M [unidade]"

**Como executar:**
- Usar Python + PIL para compor (não AI image gen)
- Baixar imagem do produto do Supabase storage
- Calcular PIX = price_cents * 0.95
- Buscar dados do produto no Postgres por nome
- Salvar em /mnt/documents/card-{slug}.png e emitir <presentation-artifact>

Cores Kazoom: Roxo #5B21B6, Verde Lima #A3E635, Cinza fundo #F3F4F6
