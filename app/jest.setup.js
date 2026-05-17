jest.mock(
  "@react-native-async-storage/async-storage",
  () => require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(() => ({
    seekTo: jest.fn(async () => {}),
    play: jest.fn(),
    remove: jest.fn(),
  })),
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
