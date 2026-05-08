'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';

export default function Profile() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const user = {
    name: 'Maria Silva',
    email: 'maria@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    subscription: 'premium',
    joinDate: 'Janeiro 2024',
    stats: {
      recipesCompleted: 24,
      workoutsCompleted: 12,
      streakDays: 7,
      caloriesBurned: 1240
    }
  };

  const recentActivity = [
    { type: 'recipe', title: 'Panqueca de Aveia com Banana', time: '2 horas atrás', icon: 'bx-bowl-hot' },
    { type: 'workout', title: 'HIIT Cardio Intenso', time: '1 dia atrás', icon: 'bx-dumbbell' },
    { type: 'recipe', title: 'Smoothie Bowl de Açaí', time: '2 dias atrás', icon: 'bx-bowl-hot' },
    { type: 'workout', title: 'Yoga Matinal', time: '3 dias atrás', icon: 'bx-leaf' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="hero-gradient py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-32 h-32 rounded-full border-4 border-primary object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-background rounded-full p-2">
                    <i className="bx bx-crown text-lg"></i>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-heading text-4xl font-bold text-text mb-2">
                    {user.name}
                  </h1>
                  <p className="text-text-light text-lg mb-4">{user.email}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                    <div className="bg-primary/20 text-primary px-4 py-2 rounded-full font-semibold">
                      <i className="bx bx-crown mr-2"></i>
                      Plano Premium
                    </div>
                    <div className="text-text-light">
                      Membro desde {user.joinDate}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="btn-primary">
                    <i className="bx bx-edit mr-2"></i>
                    Editar Perfil
                  </button>
                  <button className="btn-secondary">
                    <i className="bx bx-cog mr-2"></i>
                    Configurações
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-text text-center mb-12">
                Suas Estatísticas
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="stat-card text-center">
                  <i className="bx bx-bowl-hot text-3xl text-primary mb-3"></i>
                  <div className="text-2xl font-bold text-text mb-1">{user.stats.recipesCompleted}</div>
                  <div className="text-sm text-text-light">Receitas Concluídas</div>
                </div>
                
                <div className="stat-card text-center">
                  <i className="bx bx-dumbbell text-3xl text-primary mb-3"></i>
                  <div className="text-2xl font-bold text-text mb-1">{user.stats.workoutsCompleted}</div>
                  <div className="text-sm text-text-light">Treinos Concluídos</div>
                </div>
                
                <div className="stat-card text-center">
                  <i className="bx bx-flame text-3xl text-orange-400 mb-3"></i>
                  <div className="text-2xl font-bold text-text mb-1">{user.stats.streakDays}</div>
                  <div className="text-sm text-text-light">Dias de Streak</div>
                </div>
                
                <div className="stat-card text-center">
                  <i className="bx bx-trending-up text-3xl text-green-400 mb-3"></i>
                  <div className="text-2xl font-bold text-text mb-1">{user.stats.caloriesBurned}</div>
                  <div className="text-sm text-text-light">Calorias Queimadas</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-16 bg-background-alt">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex border-b border-card-border mb-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === 'profile'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-light hover:text-primary'
                  }`}
                >
                  Perfil
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === 'activity'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-light hover:text-primary'
                  }`}
                >
                  Atividade Recente
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === 'settings'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-light hover:text-primary'
                  }`}
                >
                  Configurações
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'profile' && (
                <div className={`animate-on-scroll ${isVisible ? 'visible' : ''}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card-bg border border-card-border rounded-2xl p-6">
                      <h3 className="font-heading text-xl font-bold text-text mb-4">
                        Informações Pessoais
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-text-light text-sm">Nome Completo</label>
                          <input
                            type="text"
                            value={user.name}
                            className="w-full bg-background border border-card-border rounded-lg px-4 py-3 text-text mt-1 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-text-light text-sm">Email</label>
                          <input
                            type="email"
                            value={user.email}
                            className="w-full bg-background border border-card-border rounded-lg px-4 py-3 text-text mt-1 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-text-light text-sm">Data de Nascimento</label>
                          <input
                            type="date"
                            className="w-full bg-background border border-card-border rounded-lg px-4 py-3 text-text mt-1 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-card-bg border border-card-border rounded-2xl p-6">
                      <h3 className="font-heading text-xl font-bold text-text mb-4">
                        Preferências
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-text-light text-sm">Objetivos de Treino</label>
                          <select className="w-full bg-background border border-card-border rounded-lg px-4 py-3 text-text mt-1 focus:outline-none focus:border-primary">
                            <option>Perda de Peso</option>
                            <option>Ganho de Massa</option>
                            <option>Condicionamento</option>
                            <option>Flexibilidade</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-text-light text-sm">Restrições Alimentares</label>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-center">
                              <input type="checkbox" className="mr-3" />
                              <span className="text-text-light">Sem Glúten</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="mr-3" />
                              <span className="text-text-light">Sem Lactose</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="mr-3" />
                              <span className="text-text-light">Vegetariano</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className={`animate-on-scroll ${isVisible ? 'visible' : ''}`}>
                  <h3 className="font-heading text-2xl font-bold text-text mb-6">
                    Atividade Recente
                  </h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="bg-card-bg border border-card-border rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <i className={`bx ${activity.icon} text-primary text-xl`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-text">{activity.title}</h4>
                          <p className="text-text-light text-sm">{activity.time}</p>
                        </div>
                        <button className="text-primary hover:text-yellow-400 transition-colors">
                          <i className="bx bx-right-arrow-alt text-xl"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className={`animate-on-scroll ${isVisible ? 'visible' : ''}`}>
                  <div className="space-y-6">
                    <div className="bg-card-bg border border-card-border rounded-2xl p-6">
                      <h3 className="font-heading text-xl font-bold text-text mb-4">
                        Notificações
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <span className="text-text-light">Notificações por Email</span>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-text-light">Lembretes de Treino</span>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-text-light">Novas Receitas</span>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                      </div>
                    </div>

                    <div className="bg-card-bg border border-card-border rounded-2xl p-6">
                      <h3 className="font-heading text-xl font-bold text-text mb-4">
                        Privacidade
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <span className="text-text-light">Perfil Público</span>
                          <input type="checkbox" className="toggle" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-text-light">Compartilhar Progresso</span>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}