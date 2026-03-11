import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface AdminOrdersTabProps {
  orders: Order[];
}

const AdminOrdersTab = ({ orders }: AdminOrdersTabProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Заказы</h2>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер заказа</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Оплата</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="font-semibold">{order.totalAmount} ₽</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                    {order.status === 'pending' ? 'В обработке' : order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={order.paymentStatus === 'pending' ? 'outline' : 'default'}>
                    {order.paymentStatus === 'pending' ? 'Ожидает' : order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminOrdersTab;
