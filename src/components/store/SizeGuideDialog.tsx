import { Ruler } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SizeRow {
  size: string;
  chest: string;
  waist: string;
}

interface Props {
  rows?: SizeRow[];
  triggerLabel?: string;
}

const DEFAULT_ROWS: SizeRow[] = [
  { size: "PP", chest: "70-79 cm", waist: "55-64 cm" },
  { size: "P", chest: "80-100 cm", waist: "65-75 cm" },
  { size: "M", chest: "101-120 cm", waist: "70-80 cm" },
  { size: "G", chest: "121-140 cm", waist: "80-90 cm" },
  { size: "GG", chest: "141-160 cm", waist: "90-100 cm" },
  { size: "XG", chest: "161-170 cm", waist: "100-105 cm" },
  { size: "XGG", chest: "171-180 cm", waist: "106-110 cm" },
  { size: "G3", chest: "181-195 cm", waist: "111-120 cm" },
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
            Tabela de Medidas
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            Meça o peito na parte mais larga e a cintura na altura do umbigo. Se ficar entre dois tamanhos, prefira o maior.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-xs uppercase tracking-wider">Tam.</TableHead>
                <TableHead className="text-center text-xs uppercase tracking-wider">Peito</TableHead>
                <TableHead className="text-center text-xs uppercase tracking-wider">Cintura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.size}>
                  <TableCell className="text-center font-semibold">{r.size}</TableCell>
                  <TableCell className="text-center">{r.chest}</TableCell>
                  <TableCell className="text-center">{r.waist}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Dúvida entre dois tamanhos? Escolha o maior para um caimento mais confortável.
        </p>
      </DialogContent>
    </Dialog>
  );
}
