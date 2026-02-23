import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Result {
  id: number;
  application_id: number | null;
  full_name: string;
  age: number | null;
  teacher: string | null;
  institution: string | null;
  work_title: string | null;
  email: string | null;
  contest_id: number | null;
  contest_name: string | null;
  work_file_url: string | null;
  result: string | null;
  place: number | null;
  score: number | null;
  diploma_url: string | null;
  notes: string | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Review {
  id: number;
  author_name: string;
  author_role: string | null;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface ResultFilters {
  contest_name: string;
  full_name: string;
  result: string;
  date: Date | undefined;
}

interface AdminResultsTabProps {
  activeTab: 'results' | 'reviews';
  filteredResults: Result[];
  resultFilters: ResultFilters;
  setResultFilters: (v: ResultFilters) => void;
  isResultModalOpen: boolean;
  setIsResultModalOpen: (v: boolean) => void;
  editingResult: Result | null;
  setEditingResult: (v: Result | null) => void;
  handleSaveResult: (e: React.FormEvent) => void;
  handleDeleteResult: (id: number) => void;
  reviews: Review[];
  loadReviews: () => void;
  REVIEWS_API_URL: string;
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const AdminResultsAndReviewsTab = ({
  activeTab,
  filteredResults,
  resultFilters,
  setResultFilters,
  isResultModalOpen,
  setIsResultModalOpen,
  editingResult,
  setEditingResult,
  handleSaveResult,
  handleDeleteResult,
  reviews,
  loadReviews,
  REVIEWS_API_URL,
  toast,
}: AdminResultsTabProps) => {
  return (
    <>
      {/* Вкладка результатов */}
      {activeTab === 'results' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-primary">Результаты конкурсов</h2>
          </div>

          <Card className="rounded-2xl shadow-md mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Название конкурса</Label>
                <Input
                  placeholder="Поиск по названию..."
                  value={resultFilters.contest_name}
                  onChange={(e) => setResultFilters({...resultFilters, contest_name: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>ФИО участника</Label>
                <Input
                  placeholder="Поиск по ФИО..."
                  value={resultFilters.full_name}
                  onChange={(e) => setResultFilters({...resultFilters, full_name: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Результат</Label>
                <Select
                  value={resultFilters.result}
                  onValueChange={(value) => setResultFilters({...resultFilters, result: value})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все результаты</SelectItem>
                    <SelectItem value="grand_prix">🏆 Гран-При</SelectItem>
                    <SelectItem value="first_degree">🥇 Диплом 1 степени</SelectItem>
                    <SelectItem value="second_degree">🥈 Диплом 2 степени</SelectItem>
                    <SelectItem value="third_degree">🥉 Диплом 3 степени</SelectItem>
                    <SelectItem value="participant">✨ Участник</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Дата участия</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl">
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
            </div>
          </Card>

          <div className="grid gap-4">
            {filteredResults.length === 0 ? (
              <Card className="rounded-2xl p-8 text-center">
                <Icon name="Award" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">Результатов пока нет</p>
              </Card>
            ) : (
              filteredResults.map((result) => (
                <Card key={result.id} className="rounded-2xl shadow-md">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">ФИО</p>
                          <p className="font-semibold text-sm">{result.full_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Возраст</p>
                          <p className="font-semibold text-sm">{result.age} лет</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Название работы</p>
                          <p className="font-semibold text-sm">{result.work_title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Конкурс</p>
                          <p className="font-semibold text-sm">{result.contest_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Педагог</p>
                          <p className="font-semibold text-sm">{result.teacher || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Учреждение</p>
                          <p className="font-semibold text-sm">{result.institution || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Файл работы</p>
                          {result.work_file_url ? (
                            <button
                              onClick={() => window.open(result.work_file_url!, '_blank')}
                              className="text-primary hover:underline flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <Icon name="Eye" size={14} />
                              Посмотреть
                            </button>
                          ) : (
                            <p className="font-semibold text-sm">—</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Результат</p>
                          <span className="inline-block px-3 py-1 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            {result.result === 'grand_prix' ? '🏆 Гран-При' :
                             result.result === 'first_degree' ? '🥇 Диплом 1 степени' :
                             result.result === 'second_degree' ? '🥈 Диплом 2 степени' :
                             result.result === 'third_degree' ? '🥉 Диплом 3 степени' : '✨ Участник'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Публикация в галерее</p>
                          <span className={`text-sm font-semibold ${result.gallery_consent ? 'text-green-600' : 'text-red-600'}`}>
                            {result.gallery_consent ? '✓ Согласен' : '✗ Не согласен'}
                          </span>
                        </div>
                        {result.diploma_issued_at && (
                          <div>
                            <p className="text-xs text-muted-foreground">Дата вручения</p>
                            <p className="font-semibold text-sm">{new Date(result.diploma_issued_at).toLocaleDateString('ru-RU')}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleDeleteResult(result.id)}
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Вкладка отзывов */}
      {activeTab === 'reviews' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-primary">Модерация отзывов</h2>
          </div>

          <div className="grid gap-4">
            {reviews.length === 0 ? (
              <Card className="rounded-2xl p-8 text-center">
                <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">Отзывов пока нет</p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className={`rounded-2xl shadow-md ${review.status === 'pending' ? 'border-2 border-orange-400' : review.status === 'approved' ? 'border-2 border-green-400' : 'border-2 border-red-400 opacity-60'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Icon key={i} name="Star" className="text-secondary fill-secondary" size={18} />
                            ))}
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            review.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                            review.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {review.status === 'pending' ? '⏳ На модерации' :
                             review.status === 'approved' ? '✅ Опубликован' : '❌ Отклонен'}
                          </span>
                        </div>

                        <p className="text-lg mb-4 italic">"{review.text}"</p>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Автор</p>
                            <p className="font-semibold">{review.author_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Роль</p>
                            <p className="font-semibold">{review.author_role || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Дата создания</p>
                            <p className="font-semibold">
                              {new Date(review.created_at).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {review.published_at && (
                            <div>
                              <p className="text-xs text-muted-foreground">Дата публикации</p>
                              <p className="font-semibold">
                                {new Date(review.published_at).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {review.status === 'pending' && (
                          <>
                            <Button
                              onClick={async () => {
                                try {
                                  const response = await fetch(REVIEWS_API_URL, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: review.id, status: 'approved' })
                                  });
                                  if (response.ok) {
                                    toast({ title: 'Успешно', description: 'Отзыв опубликован' });
                                    loadReviews();
                                  }
                                } catch {
                                  toast({ title: 'Ошибка', description: 'Не удалось опубликовать отзыв', variant: 'destructive' });
                                }
                              }}
                              variant="default"
                              size="sm"
                              className="rounded-xl bg-green-600 hover:bg-green-700"
                            >
                              <Icon name="Check" size={16} className="mr-1" />
                              Одобрить
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  const response = await fetch(REVIEWS_API_URL, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: review.id, status: 'rejected' })
                                  });
                                  if (response.ok) {
                                    toast({ title: 'Успешно', description: 'Отзыв отклонен' });
                                    loadReviews();
                                  }
                                } catch {
                                  toast({ title: 'Ошибка', description: 'Не удалось отклонить отзыв', variant: 'destructive' });
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Icon name="X" size={16} className="mr-1" />
                              Отклонить
                            </Button>
                          </>
                        )}
                        {review.status === 'approved' && (
                          <Button
                            onClick={async () => {
                              try {
                                const response = await fetch(REVIEWS_API_URL, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: review.id, status: 'rejected' })
                                });
                                if (response.ok) {
                                  toast({ title: 'Успешно', description: 'Отзыв снят с публикации' });
                                  loadReviews();
                                }
                              } catch {
                                toast({ title: 'Ошибка', description: 'Не удалось снять с публикации', variant: 'destructive' });
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                          >
                            <Icon name="EyeOff" size={16} className="mr-1" />
                            Снять
                          </Button>
                        )}
                        <Button
                          onClick={async () => {
                            if (!confirm('Удалить этот отзыв?')) return;
                            try {
                              const response = await fetch(`${REVIEWS_API_URL}?id=${review.id}`, {
                                method: 'DELETE'
                              });
                              if (response.ok) {
                                toast({ title: 'Успешно', description: 'Отзыв удален' });
                                loadReviews();
                              }
                            } catch {
                              toast({ title: 'Ошибка', description: 'Не удалось удалить отзыв', variant: 'destructive' });
                            }
                          }}
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Модал редактирования результата */}
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              Редактировать результат
            </DialogTitle>
          </DialogHeader>

          {editingResult && (
            <form onSubmit={handleSaveResult} className="space-y-4">
              <div className="space-y-2">
                <Label>ФИО *</Label>
                <Input
                  value={editingResult.full_name}
                  onChange={(e) => setEditingResult({...editingResult, full_name: e.target.value})}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Возраст</Label>
                <Input
                  type="number"
                  value={editingResult.age || ''}
                  onChange={(e) => setEditingResult({...editingResult, age: parseInt(e.target.value) || null})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Педагог</Label>
                <Input
                  value={editingResult.teacher || ''}
                  onChange={(e) => setEditingResult({...editingResult, teacher: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Учреждение</Label>
                <Input
                  value={editingResult.institution || ''}
                  onChange={(e) => setEditingResult({...editingResult, institution: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Название работы</Label>
                <Input
                  value={editingResult.work_title || ''}
                  onChange={(e) => setEditingResult({...editingResult, work_title: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingResult.email || ''}
                  onChange={(e) => setEditingResult({...editingResult, email: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Название конкурса</Label>
                <Input
                  value={editingResult.contest_name || ''}
                  onChange={(e) => setEditingResult({...editingResult, contest_name: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Результат</Label>
                <Select
                  value={editingResult.result || 'none'}
                  onValueChange={(value) => setEditingResult({...editingResult, result: value === 'none' ? null : value})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не указан</SelectItem>
                    <SelectItem value="Победитель">Победитель</SelectItem>
                    <SelectItem value="Призер">Призер</SelectItem>
                    <SelectItem value="Участник">Участник</SelectItem>
                    <SelectItem value="Гран-при">Гран-при</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Место</Label>
                <Input
                  type="number"
                  value={editingResult.place || ''}
                  onChange={(e) => setEditingResult({...editingResult, place: parseInt(e.target.value) || null})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Баллы</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingResult.score || ''}
                  onChange={(e) => setEditingResult({...editingResult, score: parseFloat(e.target.value) || null})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Ссылка на диплом</Label>
                <Input
                  value={editingResult.diploma_url || ''}
                  onChange={(e) => setEditingResult({...editingResult, diploma_url: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Дата вручения</Label>
                <Input
                  type="date"
                  value={editingResult.diploma_issued_at || ''}
                  onChange={(e) => setEditingResult({...editingResult, diploma_issued_at: e.target.value || null})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Примечания</Label>
                <Textarea
                  value={editingResult.notes || ''}
                  onChange={(e) => setEditingResult({...editingResult, notes: e.target.value})}
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/90">
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResultModalOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminResultsAndReviewsTab;
