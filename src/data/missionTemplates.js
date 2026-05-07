export const starterMissionTemplates = [
  {
    id: "school-colors-red-balloons",
    missionId: "school-colors-red-balloons",
    type: "balloons",
    target: { colorLabel: "Red" },
    spawnRules: {
      minCount: 8,
      maxCount: 14,
      minTargetCount: 3,
      maxTargetCount: 6,
      size: 40,
      mapPadding: 96,
      colors: [
        { label: "Red", color: "#e53935" },
        { label: "Blue", color: "#1e88e5" },
        { label: "Green", color: "#43a047" },
        { label: "Yellow", color: "#fdd835" },
      ],
    },
    completionRules: { type: "collect-targets", requireAllTargets: true },
    feedbackRules: {
      hudLabel: "Baloes red",
      guideMessage: "Muito bem! Agora procure apenas os baloes red no mapa.",
      wrongCollectibleMessageTemplate: "Esse balao e {colorLabel}. Procure baloes {targetColorLabel}.",
      completionMessage: "Perfeito! Voce coletou todos os baloes red.",
    },
    reward: { text: "Sticker: red-balloon" },
  },
  {
    id: "school-colors-blue-balloons",
    missionId: "school-colors-blue-balloons",
    type: "balloons",
    target: { colorLabel: "Blue" },
    spawnRules: {
      minCount: 8,
      maxCount: 14,
      minTargetCount: 3,
      maxTargetCount: 6,
      size: 40,
      mapPadding: 96,
      colors: [
        { label: "Red", color: "#e53935" },
        { label: "Blue", color: "#1e88e5" },
        { label: "Green", color: "#43a047" },
        { label: "Yellow", color: "#fdd835" },
      ],
    },
    completionRules: { type: "collect-targets", requireAllTargets: true },
    feedbackRules: {
      hudLabel: "Baloes blue",
      guideMessage: "Agora encontre apenas os baloes blue!",
      wrongCollectibleMessageTemplate: "Esse balao e {colorLabel}. Procure baloes {targetColorLabel}.",
      completionMessage: "Excelente! Voce encontrou todos os baloes blue.",
    },
    reward: { text: "Sticker: blue-balloon" },
  },
  {
    id: "bakery-foods-red-fruits",
    missionId: "bakery-foods-red-fruits",
    type: "collectibles",
    target: { attribute: "label", value: "Strawberry" },
    spawnRules: {
      minCount: 10,
      maxCount: 16,
      minTargetCount: 3,
      maxTargetCount: 6,
      size: 36,
      mapPadding: 96,
      collectibles: [
        { id: "fruit-1", label: "Strawberry", iconName: "strawberry", emoji: "🍓", isTarget: true },
        { id: "fruit-2", label: "Strawberry", iconName: "strawberry", emoji: "🍓", isTarget: true },
        { id: "fruit-3", label: "Strawberry", iconName: "strawberry", emoji: "🍓", isTarget: true },
        { id: "fruit-4", label: "Apple", iconName: "apple", emoji: "🍎", isTarget: false },
        { id: "fruit-5", label: "Banana", iconName: "banana", emoji: "🍌", isTarget: false },
        { id: "fruit-6", label: "Grapes", iconName: "grapes", emoji: "🍇", isTarget: false },
      ],
    },
    completionRules: { type: "collect-targets", requireAllTargets: true },
    feedbackRules: {
      hudLabel: "Strawberry",
      guideMessage: "Encontre as strawberries no mapa.",
      wrongCollectibleMessageTemplate: "Isso e {label}. Procure strawberries.",
      completionMessage: "Muito bem! Voce coletou todas as strawberries.",
    },
    reward: { text: "Sticker: strawberry" },
  },
  {
    id: "house-objects-matching-1",
    missionId: "house-objects-matching-1",
    type: "matching",
    target: {
      pairs: [
        { word: "Bed", iconName: "bed" },
        { word: "Chair", iconName: "chair" },
        { word: "Lamp", iconName: "lamp" },
      ],
    },
    spawnRules: {},
    completionRules: { type: "match-pairs", successThreshold: 1 },
    feedbackRules: {
      guideMessage: "Associe a palavra ao objeto correto.",
      correctMessage: "Muito bem!",
      wrongMessage: "Tente novamente.",
    },
    reward: { text: "Sticker: home-objects" },
  },
  {
    id: "verbs-sentence-1",
    missionId: "verbs-sentence-1",
    type: "sentence",
    target: {
      sentence: "I like apples",
      options: ["I", "like", "apples", "bananas"],
    },
    spawnRules: {},
    completionRules: { type: "assemble-sentence", exactMatch: true },
    feedbackRules: {
      guideMessage: "Monte a frase correta.",
      correctMessage: "Great job!",
      wrongMessage: "Quase! Tente de novo.",
    },
    reward: { text: "Sticker: sentence-builder" },
  },
  {
    id: "listening-objects-1",
    missionId: "listening-objects-1",
    type: "listening",
    target: { audioId: "audio-bed", expectedLabel: "Bed" },
    spawnRules: {
      options: [
        { label: "Bed", iconName: "bed" },
        { label: "Chair", iconName: "chair" },
        { label: "Table", iconName: "table" },
      ],
    },
    completionRules: { type: "select-audio-match" },
    feedbackRules: {
      guideMessage: "Ouca e escolha o objeto correto.",
      correctMessage: "Yes! That's bed.",
      wrongMessage: "Ouça novamente.",
    },
    reward: { text: "Sticker: good-listener" },
  },
];

export const starterMissionAssetRecommendations = {
  "school-colors-red-balloons": [
    "assets/images/collectibles/balloon-red.png",
    "assets/sfx/collect.wav",
  ],
  "school-colors-blue-balloons": [
    "assets/images/collectibles/balloon-blue.png",
    "assets/sfx/collect.wav",
  ],
  "bakery-foods-red-fruits": [
    "assets/images/collectibles/strawberry.png",
    "assets/images/collectibles/apple.png",
    "assets/images/collectibles/banana.png",
    "assets/images/collectibles/grapes.png",
  ],
  "house-objects-matching-1": [
    "assets/images/objects/bed.png",
    "assets/images/objects/chair.png",
    "assets/images/objects/lamp.png",
    "assets/audio/bed.mp3",
    "assets/audio/chair.mp3",
    "assets/audio/lamp.mp3",
  ],
  "verbs-sentence-1": ["assets/audio/i-like-apples.mp3"],
  "listening-objects-1": [
    "assets/audio/bed.mp3",
    "assets/audio/chair.mp3",
    "assets/audio/table.mp3",
    "assets/images/objects/bed.png",
    "assets/images/objects/chair.png",
    "assets/images/objects/table.png",
  ],
};

void starterMissionTemplates;
void starterMissionAssetRecommendations;
