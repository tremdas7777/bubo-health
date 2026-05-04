---
name: no-pix-international
description: Loja Bubo Health é internacional (USD/EUR/GBP) — NUNCA mostrar PIX, R$, ou métodos brasileiros
type: constraint
---
A Bubo Health opera como loja internacional (gringa) com moedas USD/EUR/GBP/BRL e idiomas EN/ES/PT/FR. **NUNCA** exibir PIX como método de pagamento, símbolo R$ hardcoded, "boleto", "Pix" em badges/bandeiras, ou copy em pt-BR fora dos textos i18n. Checkout deve ser apenas cartão (Visa/Mastercard/Amex/Diners/Apple Pay/Google Pay). **Why:** PIX só existe no Brasil e quebra credibilidade para clientes internacionais. **How to apply:** ao criar/editar páginas, sempre usar `formatPrice` do LocalizationContext, copy em inglês ou via i18n, e omitir blocos PIX/desconto-PIX.
