import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ProductEditor from '@/components/ProductEditor';

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
  recommendation_tags?: string[];
}

interface AdminProductsTabProps {
  products: Product[];
  loading: boolean;
  onSaveProduct: () => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
}

const AdminProductsTab = ({
  products,
  loading,
  onSaveProduct,
  onDeleteProduct,
  editingProduct,
  setEditingProduct
}: AdminProductsTabProps) => {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Каталог товаров</h2>
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProduct({ 
                id: 0, name: '', category: '', price: 0, dosage: '', count: '', 
                description: '', emoji: '💊', rating: 0, popular: false, inStock: true,
                images: [], mainImage: '', aboutDescription: '', aboutUsage: '',
                documents: [], videos: [], compositionDescription: '', compositionTable: [],
                recommendation_tags: []
              });
              setIsProductDialogOpen(true);
            }}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct?.id ? 'Редактировать товар' : 'Новый товар'}
              </DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductEditor
                product={editingProduct}
                onChange={setEditingProduct}
                onSave={async () => {
                  await onSaveProduct();
                  setIsProductDialogOpen(false);
                }}
                onCancel={() => {
                  setEditingProduct(null);
                  setIsProductDialogOpen(false);
                }}
                loading={loading}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Рейтинг</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{product.emoji}</span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.dosage}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell className="font-semibold">{product.price} ₽</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{product.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.popular && <Badge variant="default" className="text-xs">Популярное</Badge>}
                    {product.inStock ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">В наличии</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-red-600 border-red-600">Нет в наличии</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsProductDialogOpen(true);
                      }}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProduct(product.id)}
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

export default AdminProductsTab;