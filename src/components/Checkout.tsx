import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { SurveyData } from '@/pages/Index';

interface CheckoutProps {
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    emoji: string;
  }>;
  surveyData?: SurveyData;
  onBack: () => void;
  onSuccess: (orderNumber: string) => void;
}

const Checkout = ({ items, surveyData, onBack, onSuccess }: CheckoutProps) => {
  const [step, setStep] = useState<'info' | 'delivery' | 'payment'>('info');
  const [loading, setLoading] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryOptions = [
    {
      id: 'courier',
      name: 'Курьерская доставка',
      price: 350,
      time: '1-2 дня',
      icon: 'Truck',
      description: 'Доставка по Москве и МО'
    },
    {
      id: 'cdek',
      name: 'СДЭК',
      price: 250,
      time: '3-5 дней',
      icon: 'Package',
      description: 'Доставка в пункт выдачи'
    },
    {
      id: 'post',
      name: 'Почта России',
      price: 200,
      time: '5-10 дней',
      icon: 'Mail',
      description: 'Доставка в отделение'
    }
  ];

  const selectedDelivery = deliveryOptions.find(d => d.id === deliveryMethod);
  const finalAmount = totalAmount + (selectedDelivery?.price || 0);

  const handleNextStep = () => {
    if (step === 'info') {
      if (!customerName || !customerEmail || !customerPhone) {
        alert('Заполните все поля');
        return;
      }
      setStep('delivery');
    } else if (step === 'delivery') {
      if (!deliveryAddress || !deliveryCity) {
        alert('Укажите адрес доставки');
        return;
      }
      setStep('payment');
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/5aa25205-978b-47a8-8f24-80c19fa25511', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          deliveryMethod,
          deliveryAddress,
          deliveryCity,
          deliveryPostalCode,
          totalAmount: finalAmount,
          items,
          surveyData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onSuccess(data.orderNumber);
      } else {
        alert('Ошибка при создании заказа');
      }
    } catch (error) {
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button variant="ghost" onClick={onBack} className="rounded-full">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Оформление заказа</h1>
            <p className="text-muted-foreground mt-1">Шаг {step === 'info' ? '1' : step === 'delivery' ? '2' : '3'} из 3</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'info' && (
              <Card className="p-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="User" size={24} className="text-primary" />
                  Контактные данные
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Имя и фамилия *</Label>
                    <Input
                      id="name"
                      placeholder="Иван Иванов"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ivan@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button onClick={handleNextStep} className="w-full mt-6" size="lg">
                  Продолжить
                  <Icon name="ArrowRight" className="ml-2" size={20} />
                </Button>
              </Card>
            )}

            {step === 'delivery' && (
              <div className="space-y-6 animate-fade-in">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon name="Truck" size={24} className="text-primary" />
                    Способ доставки
                  </h2>
                  
                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    {deliveryOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-4 p-4 rounded-xl border hover:border-primary transition-colors">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon name={option.icon as any} size={24} className="text-primary" />
                              <div>
                                <p className="font-semibold">{option.name}</p>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{option.price} ₽</p>
                              <p className="text-sm text-muted-foreground">{option.time}</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon name="MapPin" size={24} className="text-primary" />
                    Адрес доставки
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="city">Город *</Label>
                      <Input
                        id="city"
                        placeholder="Москва"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Улица, дом, квартира *</Label>
                      <Input
                        id="address"
                        placeholder="ул. Ленина, д. 1, кв. 10"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="postal">Индекс</Label>
                      <Input
                        id="postal"
                        placeholder="101000"
                        value={deliveryPostalCode}
                        onChange={(e) => setDeliveryPostalCode(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep('info')} size="lg" className="flex-1">
                    <Icon name="ArrowLeft" className="mr-2" size={20} />
                    Назад
                  </Button>
                  <Button onClick={handleNextStep} size="lg" className="flex-1">
                    Продолжить
                    <Icon name="ArrowRight" className="ml-2" size={20} />
                  </Button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <Card className="p-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="CreditCard" size={24} className="text-primary" />
                  Подтверждение заказа
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-xl bg-secondary/20">
                    <p className="text-sm text-muted-foreground mb-1">Получатель</p>
                    <p className="font-semibold">{customerName}</p>
                    <p className="text-sm">{customerEmail} • {customerPhone}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-secondary/20">
                    <p className="text-sm text-muted-foreground mb-1">Доставка</p>
                    <p className="font-semibold">{selectedDelivery?.name}</p>
                    <p className="text-sm">{deliveryCity}, {deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep('delivery')} size="lg" className="flex-1">
                    <Icon name="ArrowLeft" className="mr-2" size={20} />
                    Назад
                  </Button>
                  <Button 
                    onClick={handleSubmitOrder} 
                    size="lg" 
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Обработка...' : 'Оплатить'}
                    {!loading && <Icon name="Check" className="ml-2" size={20} />}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div>
            <Card className="p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Ваш заказ</h3>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{item.price * item.quantity} ₽</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Товары</span>
                  <span>{totalAmount} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>{selectedDelivery?.price || 0} ₽</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Итого</span>
                  <span>{finalAmount} ₽</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
