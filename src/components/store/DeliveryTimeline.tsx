import { ShoppingCart, Package, Gift } from "lucide-react";

interface Props {
  orderDate?: string;
}

export default function DeliveryTimeline({ orderDate }: Props) {
  const today = new Date();
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${day}. ${months[date.getMonth()]}`;
  };

  const paymentDate = today;
  const processingStart = new Date(today);
  processingStart.setDate(today.getDate() + 1);
  const processingEnd = new Date(today);
  processingEnd.setDate(today.getDate() + 2);
  const deliveryStart = new Date(today);
  deliveryStart.setDate(today.getDate() + 15);
  const deliveryEnd = new Date(today);
  deliveryEnd.setDate(today.getDate() + 20);

  return (
    <div className="flex items-center justify-between py-4">
      {/* Step 1 - Payment */}
      <div className="flex flex-col items-center text-center flex-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <ShoppingCart size={20} className="text-primary" />
        </div>
        <p className="text-xs font-semibold">{formatDate(paymentDate)}</p>
        <p className="text-[10px] text-muted-foreground">Pagamento</p>
      </div>

      {/* Connector */}
      <div className="flex-1 h-0.5 bg-primary/20 -mt-6 mx-1" />

      {/* Step 2 - Processing */}
      <div className="flex flex-col items-center text-center flex-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Package size={20} className="text-primary" />
        </div>
        <p className="text-xs font-semibold">{formatDate(processingStart)} - {formatDate(processingEnd)}</p>
        <p className="text-[10px] text-muted-foreground">Pedido pronto</p>
      </div>

      {/* Connector */}
      <div className="flex-1 h-0.5 bg-primary/20 -mt-6 mx-1" />

      {/* Step 3 - Delivery */}
      <div className="flex flex-col items-center text-center flex-1">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Gift size={20} className="text-primary" />
        </div>
        <p className="text-xs font-semibold">{formatDate(deliveryStart)} - {formatDate(deliveryEnd)}</p>
        <p className="text-[10px] text-muted-foreground">Entregue</p>
      </div>
    </div>
  );
}
