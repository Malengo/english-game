// src/data/locationConfig.js
// Configuração de localizações no mapa

export const locations = [
  {
    id: "bakery",
    name: "Padaria",
    emoji: "🥐",
    tileX: 30,
    tileY: 40,
    width: 80,
    height: 80,
    screenRoute: "BakeryMission",
    stageRequired: 3,
    description: "Aprenda vocabulário de padaria",
  },
  {
    id: "school",
    name: "Escola",
    emoji: "📚",
    tileX: 50,
    tileY: 50,
    width: 80,
    height: 80,
    screenRoute: "SchoolMission",
    stageRequired: 1,
    // Mark this as the first location / tutorial start
    isFirstLocation: true,
    autoStartOnEnter: true,
    tutorial: true,
    introMessages: [
      "Bem-vindo à Escola! Aqui você aprenderá o alfabeto e como o jogo funciona.",
      "Ande pelo mapa, entre em locais para iniciar missões e ganhe moedas e XP.",
      "Complete exercícios para desbloquear novas áreas.",
      "Toque em Continuar para começar o tutorial do alfabeto.",
    ],
    description: "Tipos de exercícios e desafios",
  },
  {
    id: "house",
    name: "Casa",
    emoji: "🏠",
    tileX: 66,
    tileY: 45,
    width: 96,
    height: 96,
    screenRoute: "HouseMission",
    stageRequired: 2,
    autoStartOnEnter: false,
    description: "Licao da casa: objetos e comodos em ingles",
  },
];

export const getLocationById = (id) => locations.find((loc) => loc.id === id);
export const getLocationsByStage = (currentStage) =>
  locations.filter((loc) => loc.stageRequired <= currentStage);

