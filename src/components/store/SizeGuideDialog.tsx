import { Ruler } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SizeRow {
  size: string;
  chest: number;
  sleeve: number;
  length: number;
}

interface Props {
  rows?: SizeRow[];
  triggerLabel?: string;
}

const DEFAULT_ROWS: SizeRow[] = [
  { size: "PP", chest: 106, sleeve: 20, length: 72 },
  { size: "P", chest: 112, sleeve: 21, length: 74 },
  { size: "M", chest: 118, sleeve: 22, length: 76 },
  { size: "G", chest: 124, sleeve: 23, length: 78 },
  { size: "GG", chest: 132, sleeve: 24, length: 80 },
  { size: "3G", chest: 140, sleeve: 25, length: 82 },
  { size: "4G", chest: 148, sleeve: 26, length: 84 },
  { size: "5G", chest: 156, sleeve: 27, length: 86 },
];

export default function SizeGuideDialog({ rows = DEFAULT_ROWS, triggerLabel = "Tabela de medidas" }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          <Ruler size={14} />
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-serif">
            Escolha seu tamanho ideal na tabela abaixo
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            Medidas em centímetros (cm). Recomendamos medir uma peça que já te serve bem para comparar.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-xs uppercase tracking-wider">Tamanho</TableHead>
                <TableHead className="text-center text-xs uppercase tracking-wider">Peito</TableHead>
                <TableHead className="text-center text-xs uppercase tracking-wider">Manga</TableHead>
                <TableHead className="text-center text-xs uppercase tracking-wider">Comprimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.size}>
                  <TableCell className="text-center font-semibold">{r.size}</TableCell>
                  <TableCell className="text-center">{r.chest}</TableCell>
                  <TableCell className="text-center">{r.sleeve}</TableCell>
                  <TableCell className="text-center">{r.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Dúvida entre dois tamanhos? Escolha o maior para um caixa mais confortável.
        </p>
      </DialogContent>
    </Dialog>
  );
}
