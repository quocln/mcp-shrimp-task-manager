/**
 * completeTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 * completeTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */
import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task } from "../../types/index.js";
export interface CompleteTaskPromptParams {
  task: Task;
  completionTime: string;
}
/**
 * 獲取 completeTask 的完整 prompt
 * Get the complete prompt for completeTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getCompleteTaskPrompt(
  params: CompleteTaskPromptParams
): Promise<string> {
  const { task, completionTime } = params;
  const indexTemplate = await loadPromptFromTemplate("completeTask/index.md");
  let prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    completionTime: completionTime,
  });
  return loadPrompt(prompt, "COMPLETE_TASK");
}
