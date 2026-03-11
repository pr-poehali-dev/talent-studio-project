import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface PageBuilderProps {
  onBack: () => void;
}

interface Block {
  id: string;
  type: string;
  content: any;
  styles?: any;
}

interface Page {
  id?: number;
  slug: string;
  title: string;
  metaDescription?: string;
  isPublished: boolean;
  blocks: Block[];
  styles: any;
}

const PageBuilder = ({ onBack }: PageBuilderProps) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadPages();
    loadTemplates();
  }, []);

  const loadPages = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5?resource=pages');
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5?resource=templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSelectPage = async (slug: string) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5?resource=pages&slug=${slug}`);
      const data = await response.json();
      setSelectedPage(data.page);
    } catch (error) {
      console.error('Error loading page:', error);
    }
  };

  const handleCreatePage = () => {
    setSelectedPage({
      slug: 'new-page',
      title: 'Новая страница',
      isPublished: false,
      blocks: [],
      styles: {
        fontFamily: 'Rubik',
        primaryColor: '#8B5CF6',
        backgroundColor: '#ffffff'
      }
    });
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;

    setLoading(true);
    try {
      const method = selectedPage.id ? 'PUT' : 'POST';
      const response = await fetch('https://functions.poehali.dev/91d2a680-560a-4c90-8c01-c525dfc2e2b5', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPage)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Страница сохранена!');
        loadPages();
      }
    } catch (error) {
      alert('Ошибка при сохранении страницы');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = (template: any) => {
    if (!selectedPage) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: template.componentData.type,
      content: template.componentData,
      styles: template.defaultStyles
    };

    setSelectedPage({
      ...selectedPage,
      blocks: [...selectedPage.blocks, newBlock]
    });
  };

  const handleUpdateBlock = (blockId: string, updates: any) => {
    if (!selectedPage) return;

    setSelectedPage({
      ...selectedPage,
      blocks: selectedPage.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!selectedPage) return;

    setSelectedPage({
      ...selectedPage,
      blocks: selectedPage.blocks.filter(block => block.id !== blockId)
    });
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (!selectedPage) return;

    const index = selectedPage.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newBlocks = [...selectedPage.blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

    setSelectedPage({
      ...selectedPage,
      blocks: newBlocks
    });
  };

  const renderBlockPreview = (block: Block) => {
    const { type, content } = block;

    if (type === 'hero') {
      return (
        <div className="p-12 text-center bg-gradient-to-b from-primary/5 to-transparent">
          <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
          <p className="text-xl text-muted-foreground">{content.subtitle}</p>
        </div>
      );
    }

    if (type === 'features') {
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">{content.title}</h2>
          <div className="grid grid-cols-3 gap-4">
            {content.items?.slice(0, 3).map((item: any, i: number) => (
              <div key={i} className="text-center p-4 border rounded-lg">
                <Icon name={item.icon} className="mx-auto mb-2" size={32} />
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'cta') {
      return (
        <div className="p-12 text-center bg-gradient-to-r from-primary to-purple-600 text-white">
          <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
          <p className="text-lg mb-6">{content.subtitle}</p>
          <Button variant="secondary" size="lg">{content.buttonText}</Button>
        </div>
      );
    }

    return (
      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <Icon name="Layout" size={48} className="mx-auto mb-2 opacity-50" />
        <p>Блок типа: {type}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Конструктор страниц</h1>
              <p className="text-muted-foreground mt-1">Создавайте и редактируйте страницы сайта</p>
            </div>
          </div>
          {selectedPage && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                <Icon name={previewMode ? "Edit" : "Eye"} size={18} className="mr-2" />
                {previewMode ? 'Редактор' : 'Превью'}
              </Button>
              <Button onClick={handleSavePage} disabled={loading}>
                <Icon name="Save" size={18} className="mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Левая панель - список страниц и шаблоны */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Страницы</h3>
                <Button size="sm" variant="outline" onClick={handleCreatePage}>
                  <Icon name="Plus" size={14} />
                </Button>
              </div>
              <div className="space-y-2">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => handleSelectPage(page.slug)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPage?.slug === page.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{page.title}</span>
                      {page.isPublished && (
                        <Badge variant="outline" className="text-xs">
                          <Icon name="Eye" size={10} />
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs opacity-75">/{page.slug}</span>
                  </div>
                ))}
              </div>
            </Card>

            {selectedPage && !previewMode && (
              <Card className="p-4">
                <h3 className="font-bold mb-4">Добавить блок</h3>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => handleAddBlock(template)}
                    >
                      <Icon name="Plus" size={14} className="mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Центральная панель - редактор */}
          <div className="lg:col-span-2">
            {selectedPage ? (
              <div className="space-y-4">
                {!previewMode && (
                  <Card className="p-6">
                    <Tabs defaultValue="settings">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="settings">Настройки</TabsTrigger>
                        <TabsTrigger value="styles">Стили</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="settings" className="space-y-4 mt-4">
                        <div>
                          <Label>Название страницы</Label>
                          <Input
                            value={selectedPage.title}
                            onChange={(e) => setSelectedPage({...selectedPage, title: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>URL (slug)</Label>
                          <Input
                            value={selectedPage.slug}
                            onChange={(e) => setSelectedPage({...selectedPage, slug: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Мета-описание</Label>
                          <Textarea
                            value={selectedPage.metaDescription || ''}
                            onChange={(e) => setSelectedPage({...selectedPage, metaDescription: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Опубликовать</Label>
                          <Switch
                            checked={selectedPage.isPublished}
                            onCheckedChange={(checked) => setSelectedPage({...selectedPage, isPublished: checked})}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="styles" className="space-y-4 mt-4">
                        <div>
                          <Label>Шрифт</Label>
                          <Select
                            value={selectedPage.styles.fontFamily}
                            onValueChange={(value) => setSelectedPage({
                              ...selectedPage,
                              styles: {...selectedPage.styles, fontFamily: value}
                            })}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Rubik">Rubik</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Основной цвет</Label>
                          <Input
                            type="color"
                            value={selectedPage.styles.primaryColor}
                            onChange={(e) => setSelectedPage({
                              ...selectedPage,
                              styles: {...selectedPage.styles, primaryColor: e.target.value}
                            })}
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label>Фон страницы</Label>
                          <Input
                            type="color"
                            value={selectedPage.styles.backgroundColor}
                            onChange={(e) => setSelectedPage({
                              ...selectedPage,
                              styles: {...selectedPage.styles, backgroundColor: e.target.value}
                            })}
                            className="mt-2 h-12"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </Card>
                )}

                {/* Блоки */}
                <div className="space-y-4">
                  {selectedPage.blocks.length === 0 ? (
                    <Card className="p-12 text-center text-muted-foreground">
                      <Icon name="Layout" size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Страница пуста</p>
                      <p className="text-sm">Добавьте блоки из библиотеки слева</p>
                    </Card>
                  ) : (
                    selectedPage.blocks.map((block, index) => (
                      <Card key={block.id} className="overflow-hidden">
                        {!previewMode && (
                          <div className="p-3 bg-secondary/50 border-b flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {block.type}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveBlock(block.id, 'up')}
                                disabled={index === 0}
                              >
                                <Icon name="ChevronUp" size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveBlock(block.id, 'down')}
                                disabled={index === selectedPage.blocks.length - 1}
                              >
                                <Icon name="ChevronDown" size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteBlock(block.id)}
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </div>
                        )}
                        {renderBlockPreview(block)}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center text-muted-foreground">
                <Icon name="FileText" size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Выберите страницу для редактирования</p>
                <p className="text-sm mt-2">или создайте новую</p>
              </Card>
            )}
          </div>

          {/* Правая панель - свойства блока */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Icon name="Settings" size={18} />
                Справка
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Быстрые клавиши</p>
                  <p>⌘ + S - Сохранить</p>
                  <p>⌘ + P - Превью</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Блоки</p>
                  <p>Добавляйте блоки из библиотеки слева. Меняйте порядок стрелками.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Публикация</p>
                  <p>Включите переключатель "Опубликовать" чтобы страница появилась на сайте.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;
