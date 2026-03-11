import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminSurveyTab from '@/components/admin/AdminSurveyTab';
import AdminSyncTab from '@/components/admin/AdminSyncTab';

interface AdminProps {
  onBack: () => void;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  dosage: string;
  count: string;
  description: string;
  emoji: string;
  rating: number;
  popular: boolean;
  inStock: boolean;
  images?: string[];
  mainImage?: string;
  aboutDescription?: string;
  aboutUsage?: string;
  documents?: Array<{name: string; url: string}>;
  videos?: Array<{title: string; url: string}>;
  compositionDescription?: string;
  compositionTable?: Array<{component: string; mass: string; percentage: string}>;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface SurveyQuestion {
  id: number;
  questionText: string;
  questionType: string;
  options?: string[];
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
}

interface SyncSetting {
  id: number;
  syncType: string;
  isActive: boolean;
  sourceUrl: string;
  scheduleMinutes: number;
  updatePricesOnly: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: string;
}

interface SyncLog {
  id: number;
  startedAt: string;
  finishedAt?: string;
  status: string;
  itemsProcessed: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errorMessage?: string;
}

const Admin = ({ onBack }: AdminProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [syncSettings, setSyncSettings] = useState<SyncSetting[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [editingSyncSetting, setEditingSyncSetting] = useState<SyncSetting | null>(null);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadQuestions();
    loadSyncSettings();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5aa25205-978b-47a8-8f24-80c19fa25511');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/a6d2ac27-1d35-4daa-b1e5-e9bbe2ad3a31?action=questions&includeInactive=true');
      const data = await response.json();
      const mappedQuestions = (data.questions || []).map((q: any) => ({
        id: q.id,
        questionText: q.question_text,
        questionType: q.question_type,
        options: q.options?.choices || [],
        isRequired: q.required,
        displayOrder: q.order_index,
        isActive: q.active
      }));
      console.log('Loaded questions:', mappedQuestions);
      setQuestions(mappedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadSyncSettings = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731?resource=settings');
      const data = await response.json();
      setSyncSettings(data.settings || []);
    } catch (error) {
      console.error('Error loading sync settings:', error);
    }
  };

