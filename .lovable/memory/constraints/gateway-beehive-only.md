---
name: gateway-beehive-only
description: Loja Kazoom deve operar SEMPRE com gateway Beehive — nunca trocar para outro
type: constraint
---
A loja Kazoom deve sempre vender usando o gateway **Beehive**. Nunca trocar `active_gateway` para outro valor (centurionpay, pagamentosmp, etc.) sem ordem explícita do usuário. **Why:** Beehive é o único gateway com chaves de produção válidas; trocar quebra o checkout. Se houver linhas duplicadas em `gateway_config`, manter apenas a do Beehive.
