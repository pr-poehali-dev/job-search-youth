import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  description: string;
  isFavorite: boolean;
}

const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Стажёр-бариста',
    company: 'Coffee Dreams',
    location: 'Москва',
    type: 'Частичная занятость',
    salary: '25 000 - 35 000 ₽',
    skills: ['Общение', 'Клиентский сервис', 'Быстрое обучение'],
    description: 'Ищем энергичного стажёра в команду кофейни',
    isFavorite: false
  },
  {
    id: 2,
    title: 'Помощник SMM-менеджера',
    company: 'Digital Wave',
    location: 'Удалённо',
    type: 'Полная занятость',
    salary: '30 000 - 45 000 ₽',
    skills: ['Соцсети', 'Креативность', 'Копирайтинг'],
    description: 'Создавай контент для молодёжных брендов',
    isFavorite: false
  },
  {
    id: 3,
    title: 'Курьер на велосипеде',
    company: 'FastDelivery',
    location: 'Санкт-Петербург',
    type: 'Частичная занятость',
    salary: '40 000 - 60 000 ₽',
    skills: ['Активность', 'Пунктуальность', 'Знание города'],
    description: 'Свободный график, высокая оплата',
    isFavorite: false
  },
  {
    id: 4,
    title: 'Ассистент дизайнера',
    company: 'Creative Studio',
    location: 'Москва',
    type: 'Стажировка',
    salary: '20 000 - 30 000 ₽',
    skills: ['Figma', 'Photoshop', 'Внимание к деталям'],
    description: 'Учись у профессионалов графического дизайна',
    isFavorite: false
  },
  {
    id: 5,
    title: 'Промоутер на выходные',
    company: 'Event Masters',
    location: 'Казань',
    type: 'Временная работа',
    salary: '15 000 - 20 000 ₽',
    skills: ['Коммуникабельность', 'Презентабельность'],
    description: 'Работа на мероприятиях только в выходные',
    isFavorite: false
  },
  {
    id: 6,
    title: 'Младший разработчик',
    company: 'TechStart',
    location: 'Удалённо',
    type: 'Полная занятость',
    salary: '50 000 - 70 000 ₽',
    skills: ['HTML/CSS', 'JavaScript', 'React'],
    description: 'Стартап ищет начинающего фронтенд-разработчика',
    isFavorite: false
  }
];

const allSkills = ['Общение', 'Клиентский сервис', 'Соцсети', 'Креативность', 'Активность', 'Figma', 'Photoshop', 'HTML/CSS', 'JavaScript', 'React', 'Быстрое обучение'];

export default function Index() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const toggleFavorite = (id: number) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, isFavorite: !job.isFavorite } : job
    ));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => job.skills.includes(skill));
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'favorites' && job.isFavorite);
    
    return matchesSearch && matchesSkills && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Icon name="Briefcase" className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                РаботаЮниор
              </h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <Button variant="ghost" className="font-medium">
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              <Button variant="ghost" className="font-medium">
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
              <Button variant="ghost" className="font-medium">
                <Icon name="MessageSquare" size={18} className="mr-2" />
                Сообщения
              </Button>
              <Button variant="ghost" className="font-medium">
                <Icon name="HelpCircle" size={18} className="mr-2" />
                Помощь
              </Button>
            </nav>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
              Создать резюме
            </Button>
          </div>
        </div>
      </header>

      <section className="py-16 px-4 animate-slide-up">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Найди работу мечты с 16 лет!
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Умная система подбора вакансий на основе твоих навыков и интересов. Начни карьеру прямо сейчас! 🚀
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mb-8">
            <div className="relative flex-1">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Поиск по вакансиям, компаниям, городам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button size="lg" className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity h-12 px-8">
              <Icon name="Sparkles" size={20} className="mr-2" />
              Умный подбор
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="secondary" className="text-sm py-2 px-4 hover:scale-105 transition-transform cursor-pointer">
              <Icon name="TrendingUp" size={14} className="mr-1" />
              Популярные
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4 hover:scale-105 transition-transform cursor-pointer">
              <Icon name="MapPin" size={14} className="mr-1" />
              Рядом со мной
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4 hover:scale-105 transition-transform cursor-pointer">
              <Icon name="Home" size={14} className="mr-1" />
              Удалённо
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4 hover:scale-105 transition-transform cursor-pointer">
              <Icon name="Clock" size={14} className="mr-1" />
              Гибкий график
            </Badge>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Target" className="text-primary" />
              Фильтр по навыкам
            </h3>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => (
                <Badge
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedSkills.includes(skill) 
                      ? 'bg-gradient-to-r from-primary to-accent text-white' 
                      : ''
                  }`}
                >
                  {skill}
                  {selectedSkills.includes(skill) && (
                    <Icon name="Check" size={14} className="ml-1" />
                  )}
                </Badge>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSkills([])}
                className="mt-3"
              >
                <Icon name="X" size={16} className="mr-1" />
                Сбросить фильтры
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="all" className="text-base">
                <Icon name="Briefcase" size={18} className="mr-2" />
                Все вакансии ({mockJobs.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-base">
                <Icon name="Heart" size={18} className="mr-2" />
                Избранное ({jobs.filter(j => j.isFavorite).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredJobs.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">
                      {activeTab === 'favorites' 
                        ? 'У тебя пока нет избранных вакансий'
                        : 'Вакансии не найдены. Попробуй изменить фильтры'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredJobs.map((job, index) => (
                  <Card 
                    key={job.id} 
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in border-l-4 border-l-primary"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                            {job.title}
                            <Badge variant="secondary" className="text-xs">
                              {job.type}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-base flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Icon name="Building2" size={16} />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="MapPin" size={16} />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1 text-primary font-semibold">
                              <Icon name="Wallet" size={16} />
                              {job.salary}
                            </span>
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(job.id)}
                          className={`transition-all ${job.isFavorite ? 'text-red-500' : 'text-muted-foreground'}`}
                        >
                          <Icon 
                            name={job.isFavorite ? "Heart" : "Heart"} 
                            size={24}
                            className={job.isFavorite ? "fill-current" : ""}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map(skill => (
                          <Badge 
                            key={skill} 
                            variant="outline"
                            className={selectedSkills.includes(skill) ? 'border-primary bg-primary/10' : ''}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                          <Icon name="Send" size={18} className="mr-2" />
                          Откликнуться
                        </Button>
                        <Button variant="outline" size="icon">
                          <Icon name="Share2" size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <footer className="bg-white/80 backdrop-blur-sm border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 РаботаЮниор • Платформа для молодых специалистов
          </p>
        </div>
      </footer>
    </div>
  );
}
