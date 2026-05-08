'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';

export default function RecipeDetail() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const recipe = {
    id: '1',
    title: 'Panqueca de Aveia com Banana',
    description: 'Deliciosa panqueca proteica perfeita para o café da manhã. Rica em fibras e proteínas, esta receita é ideal para quem busca uma alimentação saudável sem abrir mão do sabor.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    difficulty: 'easy' as const,
    rating: 4.8,
    reviews: 124,
    isPremium: false,
    hasVideo: true,
    ingredients: [
      '1 xícara de aveia em flocos',
      '1 banana madura',
      '2 ovos',
      '1/2 xícara de leite de amêndoa',
      '1 colher de sopa de mel',
      '1 colher de chá de canela',
      '1 pitada de sal',
      '1 colher de sopa de óleo de coco',
      'Frutas frescas para decorar',
      'Mel para finalizar'
    ],
    instructions: [
      'Em um liquidificador, bata a aveia até formar uma farinha fina',
      'Adicione a banana, os ovos, o leite de amêndoa, o mel, a canela e o sal',
      'Bata até obter uma massa homogênea e cremosa',
      'Deixe a massa descansar por 5 minutos',
      'Aqueça uma frigideira antiaderente com um pouco de óleo de coco',
      'Despeje uma concha da massa na frigideira',
      'Cozinhe em fogo médio até aparecerem bolhas na superfície',
      'Vire a panqueca e cozinhe do outro lado até dourar',
      'Repita o processo com o restante da massa',
      'Sirva quente com frutas frescas e mel'
    ],
    nutrition: {
      calories: 320,
      protein: 18,
      carbs: 45,
      fat: 8,
      fiber: 6
    }
  };

  const difficultyLabels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil'
  };

  const difficultyColors: Record<string, string> = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="hero-gradient py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-gray-600 mb-8">
                <a href="/recipes" className="hover:text-orange-600 transition-colors">Receitas</a>
                <i className="bx bx-chevron-right text-sm"></i>
                <span className="text-orange-600">Panqueca de Aveia</span>
              </nav>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Recipe Image/Video */}
                <div className="relative">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                    {recipe.hasVideo ? (
                      <div className="video-player h-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button className="bg-orange-600/90 hover:bg-orange-600 text-white rounded-full p-6 transition-all duration-300 hover:scale-110">
                            <i className="bx bx-play text-4xl"></i>
                          </button>
                        </div>
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  {/* Premium Badge */}
                  {recipe.isPremium && (
                    <div className="absolute top-4 right-4 premium-badge">
                      <i className="bx bx-crown mr-1"></i>
                      Premium
                    </div>
                  )}
                </div>

                {/* Recipe Info */}
                <div className={`animate-on-scroll ${isVisible ? 'visible' : ''}`}>
                  <h1 className="font-heading text-4xl font-bold text-gray-800 mb-4">
                    {recipe.title}
                  </h1>
                  
                  <p className="text-gray-600 text-lg mb-6">
                    {recipe.description}
                  </p>

                  {/* Recipe Meta */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-orange-200 rounded-xl p-4 text-center">
                      <i className="bx bx-time text-2xl text-orange-600 mb-2"></i>
                      <div className="text-sm text-gray-600">Preparo</div>
                      <div className="font-semibold text-gray-800">{recipe.prepTime}min</div>
                    </div>
                    <div className="bg-white border border-orange-200 rounded-xl p-4 text-center">
                      <i className="bx bx-timer text-2xl text-orange-600 mb-2"></i>
                      <div className="text-sm text-gray-600">Cozimento</div>
                      <div className="font-semibold text-gray-800">{recipe.cookTime}min</div>
                    </div>
                    <div className="bg-white border border-orange-200 rounded-xl p-4 text-center">
                      <i className="bx bx-user text-2xl text-orange-600 mb-2"></i>
                      <div className="text-sm text-gray-600">Porções</div>
                      <div className="font-semibold text-gray-800">{recipe.servings}</div>
                    </div>
                    <div className="bg-white border border-orange-200 rounded-xl p-4 text-center">
                      <i className={`bx bx-dumbbell text-2xl ${difficultyColors[recipe.difficulty]} mb-2`}></i>
                      <div className="text-sm text-gray-600">Dificuldade</div>
                      <div className={`font-semibold ${difficultyColors[recipe.difficulty]}`}>
                        {difficultyLabels[recipe.difficulty]}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bx ${i < 4 ? 'bxs-star' : 'bx-star'} text-orange-600`}></i>
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {recipe.rating} ({recipe.reviews} avaliações)
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="btn-primary flex-1">
                      <i className="bx bx-heart mr-2"></i>
                      Favoritar
                    </button>
                    <button className="btn-secondary flex-1">
                      <i className="bx bx-share-alt mr-2"></i>
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Tabs */}
                  <div className="flex border-b border-orange-200 mb-8">
                    <button
                      onClick={() => setActiveTab('ingredients')}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === 'ingredients'
                          ? 'text-orange-600 border-b-2 border-orange-600'
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                    >
                      Ingredientes
                    </button>
                    <button
                      onClick={() => setActiveTab('instructions')}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === 'instructions'
                          ? 'text-orange-600 border-b-2 border-orange-600'
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                    >
                      Modo de Preparo
                    </button>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'ingredients' && (
                    <div className={`animate-on-scroll ${isVisible ? 'visible' : ''}`}>
                      <h3 className="font-heading text-2xl font-bold text-gray-800 mb-6">
                        Ingredientes
                      </h3>
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <i className="bx bx-check text-orange-600 text-lg"></i>
                            <span className="text-gray-600">{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'instructions' && (
                    <div className={`animate-on-scroll ${isVisible ? 'visible' : ''}`}>
                      <h3 className="font-heading text-2xl font-bold text-gray-800 mb-6">
                        Modo de Preparo
                      </h3>
                      <ol className="space-y-4">
                        {recipe.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-4">
                            <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-gray-600">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Nutrition Info */}
                  <div className="bg-white border border-orange-200 rounded-2xl p-6">
                    <h4 className="font-heading text-xl font-bold text-gray-800 mb-4">
                      Informações Nutricionais
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calorias</span>
                        <span className="text-gray-800 font-semibold">{recipe.nutrition.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proteínas</span>
                        <span className="text-gray-800 font-semibold">{recipe.nutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carboidratos</span>
                        <span className="text-gray-800 font-semibold">{recipe.nutrition.carbs}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gorduras</span>
                        <span className="text-gray-800 font-semibold">{recipe.nutrition.fat}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fibras</span>
                        <span className="text-gray-800 font-semibold">{recipe.nutrition.fiber}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Related Recipes */}
                  <div className="bg-white border border-orange-200 rounded-2xl p-6">
                    <h4 className="font-heading text-xl font-bold text-gray-800 mb-4">
                      Receitas Relacionadas
                    </h4>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=80&h=80&fit=crop"
                            alt="Receita"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800 text-sm mb-1">
                              Receita Relacionada {i}
                            </h5>
                            <p className="text-gray-600 text-xs">
                              Descrição da receita relacionada...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}