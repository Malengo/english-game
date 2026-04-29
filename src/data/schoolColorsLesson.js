export const schoolColorsLesson = {
  id: "school-colors-lesson",
  title: "Colors",
  subtitle: "Aprenda as cores em ingles",
  introMessage: "Vamos aprender as cores com 3 perguntas bem faceis!",
  completionMessage: "Muito bem! Voce completou a licao de cores.",
  questions: [
    {
      id: "apple",
      emoji: "🍎",
      prompt: "Qual cor é a apple?",
      helperText: "Apple significa maçã.",
      options: [
        { label: "Red", color: "#E53935" },
        { label: "Blue", color: "#1E88E5" },
        { label: "Green", color: "#43A047" },
      ],
      correctIndex: 0,
      successMessage: "Isso! Apple is red.",
      tryAgainMessage: "Quase! Tente outra vez.",
    },
    {
      id: "sky",
      emoji: "☁️",
      prompt: "Qual cor é o sky?",
      helperText: "Sky significa céu.",
      options: [
        { label: "Yellow", color: "#FBC02D" },
        { label: "Blue", color: "#1E88E5" },
        { label: "Pink", color: "#EC407A" },
      ],
      correctIndex: 1,
      successMessage: "Muito bem! The sky is blue.",
      tryAgainMessage: "Ainda não. Olhe para o céu outra vez.",
    },
    {
      id: "banana",
      emoji: "🍌",
      prompt: "Qual cor é a banana?",
      helperText: "Banana é uma fruta amarela.",
      options: [
        { label: "Purple", color: "#8E24AA" },
        { label: "Orange", color: "#FB8C00" },
        { label: "Yellow", color: "#FDD835" },
      ],
      correctIndex: 2,
      successMessage: "Perfeito! Banana is yellow.",
      tryAgainMessage: "Tente de novo. Pense na banana!",
    },
  ],
};

