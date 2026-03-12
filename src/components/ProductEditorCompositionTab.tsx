import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const ProductEditorCompositionTab = ({ product, onChange }: Props) => {
  const addCompositionRow = () => {
    onChange({
      ...product,
      compositionTable: [...(product.compositionTable || []), {component: '', mass: '', percentage: ''}]
    });
  };

  const updateCompositionRow = (index: number, field: string, value: string) => {
    const newTable = [...(product.compositionTable || [])];
    newTable[index] = {...newTable[index], [field]: value};
    onChange({...product, compositionTable: newTable});
  };

  const removeCompositionRow = (index: number) => {
    const newTable = [...(product.compositionTable || [])];
    newTable.splice(index, 1);
    onChange({...product, compositionTable: newTable});
  };

  return (
    <TabsContent value="composition" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
      <div>
        <Label>Описание состава</Label>
        <Textarea
          value={product.compositionDescription || ''}
          onChange={(e) => onChange({...product, compositionDescription: e.target.value})}
          placeholder="Общее описание состава продукта"
          rows={4}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Таблица активных компонентов</Label>
          <Button type="button" onClick={addCompositionRow} size="sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить строку
          </Button>
        </div>

        {(!product.compositionTable || product.compositionTable.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Нажмите "Добавить строку" чтобы начать
          </p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
              <div>Активные компоненты</div>
              <div>Масса, мг</div>
              <div>% от АУП*</div>
              <div></div>
            </div>
            {product.compositionTable.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <Input
                  value={row.component}
                  onChange={(e) => updateCompositionRow(i, 'component', e.target.value)}
                  placeholder="Витамин D3"
                />
                <Input
                  value={row.mass}
                  onChange={(e) => updateCompositionRow(i, 'mass', e.target.value)}
                  placeholder="50"
                />
                <Input
                  value={row.percentage}
                  onChange={(e) => updateCompositionRow(i, 'percentage', e.target.value)}
                  placeholder="100"
                />
                <Button variant="ghost" size="sm" onClick={() => removeCompositionRow(i)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          * АУП – адекватный уровень потребления по ЕСЭГТ.<br/>
          ** Не превышает верхний допустимый уровень потребления по ЕСЭГТ.
        </p>
      </div>
    </TabsContent>
  );
};

export default ProductEditorCompositionTab;