  const loadSyncLogs = async (settingId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731?resource=logs&setting_id=${settingId}`);
      const data = await response.json();
      setSyncLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      const method = editingProduct.id ? 'PUT' : 'POST';
      const response = await fetch('https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Товар сохранён');
        loadProducts();
        setEditingProduct(null);
      }
    } catch (error) {
      alert('Ошибка при сохранении товара');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Удалить товар?')) return;

    try {
      await fetch(`https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417?id=${id}`, {
        method: 'DELETE'
      });
      loadProducts();
    } catch (error) {
      alert('Ошибка при удалении товара');
    }
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;

    setLoading(true);
    try {
      const method = editingQuestion.id ? 'PUT' : 'POST';
      const options = editingQuestion.options && editingQuestion.options.length > 0 
        ? { choices: editingQuestion.options }
        : {};

      const body = {
        id: editingQuestion.id,
        category: 'general',
        question_text: editingQuestion.questionText,
        question_type: editingQuestion.questionType,
        options: options,
        placeholder: '',
        required: editingQuestion.isRequired,
        order_index: editingQuestion.displayOrder,
        active: editingQuestion.isActive
      };

      const response = await fetch('https://functions.poehali.dev/a6d2ac27-1d35-4daa-b1e5-e9bbe2ad3a31?action=questions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Вопрос сохранён');
        loadQuestions();
        setEditingQuestion(null);
      } else {
        alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      alert('Ошибка при сохранении вопроса');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Удалить вопрос?')) return;

    try {
      await fetch(`https://functions.poehali.dev/a6d2ac27-1d35-4daa-b1e5-e9bbe2ad3a31?action=questions&id=${id}`, {
        method: 'DELETE'
      });
      loadQuestions();
    } catch (error) {
      alert('Ошибка при удалении вопроса');
      console.error(error);
    }
  };

  const handleMoveQuestion = async (id: number, direction: 'up' | 'down') => {
    const sortedQuestions = [...questions].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sortedQuestions.findIndex(q => q.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedQuestions.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const currentQ = sortedQuestions[index];
    const swapQ = sortedQuestions[newIndex];

    try {
      // Swap order_index values
      const response1 = await fetch('https://functions.poehali.dev/a6d2ac27-1d35-4daa-b1e5-e9bbe2ad3a31?action=questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: currentQ.id, 
          category: 'general',
          question_text: currentQ.questionText,
          question_type: currentQ.questionType,
          options: currentQ.options && currentQ.options.length > 0 ? { choices: currentQ.options } : {},
          placeholder: '',
          required: currentQ.isRequired,
          order_index: swapQ.displayOrder,
          active: currentQ.isActive
        })
      });

      const response2 = await fetch('https://functions.poehali.dev/a6d2ac27-1d35-4daa-b1e5-e9bbe2ad3a31?action=questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: swapQ.id,
          category: 'general',
          question_text: swapQ.questionText,
          question_type: swapQ.questionType,
          options: swapQ.options && swapQ.options.length > 0 ? { choices: swapQ.options } : {},
          placeholder: '',
          required: swapQ.isRequired,
          order_index: currentQ.displayOrder,
          active: swapQ.isActive
        })
      });

      if (response1.ok && response2.ok) {
        loadQuestions();
      } else {
        alert('Ошибка при изменении порядка');
      }
    } catch (error) {
      alert('Ошибка при изменении порядка');
      console.error(error);
    }
  };

  const handleSaveSyncSetting = async () => {
    if (!editingSyncSetting) return;

    setLoading(true);
    try {
      const method = editingSyncSetting.id ? 'PUT' : 'POST';
      const response = await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSyncSetting)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Настройка сохранена');
        loadSyncSettings();
        setEditingSyncSetting(null);
      }
    } catch (error) {
      alert('Ошибка при сохранении настройки');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSync = async (settingId: number) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731?action=sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Синхронизация завершена!\nДобавлено: ${data.itemsAdded}\nОбновлено: ${data.itemsUpdated}\nПропущено: ${data.itemsSkipped}`);
        loadProducts();
        loadSyncSettings();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      alert('Ошибка при синхронизации');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSyncActive = async (setting: SyncSetting) => {
    try {
      await fetch('https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: setting.id, isActive: !setting.isActive })
      });
      loadSyncSettings();
    } catch (error) {
      alert('Ошибка при изменении статуса');
    }
  };

  const handleDeleteSyncSetting = async (id: number) => {
    if (!confirm('Отключить эту синхронизацию?')) return;

    try {
      await fetch(`https://functions.poehali.dev/7b036231-df88-4c5e-adc8-37faa7e68731?id=${id}`, {
        method: 'DELETE'
      });
      loadSyncSettings();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Панель администратора</h1>
              <p className="text-muted-foreground mt-1">Управление каталогом и заказами</p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Icon name="Shield" size={16} className="mr-2" />
            Admin
          </Badge>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">
              <Icon name="Package" size={18} className="mr-2" />
              Товары ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Icon name="ShoppingBag" size={18} className="mr-2" />
              Заказы ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="survey">
              <Icon name="ClipboardList" size={18} className="mr-2" />
              Анкета ({questions.length})
            </TabsTrigger>
            <TabsTrigger value="sync">
              <Icon name="RefreshCw" size={18} className="mr-2" />
              Синхронизация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <AdminProductsTab
              products={products}
              loading={loading}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
            />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersTab orders={orders} />
          </TabsContent>

          <TabsContent value="survey">
            <AdminSurveyTab
              questions={questions}
              loading={loading}
              onSaveQuestion={handleSaveQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onMoveQuestion={handleMoveQuestion}
              editingQuestion={editingQuestion}
              setEditingQuestion={setEditingQuestion}
            />
          </TabsContent>

          <TabsContent value="sync">
            <AdminSyncTab
              syncSettings={syncSettings}
              syncLogs={syncLogs}
              loading={loading}
              onRunSync={handleRunSync}
              onToggleSyncActive={handleToggleSyncActive}
              onSaveSyncSetting={handleSaveSyncSetting}
              onDeleteSyncSetting={handleDeleteSyncSetting}
              onLoadSyncLogs={loadSyncLogs}
              editingSyncSetting={editingSyncSetting}
              setEditingSyncSetting={setEditingSyncSetting}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;