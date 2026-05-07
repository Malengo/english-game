export const houseObjectsLesson = {
  id: "house-objects-lesson",
  title: "House Objects",
  subtitle: "Aprenda objetos da casa em ingles",
  introMessage: "Vamos aprender objetos da casa com 3 perguntas rapidas!",
  completionMessage: "Muito bem! Voce completou a licao da casa.",
  questions: [
    {
      id: "bed",
      emoji: "🛏️",
      prompt: "Qual objeto e este?",
      helperText: "Bed significa cama.",
      options: [
        { label: "Bed", color: "#8D6E63" },
        { label: "Chair", color: "#5D4037" },
        { label: "Lamp", color: "#FFB300" },
      ],
      correctIndex: 0,
      successMessage: "Isso! Bed e cama.",
      tryAgainMessage: "Quase! Tente outra vez.",
    },
    {
      id: "chair",
      emoji: "🪑",
      prompt: "Qual objeto e este?",
      helperText: "Chair significa cadeira.",
      options: [
        { label: "Table", color: "#6D4C41" },
        { label: "Chair", color: "#5D4037" },
        { label: "Bed", color: "#8D6E63" },
      ],
      correctIndex: 1,
      successMessage: "Muito bem! Chair e cadeira.",
      tryAgainMessage: "Ainda nao. Pense na cadeira.",
    },
    {
      id: "lamp",
      emoji: "💡",
      prompt: "Qual objeto e este?",
      helperText: "Lamp significa lampada.",
      options: [
        { label: "Lamp", color: "#FFB300" },
        { label: "Sofa", color: "#8D6E63" },
        { label: "Door", color: "#6D4C41" },
      ],
      correctIndex: 0,
      successMessage: "Perfeito! Lamp e lampada.",
      tryAgainMessage: "Tente de novo. Pense na luz!",
    },
  ],
};

