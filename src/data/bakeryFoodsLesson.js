export const bakeryFoodsLesson = {
  id: "bakery-foods-lesson",
  title: "Bakery Foods",
  subtitle: "Aprenda comidas da padaria em ingles",
  introMessage: "Vamos aprender comidas da padaria com 3 perguntas!",
  completionMessage: "Muito bem! Voce completou a licao da padaria.",
  questions: [
    {
      id: "bread",
      emoji: "🍞",
      prompt: "Qual comida e esta?",
      helperText: "Bread significa pao.",
      options: [
        { label: "Bread", color: "#F9A825" },
        { label: "Cake", color: "#F06292" },
        { label: "Cookie", color: "#8D6E63" },
      ],
      correctIndex: 0,
      successMessage: "Isso! Bread e pao.",
      tryAgainMessage: "Quase! Tente outra vez.",
    },
    {
      id: "croissant",
      emoji: "🥐",
      prompt: "Qual comida e esta?",
      helperText: "Croissant e um pao folhado.",
      options: [
        { label: "Croissant", color: "#F9A825" },
        { label: "Donut", color: "#EC407A" },
        { label: "Pie", color: "#8D6E63" },
      ],
      correctIndex: 0,
      successMessage: "Muito bem! Croissant.",
      tryAgainMessage: "Ainda nao. Olhe a forma!",
    },
    {
      id: "cake",
      emoji: "🍰",
      prompt: "Qual comida e esta?",
      helperText: "Cake significa bolo.",
      options: [
        { label: "Cake", color: "#F06292" },
        { label: "Bread", color: "#F9A825" },
        { label: "Cookie", color: "#8D6E63" },
      ],
      correctIndex: 0,
      successMessage: "Perfeito! Cake e bolo.",
      tryAgainMessage: "Tente de novo. Pense no bolo!",
    },
  ],
};

