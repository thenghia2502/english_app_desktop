import { convertFileSrc } from "@tauri-apps/api/core";
import { appService } from "../../services/AppService";

const audioCache = new Map<string, string>();

export const useGetUrlAudio = () => async (word: string, dialect: string): Promise<string> => {
    const key = `${word}_${dialect}`;

    const cached = audioCache.get(key);
    if (cached) {
        console.debug('[useGetUrlAudio] cache hit', key)
        return cached;
    }

    // No external TTS fallback — prefer local resolved audio via appService.resolveAudio
    const accent = dialect === "uk" ? "uk" : "us";
    console.debug('[useGetUrlAudio] resolving local audio', { word, dialect, accent, key })
    const start = Date.now()
    const localPath = await appService.resolveAudio(word, accent);
    const took = Date.now() - start
    console.debug('[useGetUrlAudio] resolveAudio result', { word, dialect, accent, took, localPath: Boolean(localPath) })
    if (localPath) {
        const localUrl = convertFileSrc(localPath);
        audioCache.set(key, localUrl);
        return localUrl;
    }

    // If local audio not available, return empty string so caller can handle error.
    return "";
};

export const prefetchAudioUrls = async (words: string[], dialect: string) => {
    await Promise.all(words.map(async (word) => {
        try {
            const key = `${word}_${dialect}`;
            if (audioCache.has(key)) return;
            const accent = dialect === "uk" ? "uk" : "us";
            const localPath = await appService.resolveAudio(word, accent);
            if (localPath) {
                const localUrl = convertFileSrc(localPath);
                audioCache.set(key, localUrl);
            }
        } catch (e) {
            console.debug('prefetchAudioUrls failed for', word, dialect, e);
        }
    }))
}

export const clearAudioCache = () => audioCache.clear();