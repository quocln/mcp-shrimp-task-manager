import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
/**
 * clearAllTasks prompt 參數介面
 */
/**
 * clearAllTasks prompt parameter interface
 */
export interface ClearAllTasksPromptParams {
  confirm?: boolean;
  success?: boolean;
  message?: string;
  backupFile?: string;
  isEmpty?: boolean;
}
/**
 * 獲取 clearAllTasks 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
/**
 * Get complete prompt for clearAllTasks
 * @param params prompt parameters
 * @returns generated prompt
 */
export async function getClearAllTasksPrompt(
  params: ClearAllTasksPromptParams
): Promise<string> {
  const { confirm, success, message, backupFile, isEmpty } = params;
  if (confirm === false) {
    const cancelTemplate = await loadPromptFromTemplate(
      "clearAllTasks/cancel.md"
    );
    return generatePrompt(cancelTemplate, {});
  }
  if (isEmpty) {
    const emptyTemplate = await loadPromptFromTemplate(
      "clearAllTasks/empty.md"
    );
    return generatePrompt(emptyTemplate, {});
  }
  const responseTitle = success ? "Success" : "Failure";
  const backupInfo = backupFile
    ? generatePrompt(
        await loadPromptFromTemplate("clearAllTasks/backupInfo.md"),
        {
          backupFile,
        }
      )
    : "";
  const indexTemplate = await loadPromptFromTemplate("clearAllTasks/index.md");
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message,
    backupInfo,
  });
  return loadPrompt(prompt, "CLEAR_ALL_TASKS");
}
