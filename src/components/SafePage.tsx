import { Link } from "react-router-dom";
import PageHead from "@/components/seo/PageHead";

export default function SafePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHead
        title="Bubo Health — Bem-estar e Suplementação Nutricional"
        description="Conteúdo educativo sobre vitaminas, suplementação, sono saudável, energia e hábitos de bem-estar. Informações nutricionais para uma vida mais equilibrada."
      />

      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Bubo Health" className="h-8 w-8" />
            <span className="text-lg font-bold">Bubo Health</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#educacional" className="hover:text-foreground">Conteúdo</a>
            <a href="#nutricao" className="hover:text-foreground">Nutrição</a>
            <a href="#bem-estar" className="hover:text-foreground">Bem-estar</a>
            <a href="#contato" className="hover:text-foreground">Contato</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <section className="mb-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-4">
            Portal de Bem-estar
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Informação confiável sobre saúde, nutrição e qualidade de vida
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aqui você encontra artigos educativos sobre suplementação, alimentação equilibrada,
            sono reparador e rotinas saudáveis baseadas em estudos atuais.
          </p>
        </section>

        <section id="educacional" className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Sono e Recuperação",
              text: "Entenda como a qualidade do sono afeta seu humor, sua imunidade e seu desempenho diário.",
            },
            {
              title: "Energia e Disposição",
              text: "Hábitos simples e nutrientes essenciais para combater o cansaço ao longo do dia.",
            },
            {
              title: "Nutrição Funcional",
              text: "O papel das vitaminas e minerais na manutenção de uma vida ativa e equilibrada.",
            },
          ].map((card) => (
            <article key={card.title} className="rounded-xl border border-border p-6 bg-card">
              <h2 className="text-xl font-semibold mb-3">{card.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
            </article>
          ))}
        </section>

        <section id="nutricao" className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Sobre a alimentação consciente</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Uma rotina saudável começa pela escolha dos alimentos certos. Frutas, vegetais,
            proteínas magras e hidratação adequada são pilares fundamentais para o bom
            funcionamento do organismo. A suplementação nutricional pode ser um complemento
            quando a dieta não consegue suprir todas as necessidades diárias.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Sempre consulte um profissional de saúde antes de incluir qualquer suplemento
            ou alterar significativamente sua rotina alimentar. Cada organismo possui
            necessidades únicas que devem ser avaliadas individualmente.
          </p>
        </section>

        <section id="bem-estar" className="mb-16 rounded-xl border border-border p-8 bg-muted/30">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Hábitos para uma vida equilibrada</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>• Durma entre 7 e 9 horas por noite, mantendo horários regulares.</li>
            <li>• Pratique atividade física pelo menos 150 minutos por semana.</li>
            <li>• Mantenha-se hidratado: cerca de 35ml de água por kg de peso corporal.</li>
            <li>• Reserve momentos de descanso mental e contato com a natureza.</li>
            <li>• Evite o uso excessivo de telas antes de dormir.</li>
          </ul>
        </section>

        <section id="contato" className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">Fale conosco</h2>
          <p className="text-muted-foreground mb-4">
            Dúvidas sobre nossos conteúdos? Entre em contato pelo nosso canal oficial.
          </p>
          <a
            href="mailto:contato@bubohealth.com.br"
            className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            contato@bubohealth.com.br
          </a>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Bubo Health — Conteúdo informativo. Não substitui orientação médica.</p>
        </div>
      </footer>
    </div>
  );
}
