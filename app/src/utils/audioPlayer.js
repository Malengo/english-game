import { createAudioPlayer } from "expo-audio";

const soundCache = new Map();

async function loadSound(url) {
  if (!url) return null;

  if (soundCache.has(url)) {
    return soundCache.get(url);
  }

  const player = createAudioPlayer({ uri: url });

  soundCache.set(url, player);

  return player;
}

export async function playCachedAudio(url) {
  if (!url) return false
  const player = await loadSound(url);

  if (!player) return false;

  try {
    // Reinicia o áudio do começo
    await player.seekTo(0);

    // Toca
    player.play();
  } catch (error) {
    console.log("Erro ao tocar áudio:", error);
    return false;
  }

  return true;
}

export async function unloadAllCachedAudio() {
  const players = Array.from(soundCache.values());

  soundCache.clear();

  for (const player of players) {
    try {
      player.remove();
    } catch (_error) {
      // ignora
    }
  }
}

void playCachedAudio;
void unloadAllCachedAudio;