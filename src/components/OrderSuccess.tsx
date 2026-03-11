import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { getOrdersUrl } from '@/config/api';

interface OrderSuccessProps {
  orderNumber: string;
}

export default function OrderSuccess({ orderNumber }: OrderSuccessProps) {
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderData();
  }, [orderNumber]);

  const loadOrderData = async () => {
    try {
      const response = await fetch(`${getOrdersUrl()}?orderNumber=${orderNumber}`);
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-green-500">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <Icon name="Check" size={48} className="text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-green-700">
              Заказ успешно оформлен!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg text-muted-foreground">
                Ваш заказ <span className="font-bold text-foreground">{orderNumber}</span> принят в обработку
              </p>
              <p className="text-sm text-muted-foreground">
                Мы отправили подтверждение на ваш email
              </p>
            </div>

            {orderData && (
              <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Статус заказа:</span>
                  <span className="font-semibold">В обработке</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Статус оплаты:</span>
                  <span className="font-semibold text-green-600">
                    {orderData.paymentStatus === 'paid' ? 'Оплачен' : 'В обработке'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Сумма:</span>
                  <span className="font-bold text-lg">{orderData.totalAmount?.toLocaleString()} ₽</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Icon name="Package" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Доставка</p>
                  <p className="text-xs text-muted-foreground">
                    Мы отправим вам трек-номер для отслеживания посылки
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Icon name="Mail" size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Поддержка</p>
                  <p className="text-xs text-muted-foreground">
                    Если есть вопросы — напишите нам на support@example.com
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/'}
              >
                <Icon name="Home" size={18} className="mr-2" />
                На главную
              </Button>
              <Button 
                className="flex-1"
                onClick={() => window.location.href = '/'}
              >
                <Icon name="Sparkles" size={18} className="mr-2" />
                Пройти новый тест
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
