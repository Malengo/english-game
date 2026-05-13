jest.mock(
  "@react-native-async-storage/async-storage",
  () => require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-audio", () => ({
  Audio: {
    Sound: {
      createAsync: async () => ({
        sound: {
          getStatusAsync: async () => ({ isLoaded: true }),
          setPositionAsync: async () => {},
          playAsync: async () => {},
          unloadAsync: async () => {},
        },
      }),
    },
  },
}));
