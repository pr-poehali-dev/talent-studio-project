import { useSearchParams } from 'react-router-dom';
import OrderSuccess from '@/components/OrderSuccess';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  if (!orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Номер заказа не найден</p>
      </div>
    );
  }

  return <OrderSuccess orderNumber={orderNumber} />;
}
