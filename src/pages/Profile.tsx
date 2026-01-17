import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const PROFILE_API = 'https://functions.poehali.dev/980fdcce-596a-4620-984c-6521dd12212e';

const allSkills = [
  'Общение', 'Клиентский сервис', 'Соцсети', 'Креативность', 
  'Активность', 'Figma', 'Photoshop', 'HTML/CSS', 'JavaScript', 
  'React', 'Быстрое обучение', 'Копирайтинг', 'Пунктуальность'
];

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    id: 1,
    email: 'user@example.com',
    full_name: 'Иван Петров',
    age: 18,
    city: 'Москва',
    phone: '+7 (999) 123-45-67',
    about_me: 'Энергичный и целеустремлённый молодой специалист, ищу первую работу для развития навыков',
    avatar_url: '',
    skills: ['JavaScript', 'React', 'Общение'],
    experience: 'Нет опыта работы',
    education: 'Студент 1 курса'
  });

  const [formData, setFormData] = useState(profile);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${PROFILE_API}?user_id=1`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(photoFile);
      
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        
        const response = await fetch(PROFILE_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photo_base64: base64,
            user_id: profile.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({ ...profile, avatar_url: data.avatar_url });
          setFormData({ ...formData, avatar_url: data.avatar_url });
          setPhotoFile(null);
          
          toast({
            title: 'Фото обновлено!',
            description: 'Ваша аватарка успешно загружена',
          });
        }
      };
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фото',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(PROFILE_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setProfile(formData);
        setIsEditing(false);
        
        toast({
          title: 'Профиль обновлён!',
          description: 'Ваши изменения сохранены',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = formData.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    setFormData({ ...formData, skills: newSkills });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-orange-50 to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Icon name="Briefcase" className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                РаботаЮниор
              </h1>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">Мой профиль</CardTitle>
                  <CardDescription className="text-base">
                    Заполни профиль, чтобы работодатели узнали о тебе больше
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Icon name="Edit" size={18} className="mr-2" />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(profile);
                      }}
                    >
                      Отмена
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      <Icon name="Save" size={18} className="mr-2" />
                      Сохранить
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-white">
                    {profile.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <div className="flex flex-col items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="max-w-xs"
                    />
                    {photoFile && (
                      <Button 
                        size="sm" 
                        onClick={uploadPhoto}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-secondary to-accent"
                      >
                        <Icon name="Upload" size={16} className="mr-2" />
                        Загрузить фото
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Icon name="User" size={16} />
                    Полное имя
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Иван Петров"
                    />
                  ) : (
                    <p className="text-lg">{profile.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Icon name="Mail" size={16} />
                    Email
                  </label>
                  <p className="text-lg text-muted-foreground">{profile.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Icon name="Calendar" size={16} />
                    Возраст
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      placeholder="18"
                      min="16"
                      max="100"
                    />
                  ) : (
                    <p className="text-lg">{profile.age} лет</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Icon name="MapPin" size={16} />
                    Город
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Москва"
                    />
                  ) : (
                    <p className="text-lg">{profile.city}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Icon name="Phone" size={16} />
                    Телефон
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+7 (999) 123-45-67"
                    />
                  ) : (
                    <p className="text-lg">{profile.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Icon name="FileText" size={16} />
                  О себе
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.about_me || ''}
                    onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                    placeholder="Расскажи о себе работодателям..."
                    rows={4}
                  />
                ) : (
                  <p className="text-base text-muted-foreground">{profile.about_me}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Icon name="Star" size={16} />
                  Навыки
                </label>
                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    allSkills.map(skill => (
                      <Badge
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        variant={(formData.skills || []).includes(skill) ? "default" : "outline"}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          (formData.skills || []).includes(skill)
                            ? 'bg-gradient-to-r from-primary to-accent text-white'
                            : ''
                        }`}
                      >
                        {skill}
                        {(formData.skills || []).includes(skill) && (
                          <Icon name="Check" size={14} className="ml-1" />
                        )}
                      </Badge>
                    ))
                  ) : (
                    (profile.skills || []).map(skill => (
                      <Badge key={skill} className="bg-gradient-to-r from-primary to-accent">
                        {skill}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Icon name="Briefcase" size={16} />
                    Опыт работы
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={formData.experience || ''}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Опиши свой опыт работы или напиши 'Нет опыта'"
                      rows={3}
                    />
                  ) : (
                    <p className="text-base text-muted-foreground">{profile.experience}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Icon name="GraduationCap" size={16} />
                    Образование
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={formData.education || ''}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      placeholder="Укажи своё образование"
                      rows={3}
                    />
                  ) : (
                    <p className="text-base text-muted-foreground">{profile.education}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
