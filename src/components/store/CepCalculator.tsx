import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CepCalculator() {
  const { t } = useTranslation();
  const [zip, setZip] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = () => {
    if (zip.length >= 4) {
      setResult(t("cep.result"));
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold">{t("cep.title")}</h4>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={t("cep.placeholder")}
          value={zip}
          onChange={(e) => setZip(e.target.value.slice(0, 12))}
          className="flex-1"
        />
        <Button onClick={handleCalculate} variant="outline" className="font-semibold">
          {t("cep.calculate")}
        </Button>
      </div>
      {result && <p className="text-sm text-primary font-medium">{result}</p>}
    </div>
  );
}
