// src/data/locationConfig.js
// Configuracao de localizacoes no mapa

import { schoolColorsLesson } from "./schoolColorsLesson";

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
    description: "Aprenda vocabulario de padaria",
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
    lessonId: schoolColorsLesson.id,
    introMessages: [
      "Bem-vindo a Escola! Aqui voce vai aprender as cores em ingles.",
      "Ande pelo mapa, entre em locais para iniciar missoes e ganhe moedas e XP.",
      "Complete exercicios para desbloquear novas areas.",
      "Toque em Continuar para comecar a primeira licao de cores.",
    ],
    description: "Primeira licao: cores em ingles",
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
