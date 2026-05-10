import { convertFileSrc } from "@tauri-apps/api/core";
import { appService } from "../../services/AppService";

const audioCache = new Map<string, string>();

const buildAudioUrl = (word: string, dialect: string) => {
    const key = `${word.toLowerCase()}_${dialect}`;
    if (!audioCache.has(key)) {
        audioCache.set(
            key,
            `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=${dialect === "uk" ? "en-GB" : "en-US"}&client=tw-ob`
        );
    }
    return audioCache.get(key) ?? "";
};

export const useGetUrlAudio = () => async (word: string, dialect: string): Promise<string> => {
    const key = `${word.toLowerCase()}_${dialect}`;
    const cached = audioCache.get(key);
    if (cached) {
        return cached;
    }

    const accent = dialect === "uk" ? "uk" : "us";
    const localPath = await appService.resolveAudio(word, accent);
    if (localPath) {
        const localUrl = convertFileSrc(localPath);
        audioCache.set(key, localUrl);
        return localUrl;
    }

    return buildAudioUrl(word, dialect);
};

export const clearAudioCache = () => audioCache.clear();