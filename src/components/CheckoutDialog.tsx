import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { getOrdersUrl } from '@/config/api';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  duration: number;
  userId: number;
  surveyId: number;
}

export default function CheckoutDialog({ 
  isOpen, 
  onClose, 
  amount, 
  duration,
  userId,
  surveyId
}: CheckoutDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryPostalCode: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deliveryMethod: 'courier',
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        deliveryPostalCode: formData.deliveryPostalCode,
        totalAmount: amount,
        items: [
          {
            id: 1,
            name: `Витаминный курс на ${duration} ${duration === 1 ? 'месяц' : 'месяца'}`,
            price: amount,
            quantity: 1,
            duration: duration
          }
        ],
        surveyData: {
          userId: userId,
          surveyId: surveyId
        }
      };

      const response = await fetch(getOrdersUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        // Перенаправляем на страницу оплаты ЮKassa
        window.location.href = result.paymentUrl;
      } else {
        alert('Ошибка создания заказа. Попробуйте позже.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ошибка оформления заказа');
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.customerName && formData.customerEmail && formData.customerPhone;
    }
    if (step === 2) {
      return formData.deliveryAddress && formData.deliveryCity && formData.deliveryPostalCode;
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Оформление заказа</DialogTitle>
          <DialogDescription>
            Курс на {duration} {duration === 1 ? 'месяц' : duration < 5 ? 'месяца' : 'месяцев'} — {amount.toLocaleString()} ₽
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Индикатор шагов */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-muted-foreground'}`}>
                {step > 1 ? <Icon name="Check" size={16} /> : '1'}
              </div>
              <span className="text-sm font-medium">Контактные данные</span>
            </div>
            <div className="w-12 h-0.5 bg-muted" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-muted-foreground'}`}>
                2
              </div>
              <span className="text-sm font-medium">Доставка</span>
            </div>
          </div>

          {/* Шаг 1: Контактные данные */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">ФИО *</Label>
                <Input
                  id="name"
                  placeholder="Иван Иванов"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ivan@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 999 123-45-67"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Шаг 2: Доставка */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="city">Город *</Label>
                <Input
                  id="city"
                  placeholder="Москва"
                  value={formData.deliveryCity}
                  onChange={(e) => handleInputChange('deliveryCity', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Адрес доставки *</Label>
                <Textarea
                  id="address"
                  placeholder="ул. Ленина, д. 1, кв. 10"
                  value={formData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="postal">Индекс *</Label>
                <Input
                  id="postal"
                  placeholder="123456"
                  value={formData.deliveryPostalCode}
                  onChange={(e) => handleInputChange('deliveryPostalCode', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Кнопки навигации */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                <Icon name="ArrowLeft" size={18} className="mr-2" />
                Назад
              </Button>
            )}
            
            {step === 1 && (
              <Button
                className="flex-1"
                onClick={() => setStep(2)}
                disabled={!isStepValid()}
              >
                Далее
                <Icon name="ArrowRight" size={18} className="ml-2" />
              </Button>
            )}

            {step === 2 && (
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Создаём заказ...
                  </>
                ) : (
                  <>
                    <Icon name="CreditCard" size={18} className="mr-2" />
                    Перейти к оплате
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            <Icon name="Lock" size={12} className="inline mr-1" />
            Безопасная оплата через ЮKassa
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
