import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RecommendationsSummaryCardsProps {
  criticalCount: number;
  moderateCount: number;
  prioritiesCount: number;
}

const RecommendationsSummaryCards = ({
  criticalCount,
  moderateCount,
  prioritiesCount,
}: RecommendationsSummaryCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8 animate-fade-in">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{criticalCount}</p>
              <p className="text-sm text-muted-foreground">Критических дефицитов</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Icon name="AlertCircle" size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{moderateCount}</p>
              <p className="text-sm text-muted-foreground">Умеренных дефицитов</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Target" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{prioritiesCount}</p>
              <p className="text-sm text-muted-foreground">Приоритетных целей</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationsSummaryCards;
