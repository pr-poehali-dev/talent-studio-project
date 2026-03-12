import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import type { HealthAnalysis } from '@/services/vitaminAnalysis';
import { consolidateDeficiencies } from '@/services/vitaminAnalysis';

interface RecommendationsAnalysisAccordionProps {
  analysis: HealthAnalysis;
}

const RecommendationsAnalysisAccordion = ({ analysis }: RecommendationsAnalysisAccordionProps) => {
  const consolidatedDeficiencies = consolidateDeficiencies(
    analysis.vitaminDeficiencies,
    analysis.nutrientDeficiencies
  );

  const criticalDeficiencies = consolidatedDeficiencies.filter(d => d.level === 'высокий');
  const moderateDeficiencies = consolidatedDeficiencies.filter(d => d.level === 'средний');

  return (
    <Accordion type="multiple" defaultValue={['goals', 'deficiencies']} className="space-y-4">
      {/* Приоритетные цели */}
      <AccordionItem value="goals" className="border rounded-lg px-6 bg-card animate-scale-in">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Icon name="Target" size={24} className="text-primary" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Ваши приоритетные цели</h3>
              <p className="text-sm text-muted-foreground">Цели, выбранные вами</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-4 space-y-3">
            {analysis.priorities.map((goal, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5" />
                <span className="font-medium">{goal}</span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Образ жизни */}
      <AccordionItem value="lifestyle" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Icon name="Activity" size={24} className="text-blue-500" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Образ жизни</h3>
              <p className="text-sm text-muted-foreground">Факторы, влияющие на здоровье</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-4 space-y-2">
            {analysis.lifestyle.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Icon name="Circle" size={8} className="text-blue-500 mt-2" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Особенности здоровья */}
      {analysis.healthConcerns.length > 0 && (
        <AccordionItem value="health" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Icon name="Heart" size={24} className="text-red-500" />
              <div className="text-left">
                <h3 className="text-xl font-semibold">Особенности здоровья</h3>
                <p className="text-sm text-muted-foreground">На что обратить внимание</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-2">
              {analysis.healthConcerns.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                  <Icon name="AlertCircle" size={18} className="text-red-500 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Пищевые привычки */}
      {analysis.dietaryHabits.length > 0 && (
        <AccordionItem value="diet" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Icon name="Apple" size={24} className="text-green-500" />
              <div className="text-left">
                <h3 className="text-xl font-semibold">Пищевые привычки</h3>
                <p className="text-sm text-muted-foreground">Особенности вашего рациона</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-2">
              {analysis.dietaryHabits.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Icon name="Circle" size={8} className="text-green-500 mt-2" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Географические факторы */}
      <AccordionItem value="geo" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Icon name="MapPin" size={24} className="text-purple-500" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Географические факторы</h3>
              <p className="text-sm text-muted-foreground">Климат и окружающая среда</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-4 space-y-2">
            {analysis.geographicFactors.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Icon name="Circle" size={8} className="text-purple-500 mt-2" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Выявленные дефициты */}
      <AccordionItem value="deficiencies" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.5s' }}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Icon name="Pill" size={24} className="text-orange-500" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Выявленные дефициты</h3>
              <p className="text-sm text-muted-foreground">Витамины и микронутриенты</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-4 space-y-4">
            {/* Критические */}
            {criticalDeficiencies.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="destructive">Критический уровень</Badge>
                  <span className="text-sm text-muted-foreground">Требуется немедленное внимание</span>
                </h4>
                <div className="space-y-3">
                  {criticalDeficiencies.map((def, index) => (
                    <Card key={index} className="border-red-200 bg-red-50/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-lg">{def.name}</h5>
                          <Badge variant="destructive" className="text-xs">Высокий</Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Причины дефицита:</p>
                          <ul className="space-y-1">
                            {def.reasons.map((reason, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <Icon name="AlertTriangle" size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Умеренные */}
            {moderateDeficiencies.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="border-yellow-600 text-yellow-700">Умеренный уровень</Badge>
                  <span className="text-sm text-muted-foreground">Рекомендуется восполнить</span>
                </h4>
                <div className="space-y-3">
                  {moderateDeficiencies.map((def, index) => (
                    <Card key={index} className="border-yellow-200 bg-yellow-50/30">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold">{def.name}</h5>
                          <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-700">Средний</Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Рекомендации:</p>
                          <ul className="space-y-1">
                            {def.reasons.map((reason, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <Icon name="Info" size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RecommendationsAnalysisAccordion;
