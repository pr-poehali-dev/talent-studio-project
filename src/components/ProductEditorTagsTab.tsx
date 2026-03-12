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

const tagMapping: Record<string, string[]> = {
  'vitamin_d3': ['витамин d', 'витамин д', 'холекальциферол', 'cholecalciferol', 'vitamin d3', 'vitamin d'],
  'omega_3': ['омега-3', 'омега 3', 'omega-3', 'omega 3', 'эпк', 'дгк', 'epa', 'dha', 'рыбий жир'],
  'magnesium': ['магний', 'magnesium', 'цитрат магния', 'оксид магния', 'magnesium citrate'],
  'b_complex': ['витамин b', 'витамин в', 'b-комплекс', 'b complex', 'тиамин', 'рибофлавин', 'ниацин', 'b1', 'b2', 'b3', 'b6', 'b12', 'фолиевая', 'folic'],
  'vitamin_c': ['витамин c', 'витамин с', 'аскорбиновая', 'ascorbic', 'vitamin c'],
  'zinc': ['цинк', 'zinc'],
  'coq10': ['коэнзим', 'q10', 'coq10', 'убихинон', 'coenzyme'],
  'iron': ['железо', 'iron', 'феррум'],
  'curcumin': ['куркумин', 'curcumin', 'куркума', 'turmeric'],
  'probiotics': ['пробиотик', 'probiotics', 'лактобактерии', 'бифидобактерии', 'lactobacillus', 'bifidobacterium'],
  'collagen': ['коллаген', 'collagen'],
  'ashwagandha': ['ашваганда', 'ашвагандха', 'ashwagandha', 'withania'],
  'l_theanine': ['л-теанин', 'l-theanine', 'теанин', 'theanine'],
  'melatonin': ['мелатонин', 'melatonin'],
  'creatine': ['креатин', 'creatine'],
  'rhodiola': ['родиола', 'rhodiola', 'золотой корень']
};

const ProductEditorTagsTab = ({ product, onChange }: Props) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (!newTag) return;
    onChange({...product, recommendation_tags: [...(product.recommendation_tags || []), newTag]});
    setNewTag('');
  };

  const removeTag = (index: number) => {
    const newTags = [...(product.recommendation_tags || [])];
    newTags.splice(index, 1);
    onChange({...product, recommendation_tags: newTags});
  };

  const autoDetectTags = () => {
    if (!product.compositionTable || product.compositionTable.length === 0) return;

    const detectedTags = new Set<string>();
    const compositionText = product.compositionTable
      .map(row => row.component.toLowerCase())
      .join(' ');

    Object.entries(tagMapping).forEach(([tag, keywords]) => {
      const hasMatch = keywords.some(keyword =>
        compositionText.includes(keyword.toLowerCase())
      );
      if (hasMatch) {
        detectedTags.add(tag);
      }
    });

    if (detectedTags.size > 0) {
      const currentTags = new Set(product.recommendation_tags || []);
      detectedTags.forEach(tag => currentTags.add(tag));
      onChange({...product, recommendation_tags: Array.from(currentTags)});
    }
  };

  return (
    <TabsContent value="tags" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
      <Card className="p-4 bg-muted/50">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={20} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-2">
              <p><strong>Теги для алгоритма подбора витаминов</strong></p>
              <p className="text-muted-foreground">
                Добавьте теги, которые соответствуют этому товару. Алгоритм будет использовать их для рекомендаций.
              </p>
              <div className="space-y-1 text-xs">
                <p><strong>Доступные теги:</strong></p>
                <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                  <span>• vitamin_d3 - Витамин D3</span>
                  <span>• omega_3 - Омега-3</span>
                  <span>• magnesium - Магний</span>
                  <span>• b_complex - B-комплекс</span>
                  <span>• vitamin_c - Витамин C</span>
                  <span>• zinc - Цинк</span>
                  <span>• coq10 - Коэнзим Q10</span>
                  <span>• iron - Железо</span>
                  <span>• curcumin - Куркумин</span>
                  <span>• probiotics - Пробиотики</span>
                  <span>• collagen - Коллаген</span>
                  <span>• ashwagandha - Ашваганда</span>
                  <span>• l_theanine - L-теанин</span>
                  <span>• melatonin - Мелатонин</span>
                  <span>• creatine - Креатин</span>
                  <span>• rhodiola - Родиола</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Label>Теги подбора</Label>
        <Button
          type="button"
          onClick={autoDetectTags}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Icon name="Sparkles" size={16} />
          Определить автоматически
        </Button>
      </div>

      <div>
        <div className="flex gap-2 mt-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="vitamin_d3"
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <Button type="button" onClick={addTag} variant="outline">
            <Icon name="Plus" size={16} />
          </Button>
        </div>

        {product.recommendation_tags && product.recommendation_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {product.recommendation_tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default ProductEditorTagsTab;
