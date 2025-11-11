/**
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
 * Get the complete prompt for completeTask
 * @param params prompt parameters
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
