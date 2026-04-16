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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.39-.832-2.564-.143-.245-.475-.245-.748-.245-.215 0-.487.014-.717.014-.244 0-.51.187-.654.323-.272.272-.802.945-.802 2.163 0 .388.058.79.143 1.176.214.86.602 1.633 1.146 2.32 1.418 1.79 3.196 3.39 5.346 4.063.66.215 1.39.387 2.092.387 1.218 0 2.708-.96 2.95-1.86.06-.224.103-.46.103-.696 0-.5-2.422-1.256-2.45-1.256zm-2.92 7.063c-1.762 0-3.48-.487-4.97-1.418l-3.567 1.146 1.16-3.452a9.39 9.39 0 0 1-1.604-5.246c0-5.187 4.222-9.41 9.41-9.41 5.187 0 9.41 4.223 9.41 9.41 0 5.188-4.223 9.41-9.41 9.41zm0-20.717c-6.243 0-11.32 5.078-11.32 11.32a11.226 11.226 0 0 0 1.547 5.706L4 28.945l5.59-1.79a11.272 11.272 0 0 0 5.418 1.39c6.243 0 11.32-5.078 11.32-11.32 0-3.022-1.18-5.864-3.317-8.001a11.21 11.21 0 0 0-7.92-3.318z"/>
      </svg>
    </a>
  );
}
