/**
 * initProjectRules prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */
import { loadPrompt, loadPromptFromTemplate } from "../loader.js";
export interface InitProjectRulesPromptParams {
}
/**
 * Get the complete prompt for initProjectRules
 * @param params prompt parameters (optional)
 * @returns generated prompt
 */
export async function getInitProjectRulesPrompt(
  params?: InitProjectRulesPromptParams
): Promise<string> {
  const indexTemplate = await loadPromptFromTemplate(
    "initProjectRules/index.md"
  );
  return loadPrompt(indexTemplate, "INIT_PROJECT_RULES");
}
