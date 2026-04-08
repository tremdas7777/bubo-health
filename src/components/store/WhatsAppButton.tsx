import { MessageCircle } from "lucide-react";
import { useStoreConfig } from "@/hooks/useStoreConfig";

export default function WhatsAppButton() {
  const { config, loading } = useStoreConfig();

  if (loading || !config.whatsapp_number) return null;

  const cleanNumber = config.whatsapp_number.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
      aria-label="Conversar no WhatsApp"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  );
}
