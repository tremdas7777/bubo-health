import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CepCalculator() {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = () => {
    if (cep.length >= 8) {
      setResult("Frete Grátis - Enviado por Correios de 3 a 11 dias úteis");
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold">Calcule o prazo de entrega</h4>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
          className="flex-1"
        />
        <Button onClick={handleCalculate} variant="outline" className="font-semibold">
          Calcular
        </Button>
      </div>
      {result && (
        <p className="text-sm text-primary font-medium">{result}</p>
      )}
    </div>
  );
}
