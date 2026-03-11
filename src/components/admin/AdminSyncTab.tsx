import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SyncSetting {
  id: number;
  syncType: string;
  isActive: boolean;
  sourceUrl: string;
  scheduleMinutes: number;
  updatePricesOnly: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: string;
}

interface SyncLog {
  id: number;
  startedAt: string;
  finishedAt?: string;
  status: string;
  itemsProcessed: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errorMessage?: string;
}

interface AdminSyncTabProps {
  syncSettings: SyncSetting[];
  syncLogs: SyncLog[];
  loading: boolean;
  onRunSync: (settingId: number) => Promise<void>;
  onToggleSyncActive: (setting: SyncSetting) => Promise<void>;
  onSaveSyncSetting: () => Promise<void>;
  onDeleteSyncSetting: (id: number) => Promise<void>;
  onLoadSyncLogs: (settingId: number) => Promise<void>;
  editingSyncSetting: SyncSetting | null;
  setEditingSyncSetting: (setting: SyncSetting | null) => void;
}

const AdminSyncTab = ({
  syncSettings,
  syncLogs,
  loading,
  onRunSync,
  onToggleSyncActive,
  onSaveSyncSetting,
  onDeleteSyncSetting,
  onLoadSyncLogs,
  editingSyncSetting,
  setEditingSyncSetting
}: AdminSyncTabProps) => {
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Автоматическая синхронизация</h2>
        <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSyncSetting({
                id: 0,
                syncType: 'google_sheets',
                isActive: false,
                sourceUrl: '',
                scheduleMinutes: 60,
                updatePricesOnly: false
              });
              setIsSyncDialogOpen(true);
            }}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить синхронизацию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSyncSetting?.id ? 'Редактировать синхронизацию' : 'Новая синхронизация'}
              </DialogTitle>
            </DialogHeader>
            {editingSyncSetting && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Тип синхронизации</Label>
                  <select
                    value={editingSyncSetting.syncType}
                    onChange={(e) => setEditingSyncSetting({...editingSyncSetting, syncType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md mt-2"
                  >
                    <option value="google_sheets">Google Таблицы</option>
                    <option value="website">Парсинг сайта</option>
                  </select>
                </div>

                <div>
                  <Label>
                    {editingSyncSetting.syncType === 'google_sheets' 
                      ? 'Ссылка на Google Таблицу' 
                      : 'URL сайта для парсинга'}
                  </Label>
                  <Input
                    value={editingSyncSetting.sourceUrl}
                    onChange={(e) => setEditingSyncSetting({...editingSyncSetting, sourceUrl: e.target.value})}
                    placeholder={editingSyncSetting.syncType === 'google_sheets'
                      ? 'https://docs.google.com/spreadsheets/d/...'
                      : 'https://example.com/catalog'}
                    className="mt-2"
                  />
                  {editingSyncSetting.syncType === 'google_sheets' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Опубликуйте таблицу: Файл → Опубликовать в интернете
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Периодичность обновления</Label>
                    <select
                      value={editingSyncSetting.scheduleMinutes}
                      onChange={(e) => setEditingSyncSetting({...editingSyncSetting, scheduleMinutes: Number(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-md mt-2"
                    >
                      <option value={15}>Каждые 15 минут</option>
                      <option value={30}>Каждые 30 минут</option>
                      <option value={60}>Каждый час</option>
                      <option value={180}>Каждые 3 часа</option>
                      <option value={360}>Каждые 6 часов</option>
                      <option value={720}>Каждые 12 часов</option>
                      <option value={1440}>Раз в день</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-accent">
                      <input
                        type="checkbox"
                        checked={editingSyncSetting.updatePricesOnly}
                        onChange={(e) => setEditingSyncSetting({...editingSyncSetting, updatePricesOnly: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Обновлять только цены</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Обновлять только цены:</strong> если включено, система будет искать товары по названию 
                    и обновлять только цену. Новые товары добавляться не будут.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={async () => {
                      await onSaveSyncSetting();
                      setIsSyncDialogOpen(false);
                    }}
                    disabled={loading} 
                    className="flex-1"
                  >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingSyncSetting(null);
                      setIsSyncDialogOpen(false);
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Тип</TableHead>
              <TableHead>Источник</TableHead>
              <TableHead className="w-32">Периодичность</TableHead>
              <TableHead className="w-24 text-center">Режим</TableHead>
              <TableHead className="w-32">Последняя синхр.</TableHead>
              <TableHead className="w-24 text-center">Статус</TableHead>
              <TableHead className="w-48 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {syncSettings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Нет настроенных синхронизаций. Нажмите "Добавить синхронизацию" чтобы начать.
                </TableCell>
              </TableRow>
            ) : (
              syncSettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {setting.syncType === 'google_sheets' && (
                        <><Icon name="Table" size={14} className="mr-1" />Google Sheets</>
                      )}
                      {setting.syncType === 'website' && (
                        <><Icon name="Globe" size={14} className="mr-1" />Парсинг</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {setting.sourceUrl}
                  </TableCell>
                  <TableCell className="text-sm">
                    {setting.scheduleMinutes < 60 
                      ? `${setting.scheduleMinutes} мин`
                      : setting.scheduleMinutes === 60 
                        ? '1 час'
                        : `${Math.floor(setting.scheduleMinutes / 60)} ч`}
                  </TableCell>
                  <TableCell className="text-center">
                    {setting.updatePricesOnly ? (
                      <Badge variant="secondary" className="text-xs">Только цены</Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">Полная</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {setting.lastSyncAt 
                      ? new Date(setting.lastSyncAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Ещё не запускалась'}
                  </TableCell>
                  <TableCell className="text-center">
                    {setting.isActive ? (
                      <Badge className="bg-green-500 text-xs">Активна</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Остановлена</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRunSync(setting.id)}
                        disabled={loading}
                        title="Запустить сейчас"
                      >
                        <Icon name="Play" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleSyncActive(setting)}
                        title={setting.isActive ? 'Остановить' : 'Запустить'}
                      >
                        {setting.isActive ? (
                          <Icon name="Pause" size={16} />
                        ) : (
                          <Icon name="Power" size={16} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLoadSyncLogs(setting.id)}
                        title="Посмотреть логи"
                      >
                        <Icon name="FileText" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSyncSetting(setting);
                          setIsSyncDialogOpen(true);
                        }}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSyncSetting(setting.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {syncLogs.length > 0 && (
        <Card className="mt-6">
          <div className="p-4 border-b">
            <h3 className="font-bold flex items-center gap-2">
              <Icon name="History" size={18} />
              История синхронизаций
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.status === 'success' ? 'Успешно' : 'Ошибка'}
                    </Badge>
                    <span className="text-sm">
                      {new Date(log.startedAt).toLocaleString('ru-RU')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      +{log.itemsAdded} / ~{log.itemsUpdated} / -{log.itemsSkipped}
                    </span>
                  </div>
                  {log.errorMessage && (
                    <span className="text-xs text-destructive">{log.errorMessage}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminSyncTab;
