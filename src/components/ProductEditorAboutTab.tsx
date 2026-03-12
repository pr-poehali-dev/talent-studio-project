import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const ProductEditorAboutTab = ({ product, onChange }: Props) => {
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const addDocument = () => {
    if (!newDocName || !newDocUrl) return;
    onChange({...product, documents: [...(product.documents || []), {name: newDocName, url: newDocUrl}]});
    setNewDocName('');
    setNewDocUrl('');
  };

  const removeDocument = (index: number) => {
    const newDocs = [...(product.documents || [])];
    newDocs.splice(index, 1);
    onChange({...product, documents: newDocs});
  };

  const addVideo = () => {
    if (!newVideoTitle || !newVideoUrl) return;
    onChange({...product, videos: [...(product.videos || []), {title: newVideoTitle, url: newVideoUrl}]});
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const removeVideo = (index: number) => {
    const newVideos = [...(product.videos || [])];
    newVideos.splice(index, 1);
    onChange({...product, videos: newVideos});
  };

  return (
    <TabsContent value="about" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
      <div>
        <Label>Описание</Label>
        <Textarea
          value={product.aboutDescription || ''}
          onChange={(e) => onChange({...product, aboutDescription: e.target.value})}
          placeholder="Подробное описание продукта, его свойств и особенностей"
          rows={5}
        />
      </div>

      <div>
        <Label>Применение</Label>
        <Textarea
          value={product.aboutUsage || ''}
          onChange={(e) => onChange({...product, aboutUsage: e.target.value})}
          placeholder="Как и когда принимать, дозировки, рекомендации"
          rows={5}
        />
      </div>

      <div>
        <Label>Документы и материалы (до 5 PDF)</Label>
        <div className="space-y-2 mt-2">
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="Название документа"
            />
            <Input
              value={newDocUrl}
              onChange={(e) => setNewDocUrl(e.target.value)}
              placeholder="https://example.com/doc.pdf"
              className="col-span-2"
            />
          </div>
          <Button
            type="button"
            onClick={addDocument}
            size="sm"
            disabled={(product.documents?.length || 0) >= 5}
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить документ
          </Button>
        </div>
        {product.documents && product.documents.length > 0 && (
          <div className="mt-3 space-y-2">
            {product.documents.map((doc, i) => (
              <Card key={i} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{doc.url}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeDocument(i)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Видео</Label>
        <div className="space-y-2 mt-2">
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
              placeholder="Название видео"
            />
            <Input
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="col-span-2"
            />
          </div>
          <Button type="button" onClick={addVideo} size="sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить видео
          </Button>
        </div>
        {product.videos && product.videos.length > 0 && (
          <div className="mt-3 space-y-2">
            {product.videos.map((video, i) => (
              <Card key={i} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{video.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{video.url}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeVideo(i)}>
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

export default ProductEditorAboutTab;
