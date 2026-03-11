import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { getSurveyUrl } from '@/config/api';

interface SurveyRestoreProps {
  onRestore: (userData: any) => void;
  onCancel: () => void;
}

export default function SurveyRestore({ onRestore, onCancel }: SurveyRestoreProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRestore = async () => {
    if (!email.trim()) {
      setError('Пожалуйста, укажите email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getSurveyUrl('user')}&email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.user && data.survey) {
          onRestore(data);
        } else {
          setError('Анкета не найдена. Проверьте правильность email или начните новую анкету.');
        }
      } else if (response.status === 404) {
        setError('Анкета не найдена. Проверьте правильность email или начните новую анкету.');
      } else {
        setError('Ошибка при загрузке данных. Попробуйте позже.');
      }
    } catch (err) {
      console.error('Restore error:', err);
      setError('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted flex items-center justify-center">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Восстановить анкету</CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            Введите email, который вы указали при регистрации
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="restore-email">Email</Label>
            <Input
              id="restore-email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleRestore()}
              className="mt-2"
              disabled={loading}
            />
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRestore} 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                  Поиск анкеты...
                </>
              ) : (
                <>
                  <Icon name="Search" className="mr-2" size={20} />
                  Найти мою анкету
                </>
              )}
            </Button>
            
            <Button 
              onClick={onCancel} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              Начать новую анкету
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
              <p>
                Если вы не завершили анкету ранее, мы восстановим её с того места, где вы остановились.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
