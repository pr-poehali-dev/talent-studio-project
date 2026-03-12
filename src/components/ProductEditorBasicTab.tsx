import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TabsContent } from '@/components/ui/tabs';

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

const ProductEditorBasicTab = ({ product, onChange }: Props) => {
  return (
    <TabsContent value="basic" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Название *</Label>
          <Input
            value={product.name}
            onChange={(e) => onChange({...product, name: e.target.value})}
            placeholder="Витамин D3"
          />
        </div>
        <div>
          <Label>Категория</Label>
          <Input
            value={product.category}
            onChange={(e) => onChange({...product, category: e.target.value})}
            placeholder="Витамины"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Цена (₽) *</Label>
          <Input
            type="number"
            value={product.price}
            onChange={(e) => onChange({...product, price: Number(e.target.value)})}
          />
        </div>
        <div>
          <Label>Дозировка</Label>
          <Input
            value={product.dosage}
            onChange={(e) => onChange({...product, dosage: e.target.value})}
            placeholder="2000 МЕ"
          />
        </div>
        <div>
          <Label>Количество</Label>
          <Input
            value={product.count}
            onChange={(e) => onChange({...product, count: e.target.value})}
            placeholder="90 капсул"
          />
        </div>
      </div>
      
      <div>
        <Label>Краткое описание</Label>
        <Textarea
          value={product.description}
          onChange={(e) => onChange({...product, description: e.target.value})}
          placeholder="Краткое описание товара для каталога"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Emoji</Label>
          <Input
            value={product.emoji}
            onChange={(e) => onChange({...product, emoji: e.target.value})}
            placeholder="💊"
          />
        </div>
        <div>
          <Label>Рейтинг</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={product.rating}
            onChange={(e) => onChange({...product, rating: Number(e.target.value)})}
          />
        </div>
        <div className="flex flex-col gap-2 justify-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={product.popular}
              onChange={(e) => onChange({...product, popular: e.target.checked})}
              className="w-4 h-4"
            />
            <span className="text-sm">Популярный</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={product.inStock}
              onChange={(e) => onChange({...product, inStock: e.target.checked})}
              className="w-4 h-4"
            />
            <span className="text-sm">В наличии</span>
          </label>
        </div>
      </div>
    </TabsContent>
  );
};

export default ProductEditorBasicTab;
