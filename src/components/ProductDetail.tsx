import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface ProductDetailProps {
  productId: number;
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

const ProductDetail = ({ productId, onBack }: ProductDetailProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProduct();
    loadCartStatus();
    loadFavoriteStatus();
  }, [productId]);

  const loadCartStatus = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setIsInCart(cart.includes(productId));
  };

  const loadFavoriteStatus = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(productId));
  };

  const toggleCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (isInCart) {
      const newCart = cart.filter((id: number) => id !== productId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      setIsInCart(false);
    } else {
      cart.push(productId);
      localStorage.setItem('cart', JSON.stringify(cart));
      setIsInCart(true);
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter((id: number) => id !== productId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      favorites.push(productId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  const loadProduct = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417?id=${productId}`);
      const data = await response.json();
      if (data.product) {
        setProduct(data.product);
        setSelectedImage(data.product.mainImage || data.product.images?.[0] || '');
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="PackageX" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Товар не найден</h2>
          <Button onClick={onBack}>Вернуться в каталог</Button>
        </div>
      </div>
    );
  }

  const hasAboutSection = product.aboutDescription || product.aboutUsage || 
    (product.documents && product.documents.length > 0) || 
    (product.videos && product.videos.length > 0);

  const hasCompositionSection = product.compositionDescription || 
    (product.compositionTable && product.compositionTable.length > 0);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад к каталогу
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-9xl">{product.emoji}</span>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === img ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <Badge variant="outline" className="mb-4">{product.category}</Badge>
              </div>
              {product.popular && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                  <Icon name="Star" size={14} className="mr-1" />
                  Популярное
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Icon name="Star" size={20} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xl font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">(128 отзывов)</span>
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Дозировка</p>
                <p className="font-semibold">{product.dosage}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Количество</p>
                <p className="font-semibold">{product.count}</p>
              </Card>
            </div>

            <div className="bg-primary/10 rounded-lg p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold">{product.price} ₽</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Label className="text-sm">Количество:</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Icon name="Minus" size={16} />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full mb-2"
                onClick={toggleCart}
                variant={isInCart ? "default" : "default"}
              >
                <Icon name={isInCart ? "Check" : "ShoppingCart"} size={20} className="mr-2" />
                {isInCart ? 'В корзине' : `Добавить в корзину (${product.price * quantity} ₽)`}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={toggleFavorite}
              >
                <Icon name="Heart" size={20} className="mr-2" fill={isFavorite ? "currentColor" : "none"} />
                {isFavorite ? 'В избранном' : 'В избранное'}
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Truck" size={16} />
                Доставка 1-3 дня
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={16} />
                Оригинальный товар
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">О продукте</TabsTrigger>
            <TabsTrigger value="composition">Состав</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы (128)</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6 mt-6">
            {!hasAboutSection ? (
              <Card className="p-8 text-center">
                <Icon name="Info" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Подробная информация скоро появится</p>
              </Card>
            ) : (
              <>
                {product.aboutDescription && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Описание</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">{product.aboutDescription}</p>
                  </Card>
                )}

                {product.aboutUsage && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Применение</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">{product.aboutUsage}</p>
                  </Card>
                )}

                {product.documents && product.documents.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Документы и материалы</h3>
                    <div className="space-y-2">
                      {product.documents.map((doc, i) => (
                        <a 
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <Icon name="FileText" size={20} className="text-primary" />
                          <span className="font-medium">{doc.name}</span>
                          <Icon name="ExternalLink" size={16} className="ml-auto text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </Card>
                )}

                {product.videos && product.videos.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Видео</h3>
                    <div className="space-y-4">
                      {product.videos.map((video, i) => (
                        <a 
                          key={i}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <Icon name="Play" size={20} className="text-primary" />
                          <span className="font-medium">{video.title}</span>
                          <Icon name="ExternalLink" size={16} className="ml-auto text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="composition" className="space-y-6 mt-6">
            {!hasCompositionSection ? (
              <Card className="p-8 text-center">
                <Icon name="FlaskConical" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Информация о составе скоро появится</p>
              </Card>
            ) : (
              <>
                {product.compositionDescription && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Описание состава</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">{product.compositionDescription}</p>
                  </Card>
                )}

                {product.compositionTable && product.compositionTable.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Активные компоненты</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Активные компоненты</TableHead>
                          <TableHead>Масса, мг</TableHead>
                          <TableHead>% от АУП*</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.compositionTable.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.component}</TableCell>
                            <TableCell>{row.mass}</TableCell>
                            <TableCell>{row.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>* АУП – адекватный уровень потребления по ЕСЭГТ.</p>
                      <p>** Не превышает верхний допустимый уровень потребления по ЕСЭГТ.</p>
                    </div>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="p-8 text-center">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Отзывы скоро появятся</h3>
              <p className="text-muted-foreground">Мы работаем над системой отзывов</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Label = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`text-sm font-medium ${className}`}>{children}</span>
);

export default ProductDetail;