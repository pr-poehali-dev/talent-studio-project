import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const defaultFaqs = [
  {
    id: 'faq-1',
    question: 'Где вы производите витамины?',
    answer: 'Мы работаем с проверенными производителями, имеющими международные сертификаты качества GMP (Good Manufacturing Practice). Все витамины проходят многоступенчатый контроль качества и соответствуют стандартам безопасности.'
  },
  {
    id: 'faq-2',
    question: 'Чем опасен дисбаланс микронутриентов?',
    answer: 'Дисбаланс микронутриентов может привести к снижению иммунитета, хронической усталости, проблемам с кожей, волосами и ногтями, нарушениям сна, ухудшению памяти и концентрации внимания. Длительный дефицит витаминов может способствовать развитию серьезных заболеваний.'
  },
  {
    id: 'faq-3',
    question: 'Когда ждать эффект от приёма витаминов?',
    answer: 'Первые результаты обычно заметны через 2-4 недели регулярного приема. Однако для полного восполнения дефицита и стабильного эффекта рекомендуется курс приема 2-3 месяца. Скорость результата зависит от исходного состояния организма и степени дефицита.'
  }
];

const FAQ = () => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Отвечаем на важные вопросы
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Самые частые вопросы о витаминах и нашем сервисе
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Accordion type="single" collapsible className="w-full">
            {defaultFaqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="animate-fade-in"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="HelpCircle" size={18} className="text-primary" />
                    </div>
                    <span className="font-semibold">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pl-11 pr-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </section>
  );
};

export default FAQ;