/**
 * Prompt loader
 * Provides functionality to load custom prompts from environment variables
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDataDir } from "../utils/paths.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processEnvString(input: string | undefined): string {
  if (!input) return "";

  return input
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r");
}

/**
 * Load prompt with environment variable customization support
 * @param basePrompt Basic prompt content
 * @param promptKey Prompt key name, used to generate environment variable names
 * @returns Final prompt content
 */
export function loadPrompt(basePrompt: string, promptKey: string): string {
  // Convert to uppercase as part of the environment variable
  const envKey = promptKey.toUpperCase();

  // Check if there is a replacement mode environment variable
  const overrideEnvVar = `MCP_PROMPT_${envKey}`;
  if (process.env[overrideEnvVar]) {
    // Use environment variable to completely replace original prompt
    return processEnvString(process.env[overrideEnvVar]);
  }

  // Check if there is an append mode environment variable
  const appendEnvVar = `MCP_PROMPT_${envKey}_APPEND`;
  if (process.env[appendEnvVar]) {
    // Append environment variable content to the original prompt
    return `${basePrompt}\n\n${processEnvString(process.env[appendEnvVar])}`;
  }

  // If no customization, use the original prompt
  return basePrompt;
}

/**
 * Generate prompt with dynamic parameters
 * @param promptTemplate prompt template
 * @param params dynamic parameters
 * @returns Prompt with parameters filled in
 */
export function generatePrompt(
  promptTemplate: string,
  params: Record<string, any> = {}
): string {
  // Use simple template replacement method to replace {paramName} with corresponding parameter values
  let result = promptTemplate;

  Object.entries(params).forEach(([key, value]) => {
    // If value is undefined or null, replace with empty string
    const replacementValue =
      value !== undefined && value !== null ? String(value) : "";

    // Use regular expression to replace all matching placeholders
    const placeholder = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(placeholder, replacementValue);
  });

  return result;
}

/**
 * Load prompt from template
 * @param templatePath Template path relative to template set root directory (e.g., 'chat/basic.md')
 * @returns Template content
 * @throws Error if template file is not found
 */
export async function loadPromptFromTemplate(
  templatePath: string
): Promise<string> {
  const templateSetName = process.env.TEMPLATES_USE || "en";
  const dataDir = await getDataDir();
  const builtInTemplatesBaseDir = __dirname;

  let finalPath = "";
  const checkedPaths: string[] = []; // Used for more detailed error reporting

  // 1. Check custom paths in DATA_DIR
  // path.resolve can handle cases where templateSetName is an absolute path
  const customFilePath = path.resolve(dataDir, templateSetName, templatePath);
  checkedPaths.push(`Custom: ${customFilePath}`);
  if (fs.existsSync(customFilePath)) {
    finalPath = customFilePath;
  }

  // 2. If custom path not found, check specific built-in template directory
  if (!finalPath) {
    // Assume templateSetName for built-in templates is 'en', 'zh', etc.
    const specificBuiltInFilePath = path.join(
      builtInTemplatesBaseDir,
      `templates_${templateSetName}`,
      templatePath
    );
    checkedPaths.push(`Specific Built-in: ${specificBuiltInFilePath}`);
    if (fs.existsSync(specificBuiltInFilePath)) {
      finalPath = specificBuiltInFilePath;
    }
  }

  // 3. If specific built-in template is also not found and not 'en' (avoid duplicate checking)
  if (!finalPath && templateSetName !== "en") {
    const defaultBuiltInFilePath = path.join(
      builtInTemplatesBaseDir,
      "templates_en",
      templatePath
    );
    checkedPaths.push(`Default Built-in ('en'): ${defaultBuiltInFilePath}`);
    if (fs.existsSync(defaultBuiltInFilePath)) {
      finalPath = defaultBuiltInFilePath;
    }
  }

  // 4. If template is not found in all paths, throw error
  if (!finalPath) {
    throw new Error(
      `Template file not found: '${templatePath}' in template set '${templateSetName}'. Checked paths:\n - ${checkedPaths.join(
        "\n - "
      )}`
    );
  }

  // 5. Read the found file
  return fs.readFileSync(finalPath, "utf-8");
}
