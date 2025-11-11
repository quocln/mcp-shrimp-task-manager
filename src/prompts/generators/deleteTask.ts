/**
 * deleteTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 * deleteTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */
import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task } from "../../types/index.js";
export interface DeleteTaskPromptParams {
  taskId: string;
  task?: Task;
  success?: boolean;
  message?: string;
  isTaskCompleted?: boolean;
}
/**
 * 獲取 deleteTask 的完整 prompt
 * Get the complete prompt for deleteTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getDeleteTaskPrompt(
  params: DeleteTaskPromptParams
): Promise<string> {
  const { taskId, task, success, message, isTaskCompleted } = params;
  if (!task) {
    const notFoundTemplate = await loadPromptFromTemplate(
      "deleteTask/notFound.md"
    );
    return generatePrompt(notFoundTemplate, {
      taskId,
    });
  }
  if (isTaskCompleted) {
    const completedTemplate = await loadPromptFromTemplate(
      "deleteTask/completed.md"
    );
    return generatePrompt(completedTemplate, {
      taskId: task.id,
      taskName: task.name,
    });
  }
  const responseTitle = success ? "Success" : "Failure";
  const indexTemplate = await loadPromptFromTemplate("deleteTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message,
  });
  return loadPrompt(prompt, "DELETE_TASK");
}
