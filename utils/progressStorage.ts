import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveChapterProgress = async (
  userId: string,
  articleId: string,
  chapterId: string,
  isCompleted: boolean,
  lastReadChapterId: string,
  lastReadPageId: string
) => {
  try {
    const existingProgress = await loadChapterProgress(userId, articleId);
    const progress = existingProgress || {};

    progress[chapterId] = isCompleted;
    progress.lastReadChapterId = lastReadChapterId;
    progress.lastReadPageId = lastReadPageId;

    const progressString = JSON.stringify(progress);
    await AsyncStorage.setItem(
      `progress_${userId}_${articleId}`,
      progressString
    );
  } catch (e) {
    console.error("Failed to save chapter progress:", e);
  }
};

export const loadChapterProgress = async (
  userId: string,
  articleId: string
): Promise<Record<string, boolean | string> | null> => {
  try {
    const progressString = await AsyncStorage.getItem(
      `progress_${userId}_${articleId}`
    );
    return progressString ? JSON.parse(progressString) : null;
  } catch (e) {
    console.error("Failed to load chapter progress:", e);
    return null;
  }
};

export const clearAllData = async (userId: string) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const userKeys = keys.filter((key) =>
      key.startsWith(`progress_${userId}_`)
    );

    await AsyncStorage.multiRemove(userKeys);
    console.log(`All data cleared for user ${userId}`);
  } catch (e) {
    console.error("Failed to clear AsyncStorage for user:", e);
  }
};
