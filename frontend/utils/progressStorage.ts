// Progress storage utilities for saving and loading chapter progress
import AsyncStorage from "@react-native-async-storage/async-storage";
import articlesData from "@/assets/articles/articles.json";

/**
 * Save chapter progress
 * @param userId User ID
 * @param articleId Article ID
 * @param chapterId Chapter ID
 * @param isCompleted  Is chapter completed
 * @param lastReadChapterId  Last read chapter ID
 * @param lastReadPageId  Last read page ID
 */
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

/**
 * Load chapter progress
 * @param userId User ID
 * @param articleId Article ID
 * @returns Chapter progress
 */
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

/**
 * Clear all data for a user
 * @param userId User ID
 */
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

/**
 * Count articles read
 * @param userId User ID
 * @returns Number of articles read
 */
export const countArticlesRead = async (userId: string): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter((key) => key.startsWith(`progress_${userId}_`)).length;
  } catch (e) {
    console.error("Failed to count articles read:", e);
  }
  return 0;
};

/**
 * Count pages read
 * @param userId User ID
 * @returns Number of pages read
 */
export const countPagesRead = async (userId: string): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const matches = keys.filter((key) => key.startsWith(`progress_${userId}_`));
    let count = 0;

    for (const key of matches) {
      const progressString = await AsyncStorage.getItem(key);
      if (progressString) {
        const progress = JSON.parse(progressString);
        const splits = key.split("_");
        const article_id = splits[splits.length - 1];

        for (const chapter of articlesData.articles.find(
          (article) => article.id === article_id
        )?.chapters || []) {
          if (progress[chapter.id] === true) {
            count += chapter.pages.length;
          } else if (chapter.id === progress.lastReadChapterId) {
            const lastReadPage = parseInt(progress.lastReadPageId, 0);
            count += lastReadPage;
            break;
          }
        }
      }
    }

    return count;
  } catch (e) {
    console.error("Failed to count pages read:", e);
  }
  return 0;
};
