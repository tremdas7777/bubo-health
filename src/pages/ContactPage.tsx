import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import Layout from "@/components/store/Layout";
import PageHead from "@/components/seo/PageHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { toast } from "sonner";

export default function ContactPage() {
  const { config } = useStoreConfig();
  const cleanNumber = config.whatsapp_number?.replace(/\D/g, "") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSending(true);
    // Send via WhatsApp as fallback
    const text = `*Contato via Site*\n\n*Nome:* ${name}\n*E-mail:* ${email}\n*Assunto:* ${subject || "Sem assunto"}\n\n*Mensagem:*\n${message}`;
    if (cleanNumber) {
      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, "_blank");
    }
    toast.success("Redirecionando para o WhatsApp...");
    setSending(false);
  };

  return (
    <Layout>
      <PageHead
        title="Contato | Bazu"
        description="Entre em contato com a Bazu. Atendimento de segunda a sexta, das 08h às 18h."
        canonical="https://snug-code-space.lovable.app/contato"
      />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-heading font-bold mb-2 text-center">Fale Conosco</h1>
        <p className="text-muted-foreground text-center mb-10">
          Estamos aqui para ajudar. Envie sua mensagem ou entre em contato por um dos canais abaixo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-xl p-6 space-y-5">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">E-mail</p>
                  <a href="mailto:cadastrofiscal@escritaonline.cnt.br" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    cadastrofiscal@escritaonline.cnt.br
                  </a>
                </div>
              </div>

              {cleanNumber && (
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">WhatsApp</p>
                    <a href={`https://wa.me/${cleanNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      +{cleanNumber.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "$1 ($2) $3-$4")}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock size={20} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Horário de Atendimento</p>
                  <p className="text-sm text-muted-foreground">Segunda a Sexta: 08h às 18h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Endereço</p>
                  <p className="text-sm text-muted-foreground">
                    Av. Sete de Setembro, 999, Loja 01 – Centro<br />
                    Ipanema – MG, CEP 36950-000
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-6">
              <p className="text-sm font-semibold text-foreground mb-2">Dados da Empresa</p>
              <p className="text-xs text-muted-foreground">Loja Tudo LTDA</p>
              <p className="text-xs text-muted-foreground">CNPJ: 50.301.476/0001-30</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Nome *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">E-mail *</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Assunto</label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: Dúvida sobre produto" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Mensagem *</label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Escreva sua mensagem..." className="mt-1" rows={5} />
            </div>
            <Button type="submit" disabled={sending} className="w-full">
              <Send size={16} className="mr-2" />
              Enviar Mensagem
            </Button>
            {cleanNumber && (
              <a
                href={`https://wa.me/${cleanNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={16} />
                Conversar no WhatsApp
              </a>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
