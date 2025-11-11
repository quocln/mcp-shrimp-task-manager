import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * analyzeTask prompt parameter interface
 */
export interface AnalyzeTaskPromptParams {
  summary: string;
  initialConcept: string;
  previousAnalysis?: string;
}

/**
 * Get complete prompt for analyzeTask
 * @param params prompt parameters
 * @returns generated prompt
 */
export async function getAnalyzeTaskPrompt(
  params: AnalyzeTaskPromptParams
): Promise<string> {
  const indexTemplate = await loadPromptFromTemplate("analyzeTask/index.md");
  const iterationTemplate = await loadPromptFromTemplate(
    "analyzeTask/iteration.md"
  );

  let iterationPrompt = "";
  if (params.previousAnalysis) {
    iterationPrompt = generatePrompt(iterationTemplate, {
      previousAnalysis: params.previousAnalysis,
    });
  }

  let prompt = generatePrompt(indexTemplate, {
    summary: params.summary,
    initialConcept: params.initialConcept,
    iterationPrompt: iterationPrompt,
  });

  return loadPrompt(prompt, "ANALYZE_TASK");
}
