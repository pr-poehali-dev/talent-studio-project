import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Icon from "@/components/ui/icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { PublicResult } from "./IndexTypes";

interface ResultFilters {
  contest: string;
  fullName: string;
  result: string;
  date: Date | undefined;
}

interface IndexResultsSectionProps {
  filteredResults: PublicResult[];
  resultFilters: ResultFilters;
  setResultFilters: (f: ResultFilters) => void;
  resultsPage: number;
  setResultsPage: (p: number) => void;
}

const RESULTS_PER_PAGE = 20;

const IndexResultsSection = ({
  filteredResults,
  resultFilters,
  setResultFilters,
  resultsPage,
  setResultsPage,
}: IndexResultsSectionProps) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-4xl font-heading font-bold text-center mb-8 text-secondary">Итоги конкурсов</h2>

      <div className="max-w-7xl mx-auto mb-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Дата вручения</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {resultFilters.date ? format(resultFilters.date, 'dd.MM.yyyy', { locale: ru }) : 'Выберите дату'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={resultFilters.date}
                  onSelect={(date) => setResultFilters({...resultFilters, date: date})}
                  locale={ru}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Конкурс</Label>
            <Input
              placeholder="Поиск по названию конкурса..."
              value={resultFilters.contest}
              onChange={(e) => setResultFilters({...resultFilters, contest: e.target.value})}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">ФИО участника</Label>
            <Input
              placeholder="Поиск по ФИО..."
              value={resultFilters.fullName}
              onChange={(e) => setResultFilters({...resultFilters, fullName: e.target.value})}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Результат</Label>
            <Select
              value={resultFilters.result}
              onValueChange={(value) => setResultFilters({...resultFilters, result: value})}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все результаты</SelectItem>
                <SelectItem value="grand_prix">Гран-При</SelectItem>
                <SelectItem value="first_degree">Диплом 1 степени</SelectItem>
                <SelectItem value="second_degree">Диплом 2 степени</SelectItem>
                <SelectItem value="third_degree">Диплом 3 степени</SelectItem>
                <SelectItem value="participant">Участник</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setResultFilters({ contest: '', fullName: '', result: 'all', date: undefined })}
          >
            Сбросить фильтр
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {filteredResults.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
            <p className="text-lg text-muted-foreground">Результаты не найдены</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {filteredResults.length > RESULTS_PER_PAGE && (
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <p className="text-sm text-muted-foreground">
                  Показано {(resultsPage - 1) * RESULTS_PER_PAGE + 1}–{Math.min(resultsPage * RESULTS_PER_PAGE, filteredResults.length)} из {filteredResults.length}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setResultsPage(resultsPage - 1)} disabled={resultsPage === 1}>Назад</Button>
                  {Array.from({ length: Math.ceil(filteredResults.length / RESULTS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                    <Button key={page} variant={page === resultsPage ? "default" : "outline"} size="sm" onClick={() => setResultsPage(page)}>{page}</Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setResultsPage(resultsPage + 1)} disabled={resultsPage === Math.ceil(filteredResults.length / RESULTS_PER_PAGE)}>Вперёд</Button>
                </div>
              </div>
            )}
            <div className="hidden md:grid gap-4 p-4 bg-gray-50 border-b font-semibold text-sm" style={{gridTemplateColumns: '120px 2fr 60px 1.5fr 1.5fr 1.5fr 2.5fr 160px'}}>
              <div>Дата вручения</div>
              <div>ФИО участника</div>
              <div>Возраст</div>
              <div>Конкурс</div>
              <div>Результат</div>
              <div>Педагог</div>
              <div>Учреждение</div>
              <div>Справка</div>
            </div>

            <div className="divide-y">
              {filteredResults.slice((resultsPage - 1) * RESULTS_PER_PAGE, resultsPage * RESULTS_PER_PAGE).map((result) => (
                <div key={result.id} className="grid gap-4 p-4 hover:bg-gray-50 transition-colors md:grid-cols-[120px_2fr_60px_1.5fr_1.5fr_1.5fr_2.5fr_160px]">
                  <div className="text-sm">
                    <span className="md:hidden font-semibold text-muted-foreground">Дата вручения: </span>
                    {result.diploma_issued_at ? new Date(result.diploma_issued_at).toLocaleDateString('ru-RU') : '—'}
                  </div>
                  <div className="text-sm font-medium">
                    <span className="md:hidden font-semibold text-muted-foreground">ФИО: </span>
                    {result.full_name}
                  </div>
                  <div className="text-sm">
                    <span className="md:hidden font-semibold text-muted-foreground">Возраст: </span>
                    {result.age || '—'}
                  </div>
                  <div className="text-sm">
                    <span className="md:hidden font-semibold text-muted-foreground">Конкурс: </span>
                    {result.contest_name}
                  </div>
                  <div className="text-sm">
                    <span className="md:hidden font-semibold text-muted-foreground">Результат: </span>
                    <span className={`inline-block px-3 py-1 rounded-md font-semibold text-xs ${
                      result.result === 'grand_prix'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                        : result.result === 'first_degree'
                        ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-white'
                        : result.result === 'second_degree'
                        ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                        : result.result === 'third_degree'
                        ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {result.result === 'grand_prix' && 'Гран-При'}
                      {result.result === 'first_degree' && 'Диплом 1 степени'}
                      {result.result === 'second_degree' && 'Диплом 2 степени'}
                      {result.result === 'third_degree' && 'Диплом 3 степени'}
                      {result.result === 'participant' && 'Участник'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="md:hidden font-semibold text-muted-foreground">Педагог: </span>
                    {result.teacher || '—'}
                  </div>
                  <div className="text-sm">
                    <span className="md:hidden font-semibold text-muted-foreground">Учреждение: </span>
                    {result.institution || '—'}
                  </div>
                  <div className="text-sm">
                    <a
                      href={`https://functions.poehali.dev/7ea2c01d-bd1a-4567-b4f0-21aab3b96774?id=${result.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      <Icon name="FileText" size={14} />
                      Скачать справку
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {filteredResults.length > RESULTS_PER_PAGE && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-sm text-muted-foreground">
                  Показано {(resultsPage - 1) * RESULTS_PER_PAGE + 1}–{Math.min(resultsPage * RESULTS_PER_PAGE, filteredResults.length)} из {filteredResults.length}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setResultsPage(resultsPage - 1)} disabled={resultsPage === 1}>Назад</Button>
                  {Array.from({ length: Math.ceil(filteredResults.length / RESULTS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                    <Button key={page} variant={page === resultsPage ? "default" : "outline"} size="sm" onClick={() => setResultsPage(page)}>{page}</Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setResultsPage(resultsPage + 1)} disabled={resultsPage === Math.ceil(filteredResults.length / RESULTS_PER_PAGE)}>Вперёд</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexResultsSection;
