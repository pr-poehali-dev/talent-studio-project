import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { GENERATE_REGISTRY_URL } from "./AdminTypes";

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const RegistryGeneratorCard = () => {
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GENERATE_REGISTRY_URL}?month=${month}&year=${year}`);
      if (!res.ok) throw new Error('Ошибка генерации');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reestr_${month.padStart(2, '0')}_${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось сформировать реестр', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-md mb-6 p-6">
      <h3 className="text-lg font-semibold mb-4">Реестр сведений об участниках и результатах</h3>
      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label>Месяц</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Год</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="rounded-xl">
          <Icon name={loading ? "Loader2" : "FileDown"} size={16} className={loading ? "animate-spin" : ""} />
          {loading ? 'Формируется...' : 'Сформировать PDF'}
        </Button>
      </div>
    </Card>
  );
};

export default RegistryGeneratorCard;
