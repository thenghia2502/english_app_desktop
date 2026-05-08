import { convertFileSrc } from "@tauri-apps/api/core";
import { appRepository } from "../repository/AppRepository";

type Accent = "uk" | "us";

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;

  async playWord(word: string, accent: Accent): Promise<void> {
    try {
      const localPath = await appRepository.resolveAudio(word, accent);
      if (!localPath) {
        return;
      }

      const source = convertFileSrc(localPath);
      if (this.currentAudio) {
        this.currentAudio.pause();
      }

      const audio = new Audio(source);
      this.currentAudio = audio;
      await audio.play();
    } catch (error) {
      // Audio is best effort for sandbox mode; failures should not block usage.
      console.error("Unable to play audio", error);
    }
  }
}

export const audioService = new AudioService();
