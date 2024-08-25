import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveChapterProgress = async (
  articleId: string,
  chapterId: string,
  isCompleted: boolean,
  lastReadChapterId: string,
  lastReadPageId: string
) => {
  try {
    const existingProgress = await loadChapterProgress(articleId);
    const progress = existingProgress || {};

    progress[chapterId] = isCompleted;
    progress.lastReadChapterId = lastReadChapterId;
    progress.lastReadPageId = lastReadPageId;

    const progressString = JSON.stringify(progress);
    await AsyncStorage.setItem(`progress_${articleId}`, progressString);
  } catch (e) {
    console.error("Failed to save chapter progress:", e);
  }
};

export const loadChapterProgress = async (
  articleId: string
): Promise<Record<string, boolean | string> | null> => {
  try {
    const progressString = await AsyncStorage.getItem(`progress_${articleId}`);
    return progressString ? JSON.parse(progressString) : null;
  } catch (e) {
    console.error("Failed to load chapter progress:", e);
    return null;
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log("All data cleared");
  } catch (e) {
    console.error("Failed to clear the AsyncStorage:", e);
  }
};
