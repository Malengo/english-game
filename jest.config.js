module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverage: false,
  collectCoverageFrom: [
    "src/utils/**/*.js",
    "src/data/**/*.js",
    "src/screens/SchoolMissionScreen.js",
    "src/screens/HouseMissionScreen.js",
    "src/screens/mapScreen.logic.js",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

