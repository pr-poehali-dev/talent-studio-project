import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductEditorBasicTab from '@/components/ProductEditorBasicTab';
import ProductEditorTagsTab from '@/components/ProductEditorTagsTab';
import ProductEditorMediaTab from '@/components/ProductEditorMediaTab';
import ProductEditorAboutTab from '@/components/ProductEditorAboutTab';
import ProductEditorCompositionTab from '@/components/ProductEditorCompositionTab';

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

interface ProductEditorProps {
  product: Product;
  onChange: (product: Product) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

const ProductEditor = ({ product, onChange, onSave, onCancel, loading }: ProductEditorProps) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Основное</TabsTrigger>
          <TabsTrigger value="tags">Теги подбора</TabsTrigger>
          <TabsTrigger value="media">Изображения</TabsTrigger>
          <TabsTrigger value="about">О продукте</TabsTrigger>
          <TabsTrigger value="composition">Состав</TabsTrigger>
        </TabsList>

        <ProductEditorBasicTab product={product} onChange={onChange} />
        <ProductEditorTagsTab product={product} onChange={onChange} />
        <ProductEditorMediaTab product={product} onChange={onChange} />
        <ProductEditorAboutTab product={product} onChange={onChange} />
        <ProductEditorCompositionTab product={product} onChange={onChange} />
      </Tabs>

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={onSave} disabled={loading} className="flex-1">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default ProductEditor;
