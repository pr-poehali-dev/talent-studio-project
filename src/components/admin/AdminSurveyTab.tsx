import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SurveyQuestion {
  id: number;
  questionText: string;
  questionType: string;
  options?: string[];
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
}

interface AdminSurveyTabProps {
  questions: SurveyQuestion[];
  loading: boolean;
  onSaveQuestion: () => Promise<void>;
  onDeleteQuestion: (id: number) => Promise<void>;
  onMoveQuestion: (id: number, direction: 'up' | 'down') => Promise<void>;
  editingQuestion: SurveyQuestion | null;
  setEditingQuestion: (question: SurveyQuestion | null) => void;
}

const AdminSurveyTab = ({
  questions,
  loading,
  onSaveQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  editingQuestion,
  setEditingQuestion
}: AdminSurveyTabProps) => {
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Вопросы анкеты</h2>
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingQuestion({ 
                id: 0, 
                questionText: '', 
                questionType: 'text', 
                options: undefined, 
                isRequired: true, 
                displayOrder: questions.length + 1,
                isActive: true
              });
              setIsQuestionDialogOpen(true);
            }}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить вопрос
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion?.id ? 'Редактировать вопрос' : 'Новый вопрос'}
              </DialogTitle>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Текст вопроса *</Label>
                  <Input
                    value={editingQuestion.questionText}
                    onChange={(e) => setEditingQuestion({...editingQuestion, questionText: e.target.value})}
                    placeholder="Как вас зовут?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Тип вопроса</Label>
                    <select
                      value={editingQuestion.questionType}
                      onChange={(e) => setEditingQuestion({...editingQuestion, questionType: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="text">Текст (одна строка)</option>
                      <option value="textarea">Текст (несколько строк)</option>
                      <option value="number">Число</option>
                      <option value="radio">Выбор одного варианта</option>
                      <option value="checkbox">Выбор нескольких</option>
                      <option value="select">Выпадающий список</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingQuestion.isRequired}
                        onChange={(e) => setEditingQuestion({...editingQuestion, isRequired: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Обязательный</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingQuestion.isActive}
                        onChange={(e) => setEditingQuestion({...editingQuestion, isActive: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Активен</span>
                    </label>
                  </div>
                </div>

                {['radio', 'checkbox', 'select'].includes(editingQuestion.questionType) && (
                  <div>
                    <Label>Варианты ответов (каждый с новой строки)</Label>
                    <Textarea
                      value={editingQuestion.options?.join('\n') || ''}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion, 
                        options: e.target.value.split('\n').filter(o => o.trim())
                      })}
                      placeholder="Вариант 1&#10;Вариант 2&#10;Вариант 3"
                      rows={5}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={async () => {
                      await onSaveQuestion();
                      setIsQuestionDialogOpen(false);
                    }}
                    disabled={loading} 
                    className="flex-1"
                  >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingQuestion(null);
                      setIsQuestionDialogOpen(false);
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Вопрос</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead className="w-24 text-center">Обяз.</TableHead>
              <TableHead className="w-24 text-center">Статус</TableHead>
              <TableHead className="w-40 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...questions].sort((a, b) => a.displayOrder - b.displayOrder).map((question, index) => (
              <TableRow key={question.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {question.displayOrder}
                </TableCell>
                <TableCell className="font-medium">
                  {question.questionText}
                  {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {question.options.slice(0, 3).join(', ')}
                      {question.options.length > 3 && '...'}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {question.questionType === 'text' && 'Текст'}
                    {question.questionType === 'textarea' && 'Многострочный'}
                    {question.questionType === 'number' && 'Число'}
                    {question.questionType === 'radio' && 'Один вариант'}
                    {question.questionType === 'checkbox' && 'Множественный'}
                    {question.questionType === 'select' && 'Список'}
                    {question.questionType === 'single_choice' && 'Один вариант'}
                    {question.questionType === 'multiple_choice' && 'Множественный'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {question.isRequired ? (
                    <Badge variant="destructive" className="text-xs">Да</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Нет</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {question.isActive ? (
                    <Badge className="bg-green-500 text-xs">Активен</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Неактивен</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveQuestion(question.id, 'up')}
                      disabled={index === 0}
                      title="Переместить вверх"
                    >
                      <Icon name="ArrowUp" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveQuestion(question.id, 'down')}
                      disabled={index === [...questions].sort((a, b) => a.displayOrder - b.displayOrder).length - 1}
                      title="Переместить вниз"
                    >
                      <Icon name="ArrowDown" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingQuestion(question);
                        setIsQuestionDialogOpen(true);
                      }}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteQuestion(question.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminSurveyTab;