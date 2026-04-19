# Project Memory

## Core
Store: Kazoom INTERNACIONAL (EN/ES/PT/FR · USD/EUR/GBP/BRL). Base: versatto. Colors: Purple/Lime Green. Light mode default.
Supabase (DB/Auth/Storage). RLS on all tables. Gateway keys protected via service_role.
Gateway: SEMPRE Beehive — nunca trocar active_gateway sem ordem explícita.
NUNCA usar PIX, R$ hardcoded, ou métodos brasileiros — loja é gringa. Checkout = só cartão. Preços em USD cents no DB; sempre via formatPrice do LocalizationContext.
NO AI IMAGES. Professional real photos only for GMC compliance.
No coupon field in checkout — user rejected this feature.

## Memories
- [project/identity](mem://project/identity) — Store identity, base project, and reference store
- [style/visual-design](mem://style/visual-design) — Shopify-inspired design, colors, layouts and banners
- [features/admin-panel](mem://features/admin-panel) — Admin route /admin, edge functions bypassing RLS, cache invalidation
- [tech/backend-stack](mem://tech/backend-stack) — Supabase DB/Auth/Storage structure and React Query
- [tech/marketing-tracking](mem://tech/marketing-tracking) — FB/TikTok/Google pixels, UTMs, Utmify, 50ms polling
- [features/checkout-system](mem://features/checkout-system) — 3-step high conversion checkout, gateways, and Beehive specifics
- [project/business-info](mem://project/business-info) — Company details, CNPJ, and contacts for GMC and SEO
- [features/compliance-seo](mem://features/compliance-seo) — JSON-LD, sitemap, identifier_exists: false, alt tags
- [tech/pricing-logic](mem://tech/pricing-logic) — Pricing module path, PIX discounts and installment calculation
- [features/customer-experience](mem://features/customer-experience) — Wishlist, advanced search, WA abandonment, tracking
- [style/theme-preference](mem://style/theme-preference) — Light mode default, ignore system preference
- [tech/performance](mem://tech/performance) — React.lazy, LCP fetchPriority, async decoding for CLS
- [auth/security](mem://auth/security) — RLS, gateway keys protection, and public ad cloaker config
- [features/product-gallery](mem://features/product-gallery) — Interactive gallery, optional technical views
- [features/product-page-optimization](mem://features/product-page-optimization) — Breadcrumbs, icon bullets, FAQ, urgency triggers
- [features/customer-accounts](mem://features/customer-accounts) — Optional login, Supabase trigger, open checkout auto-link
- [marketing/cloaker-feature](mem://marketing/cloaker-feature) — cloaker_config table toggles visibility for paid ads
- [features/banners](mem://features/banners) — HeroCarousel responsive (9:16 mobile, 16:7 desktop)
- [constraints/product-imagery](mem://constraints/product-imagery) — Strict requirement for real photos, ban on AI-generated images
- [constraints/no-checkout-coupon](mem://constraints/no-checkout-coupon) — No coupon/discount code field in checkout
- [marketing/instagram-card-template](mem://marketing/instagram-card-template) — Template padrão card Instagram 1080x1080 (roxo + lima, "MAIS VENDIDO DA SEMANA")
