import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface CatalogProps {
  onBack: () => void;
  onProductClick?: (productId: number) => void;
  onCheckout?: (items: Array<{id: number; name: string; price: number; quantity: number; emoji: string}>) => void;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  dosage: string;
  count: string;
  rating: number;
  emoji: string;
  popular: boolean;
  inStock: boolean;
  description?: string;
  mainImage?: string;
}

const Catalog = ({ onBack, onProductClick, onCheckout }: CatalogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fallbackProducts = [
    {
      id: 1,
      name: 'Витамин D3',
      category: 'Витамины',
      price: 890,
      dosage: '2000 МЕ',
      count: '90 капсул',
      rating: 4.8,
      emoji: '☀️',
      popular: true
    },
    {
      id: 2,
      name: 'Омега-3 премиум',
      category: 'Жирные кислоты',
      price: 1590,
      dosage: '1000 мг',
      count: '60 капсул',
      rating: 4.9,
      emoji: '🐟',
      popular: true
    },
    {
      id: 3,
      name: 'Магний цитрат',
      category: 'Минералы',
      price: 690,
      dosage: '400 мг',
      count: '100 таблеток',
      rating: 4.7,
      emoji: '🌙',
      popular: false
    },
    {
      id: 4,
      name: 'B-комплекс',
      category: 'Витамины',
      price: 790,
      dosage: 'Комплекс',
      count: '60 капсул',
      rating: 4.6,
      emoji: '⚡',
      popular: true
    },
    {
      id: 5,
      name: 'Цинк хелат',
      category: 'Минералы',
      price: 590,
      dosage: '15 мг',
      count: '90 таблеток',
      rating: 4.5,
      emoji: '🛡️',
      popular: false
    },
    {
      id: 6,
      name: 'Коэнзим Q10',
      category: 'Коэнзимы',
      price: 1290,
      dosage: '100 мг',
      count: '60 капсул',
      rating: 4.8,
      emoji: '💎',
      popular: false
    },
    {
      id: 7,
      name: 'Витамин C',
      category: 'Витамины',
      price: 490,
      dosage: '1000 мг',
      count: '120 таблеток',
      rating: 4.7,
      emoji: '🍊',
      popular: true
    },
    {
      id: 8,
      name: 'Кальций + D3',
      category: 'Минералы',
      price: 890,
      dosage: '600 мг + 400 МЕ',
      count: '90 таблеток',
      rating: 4.6,
      emoji: '🦴',
      popular: false
    }
  ];

  const toggleCart = (id: number) => {
    setCart(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const [activeCategory, setActiveCategory] = useState('Все');

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  const categories = ['Все', ...Array.from(new Set(displayProducts.map(p => p.category)))];

  const filteredProducts = displayProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Все' || product.category === activeCategory;
    const isInStock = product.inStock !== false;
    return matchesSearch && matchesCategory && isInStock;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка каталога...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Каталог витаминов</h1>
              <p className="text-muted-foreground mt-1">{displayProducts.length} товаров в наличии</p>
            </div>
          </div>
          <div className="relative">
            <Button variant="outline" className="rounded-full gap-2">
              <Icon name="ShoppingCart" size={20} />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="relative">
            <Icon name="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Поиск витаминов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full"
            />
          </div>
        </div>

        <Tabs defaultValue="Все" className="mb-8" onValueChange={setActiveCategory}>
          <TabsList className="w-full justify-start overflow-x-auto rounded-full">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="rounded-full px-6">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="p-6 hover-scale transition-all duration-300 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onProductClick?.(product.id)}
            >
              <div className="relative mb-4">
                {product.popular && (
                  <Badge className="absolute top-2 right-2 z-10">
                    <Icon name="TrendingUp" size={12} className="mr-1" />
                    Популярное
                  </Badge>
                )}
                {product.mainImage ? (
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-muted mb-4">
                    <img 
                      src={product.mainImage} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">' + product.emoji + '</div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-6xl mb-4">
                    {product.emoji}
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
              </div>
              
              <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon name="Pill" size={14} />
                  <span>{product.dosage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Package" size={14} />
                  <span>{product.count}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="text-2xl font-bold">{product.price} ₽</div>
                  <div className="text-xs text-muted-foreground">за упаковку</div>
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCart(product.id);
                  }}
                  variant={cart.includes(product.id) ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                >
                  <Icon name={cart.includes(product.id) ? "Check" : "Plus"} size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-slide-in-right">
            <Card className="p-6 shadow-2xl bg-primary text-primary-foreground">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-sm opacity-90">Товаров в корзине</div>
                  <div className="text-2xl font-bold">{cart.length}</div>
                </div>
                <div className="h-12 w-px bg-primary-foreground/20"></div>
                <div>
                  <div className="text-sm opacity-90">Сумма</div>
                  <div className="text-2xl font-bold">
                    {products.filter(p => cart.includes(p.id)).reduce((sum, p) => sum + p.price, 0)} ₽
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="ml-4 rounded-full"
                  onClick={() => {
                    const cartItems = displayProducts
                      .filter(p => cart.includes(p.id))
                      .map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        quantity: 1,
                        emoji: p.emoji
                      }));
                    onCheckout?.(cartItems);
                  }}
                >
                  Оформить заказ
                  <Icon name="ArrowRight" className="ml-2" size={18} />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;