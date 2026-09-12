import { useState, useEffect, useCallback } from "react";
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

interface RegistryItem {
  month: number;
  year: number;
  pdf_url: string;
  generated_at: string;
}

const RegistryGeneratorCard = () => {
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [loading, setLoading] = useState(false);
  const [registries, setRegistries] = useState<RegistryItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const { toast } = useToast();

  const loadRegistries = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch(`${GENERATE_REGISTRY_URL}?action=list`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRegistries(data);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить список реестров', variant: 'destructive' });
    } finally {
      setListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRegistries();
  }, [loadRegistries]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(GENERATE_REGISTRY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: Number(month), year: Number(year) }),
      });
      if (!res.ok) throw new Error('Ошибка генерации');
      toast({ title: 'Готово', description: `Реестр за ${MONTHS[Number(month) - 1]} ${year} сформирован` });
      await loadRegistries();
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось сформировать реестр', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-md mb-6 p-6">
      <h3 className="text-lg font-semibold mb-4">Реестр сведений об участниках и результатах</h3>
      <div className="grid md:grid-cols-3 gap-4 items-end mb-6">
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
          {loading ? 'Формируется...' : 'Сформировать и опубликовать'}
        </Button>
      </div>

      <div>
        <Label className="mb-2 block">Опубликованные реестры</Label>
        {listLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : registries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Реестры ещё не формировались</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {registries.map((r) => (
              <a
                key={`${r.year}-${r.month}`}
                href={r.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm bg-secondary/10 border-secondary/40 hover:bg-secondary/20 transition-colors"
              >
                <Icon name="FileDown" size={14} />
                {MONTHS[r.month - 1]} {r.year}
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RegistryGeneratorCard;
