import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { getResearchModePrompt } from "../../prompts/index.js";
import { getMemoryDir } from "../../utils/paths.js";

// Research mode tool
export const researchModeSchema = z.object({
  topic: z
    .string()
    .min(5, {
      message: "Research topic cannot be less than 5 characters, please provide a clear research topic",
    })
    .describe("Programming topic content to be researched, should be clear and specific"),
  previousState: z
    .string()
    .optional()
    .default("")
    .describe(
      "Previous research state and content summary, empty on first execution, subsequently contains previous detailed and key research results, this will help subsequent research"
    ),
  currentState: z
    .string()
    .describe(
      "Main content that the current Agent should execute, such as using web tools to search for certain keywords or analyze specific code, after research is completed please call research_mode to record state and integrate with previous `previousState`, this will help you better save and execute research content"
    ),
  nextSteps: z
    .string()
    .describe(
      "Subsequent plans, steps or research directions, used to constrain Agent from deviating from topic or going in wrong direction, if need to adjust research direction during research process, please update this field"
    ),
});

export async function researchMode({
  topic,
  previousState = "",
  currentState,
  nextSteps,
}: z.infer<typeof researchModeSchema>) {
  // Get base directory path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PROJECT_ROOT = path.resolve(__dirname, "../../..");
  const MEMORY_DIR = await getMemoryDir();

  // Use prompt generator to get final prompt
  const prompt = await getResearchModePrompt({
    topic,
    previousState,
    currentState,
    nextSteps,
    memoryDir: MEMORY_DIR,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
  };
}
