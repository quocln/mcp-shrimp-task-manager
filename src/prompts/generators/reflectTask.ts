/**
 * reflectTask prompt 生成器
 * reflectTask prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */
import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
export interface ReflectTaskPromptParams {
  summary: string;
  analysis: string;
}
/**
 * 獲取 reflectTask 的完整 prompt
 * Get the complete reflectTask prompt
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getReflectTaskPrompt(
  params: ReflectTaskPromptParams
): Promise<string> {
  const indexTemplate = await loadPromptFromTemplate("reflectTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    summary: params.summary,
    analysis: params.analysis,
  });
  return loadPrompt(prompt, "REFLECT_TASK");
}
