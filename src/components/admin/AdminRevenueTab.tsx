import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Application {
  id: number;
  full_name: string;
  email: string;
  contest_name: string;
  is_collective: boolean;
  created_at: string;
  deleted_at: string | null;
}

interface AdminRevenueTabProps {
  applications: Application[];
}

const PRICE_SINGLE = 200;
const PRICE_COLLECTIVE_SMALL = 200;
const PRICE_COLLECTIVE_BULK = 150;
const BULK_THRESHOLD = 5;

function calcRevenue(apps: Application[]): number {
  const singles = apps.filter(a => !a.is_collective);
  const collective = apps.filter(a => a.is_collective);
  let total = singles.length * PRICE_SINGLE;
  const groups: Record<string, Application[]> = {};
  for (const app of collective) {
    const day = app.created_at ? app.created_at.slice(0, 10) : 'unknown';
    const key = `${app.email}__${day}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(app);
  }
  for (const group of Object.values(groups)) {
    const count = group.length;
    const price = count >= BULK_THRESHOLD ? PRICE_COLLECTIVE_BULK : PRICE_COLLECTIVE_SMALL;
    total += count * price;
  }
  return total;
}

interface RevenueGroup {
  label: string;
  count: number;
  collectiveCount: number;
  singleCount: number;
  revenue: number;
}

interface ChartPoint {
  date: string;
  dateLabel: string;
  dayOfWeek: string;
  single: number;
  collective: number;
  total: number;
}

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const AdminRevenueTab = ({ applications }: AdminRevenueTabProps) => {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateFrom, setDateFrom] = useState<string>(firstOfMonth.toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState<string>(today.toISOString().slice(0, 10));

  const activeApps = useMemo(() => applications.filter(a => !a.deleted_at), [applications]);

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;
    return activeApps.filter(a => {
      if (!a.created_at) return false;
      const d = new Date(a.created_at);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [activeApps, dateFrom, dateTo]);

  const totalRevenue = useMemo(() => calcRevenue(filtered), [filtered]);
  const totalCount = filtered.length;
  const collectiveApps = filtered.filter(a => a.is_collective);
  const collectiveCount = collectiveApps.length;
  const singleCount = filtered.filter(a => !a.is_collective).length;

  // Считаем коллективных со скидкой и без (по группам email+день)
  const collectiveStats = useMemo(() => {
    const groups: Record<string, Application[]> = {};
    for (const app of collectiveApps) {
      const day = app.created_at ? app.created_at.slice(0, 10) : 'unknown';
      const key = `${app.email}__${day}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(app);
    }
    let withDiscount = 0;
    let noDiscount = 0;
    for (const group of Object.values(groups)) {
      if (group.length >= BULK_THRESHOLD) withDiscount += group.length;
      else noDiscount += group.length;
    }
    return { withDiscount, noDiscount };
  }, [collectiveApps]);

  // Группировка по дням для таблицы
  const byDay = useMemo(() => {
    const map: Record<string, Application[]> = {};
    for (const a of filtered) {
      const day = a.created_at ? a.created_at.slice(0, 10) : 'unknown';
      if (!map[day]) map[day] = [];
      map[day].push(a);
    }
    const result: RevenueGroup[] = Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, apps]) => ({
        label: new Date(day).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        count: apps.length,
        collectiveCount: apps.filter(a => a.is_collective).length,
        singleCount: apps.filter(a => !a.is_collective).length,
        revenue: calcRevenue(apps),
      }));
    return result;
  }, [filtered]);

  // Данные для графика — все дни периода (включая нули)
  const chartData = useMemo((): ChartPoint[] => {
    if (!dateFrom || !dateTo) return [];

    const map: Record<string, Application[]> = {};
    for (const a of filtered) {
      const day = a.created_at ? a.created_at.slice(0, 10) : 'unknown';
      if (!map[day]) map[day] = [];
      map[day].push(a);
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const points: ChartPoint[] = [];

    const cur = new Date(from);
    while (cur <= to) {
      const key = cur.toISOString().slice(0, 10);
      const dayApps = map[key] || [];
      const dow = DAY_NAMES[cur.getDay()];
      const dateLabel = cur.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });

      points.push({
        date: key,
        dateLabel: `${dateLabel} (${dow})`,
        dayOfWeek: dow,
        single: dayApps.filter(a => !a.is_collective).length,
        collective: dayApps.filter(a => a.is_collective).length,
        total: dayApps.length,
      });

      cur.setDate(cur.getDate() + 1);
    }

    return points;
  }, [filtered, dateFrom, dateTo]);

  // Группировка по конкурсам
  const byContest = useMemo(() => {
    const map: Record<string, Application[]> = {};
    for (const a of filtered) {
      const name = a.contest_name || 'Без конкурса';
      if (!map[name]) map[name] = [];
      map[name].push(a);
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([name, apps]) => ({
        label: name,
        count: apps.length,
        collectiveCount: apps.filter(a => a.is_collective).length,
        singleCount: apps.filter(a => !a.is_collective).length,
        revenue: calcRevenue(apps),
      }));
  }, [filtered]);

  const formatMoney = (n: number) =>
    n.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

  const periodDays = useMemo(() => {
    if (!dateFrom || !dateTo) return 0;
    const diff = new Date(dateTo).getTime() - new Date(dateFrom).getTime();
    return Math.round(diff / 86400000) + 1;
  }, [dateFrom, dateTo]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-heading font-bold text-primary">Доходность</h2>
      </div>

      {/* Фильтр по периоду */}
      <Card className="rounded-2xl mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Период с</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="rounded-xl w-44"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">по</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="rounded-xl w-44"
              />
            </div>
            <div className="text-sm text-muted-foreground pb-2">
              Найдено заявок: <span className="font-semibold text-foreground">{totalCount}</span>
              {periodDays > 0 && <span className="ml-2">за {periodDays} дн.</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Сводные карточки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="TrendingUp" size={18} className="text-primary" />
              <span className="text-sm text-muted-foreground font-medium">Доход за период</span>
            </div>
            <p className="text-2xl font-heading font-bold text-primary">{formatMoney(totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="FileText" size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Всего заявок</span>
            </div>
            <p className="text-2xl font-heading font-bold">{totalCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="User" size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Одиночные</span>
            </div>
            <p className="text-2xl font-heading font-bold">{singleCount}</p>
            <p className="text-xs text-muted-foreground">по 200 ₽</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Users" size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Коллективные</span>
            </div>
            <p className="text-2xl font-heading font-bold">{collectiveCount}</p>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-violet-400 mr-1" />
                со скидкой (≥5): <span className="font-semibold text-foreground">{collectiveStats.withDiscount}</span> × 150 ₽
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-violet-200 mr-1" />
                без скидки (&lt;5): <span className="font-semibold text-foreground">{collectiveStats.noDiscount}</span> × 200 ₽
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="BarChart2" size={48} className="mx-auto mb-4 opacity-30" />
          <p>За выбранный период заявок нет</p>
        </div>
      ) : (
        <>
          {/* График по дням */}
          <Card className="rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Icon name="BarChart2" size={18} className="text-primary" />
                График заявок по дням
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: -16, bottom: periodDays > 14 ? 48 : 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11 }}
                    angle={periodDays > 14 ? -45 : 0}
                    textAnchor={periodDays > 14 ? 'end' : 'middle'}
                    interval={periodDays > 60 ? Math.floor(periodDays / 20) : 0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      [value, name === 'single' ? 'Одиночные' : 'Коллективные']
                    }
                    labelFormatter={(label) => `📅 ${label}`}
                    contentStyle={{ borderRadius: 12, fontSize: 13 }}
                  />
                  <Legend
                    formatter={(value) => value === 'single' ? 'Одиночные' : 'Коллективные'}
                    wrapperStyle={{ fontSize: 13 }}
                  />
                  <Bar dataKey="single" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} name="single" />
                  <Bar dataKey="collective" stackId="a" fill="#a78bfa" radius={[4, 4, 0, 0]} name="collective" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* По дням — таблица */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Icon name="CalendarDays" size={18} className="text-primary" />
                  По дням
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold">Дата</th>
                        <th className="text-center px-3 py-2 font-semibold">Заявок</th>
                        <th className="text-right px-4 py-2 font-semibold">Доход</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byDay.map((row, i) => (
                        <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                          <td className="px-4 py-2 font-medium">{row.label}</td>
                          <td className="px-3 py-2 text-center text-muted-foreground">
                            {row.count}
                            {row.collectiveCount > 0 && (
                              <span className="ml-1 text-xs text-blue-500">({row.collectiveCount} колл.)</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-primary">{formatMoney(row.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-primary/20 bg-primary/5">
                      <tr>
                        <td className="px-4 py-2 font-bold">Итого</td>
                        <td className="px-3 py-2 text-center font-bold">{totalCount}</td>
                        <td className="px-4 py-2 text-right font-bold text-primary">{formatMoney(totalRevenue)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* По конкурсам */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Icon name="Trophy" size={18} className="text-primary" />
                  По конкурсам
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold">Конкурс</th>
                        <th className="text-center px-3 py-2 font-semibold">Заявок</th>
                        <th className="text-right px-4 py-2 font-semibold">Доход</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byContest.map((row, i) => (
                        <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                          <td className="px-4 py-2 font-medium max-w-[180px] truncate" title={row.label}>{row.label}</td>
                          <td className="px-3 py-2 text-center text-muted-foreground">
                            {row.count}
                            {row.collectiveCount > 0 && (
                              <span className="ml-1 text-xs text-blue-500">({row.collectiveCount} колл.)</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-primary">{formatMoney(row.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-primary/20 bg-primary/5">
                      <tr>
                        <td className="px-4 py-2 font-bold">Итого</td>
                        <td className="px-3 py-2 text-center font-bold">{totalCount}</td>
                        <td className="px-4 py-2 text-right font-bold text-primary">{formatMoney(totalRevenue)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Пояснение тарифов */}
      <Card className="rounded-2xl mt-6 bg-muted/40 border-dashed">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              Тарифы: одиночная заявка — <b>200 ₽</b>. Коллективная заявка: до 4 участников — <b>200 ₽/чел.</b>, от 5 участников — <b>150 ₽/чел.</b>
              Коллективные участники группируются по email и дате подачи.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRevenueTab;