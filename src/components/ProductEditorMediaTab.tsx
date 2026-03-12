import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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

interface Props {
  product: Product;
  onChange: (product: Product) => void;
}

const ProductEditorMediaTab = ({ product, onChange }: Props) => {
  const [newImage, setNewImage] = useState('');

  const addImage = () => {
    if (!newImage) return;
    onChange({...product, images: [...(product.images || []), newImage]});
    setNewImage('');
  };

  const removeImage = (index: number) => {
    const newImages = [...(product.images || [])];
    newImages.splice(index, 1);
    onChange({...product, images: newImages});
  };

  return (
    <TabsContent value="media" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
      <div>
        <Label>Основное изображение (URL)</Label>
        <Input
          value={product.mainImage || ''}
          onChange={(e) => onChange({...product, mainImage: e.target.value})}
          placeholder="https://example.com/main-image.jpg"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Главное изображение, которое показывается в каталоге
        </p>
      </div>

      <div>
        <Label>Дополнительные изображения</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <Button type="button" onClick={addImage} size="sm">
            <Icon name="Plus" size={16} />
          </Button>
        </div>
        {product.images && product.images.length > 0 && (
          <div className="mt-3 space-y-2">
            {product.images.map((img, i) => (
              <Card key={i} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={img} alt="" className="w-12 h-12 object-cover rounded" />
                  <span className="text-sm truncate">{img}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeImage(i)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default ProductEditorMediaTab;
