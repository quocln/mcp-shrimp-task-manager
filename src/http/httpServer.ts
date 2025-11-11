import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  planTask,
  analyzeTask,
  reflectTask,
  splitTasksRaw,
  listTasks,
  executeTask,
  verifyTask,
  deleteTask,
  clearAllTasks,
  updateTaskContent,
  queryTask,
  getTaskDetail,
  processThought,
  initProjectRules,
  researchMode,
} from "../tools/index.js";
import {
  planTaskSchema,
  analyzeTaskSchema,
  reflectTaskSchema,
  splitTasksRawSchema,
  listTasksSchema,
  executeTaskSchema,
  verifyTaskSchema,
  deleteTaskSchema,
  clearAllTasksSchema,
  updateTaskContentSchema,
  queryTaskSchema,
  getTaskDetailSchema,
  processThoughtSchema,
  initProjectRulesSchema,
  researchModeSchema,
} from "../tools/index.js";
import { createWebServer } from "../web/webServer.js";

export function createHttpServer() {
  const app = express();
  let webServerInstance: Awaited<ReturnType<typeof createWebServer>> | null = null;

  // Helper function to get tools list with schemas
  function getToolsList() {
    return [
      {
        name: "plan_task",
        description: "Plan and analyze a task",
        inputSchema: zodToJsonSchema(planTaskSchema),
      },
      {
        name: "analyze_task",
        description: "Analyze task requirements",
        inputSchema: zodToJsonSchema(analyzeTaskSchema),
      },
      {
        name: "reflect_task",
        description: "Reflect on task quality",
        inputSchema: zodToJsonSchema(reflectTaskSchema),
      },
      {
        name: "split_tasks",
        description: "Split task into subtasks",
        inputSchema: zodToJsonSchema(splitTasksRawSchema),
      },
      {
        name: "list_tasks",
        description: "List all tasks",
        inputSchema: zodToJsonSchema(listTasksSchema),
      },
      {
        name: "execute_task",
        description: "Execute a task",
        inputSchema: zodToJsonSchema(executeTaskSchema),
      },
      {
        name: "verify_task",
        description: "Verify task completion",
        inputSchema: zodToJsonSchema(verifyTaskSchema),
      },
      {
        name: "delete_task",
        description: "Delete a task",
        inputSchema: zodToJsonSchema(deleteTaskSchema),
      },
      {
        name: "clear_all_tasks",
        description: "Clear all tasks",
        inputSchema: zodToJsonSchema(clearAllTasksSchema),
      },
      {
        name: "update_task",
        description: "Update task content",
        inputSchema: zodToJsonSchema(updateTaskContentSchema),
      },
      {
        name: "query_task",
        description: "Search tasks",
        inputSchema: zodToJsonSchema(queryTaskSchema),
      },
      {
        name: "get_task_detail",
        description: "Get task details",
        inputSchema: zodToJsonSchema(getTaskDetailSchema),
      },
      {
        name: "process_thought",
        description: "Process chain of thought",
        inputSchema: zodToJsonSchema(processThoughtSchema),
      },
      {
        name: "init_project_rules",
        description: "Initialize project rules",
        inputSchema: zodToJsonSchema(initProjectRulesSchema),
      },
      {
        name: "research_mode",
        description: "Enter research mode",
        inputSchema: zodToJsonSchema(researchModeSchema),
      },
    ];
  }

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", service: "Shrimp Task Manager MCP" });
  });

  // MCP Protocol endpoint for inspector and clients
  // This endpoint implements the MCP HTTP transport using SSE
  app.get("/mcp", (req: Request, res: Response) => {
    // Set up SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    // Send initial connection message
    res.write("data: " + JSON.stringify({ type: "connection", status: "connected" }) + "\n\n");

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(": keepalive\n\n");
    }, 30000);

    // Clean up on disconnect
    req.on("close", () => {
      clearInterval(keepAlive);
      res.end();
    });
  });

  // MCP Protocol POST endpoint for sending messages
  app.post("/mcp", async (req: Request, res: Response) => {
    try {
      const message = req.body;

      // Handle MCP protocol messages (JSON-RPC 2.0 format)
      if (message.method === "initialize") {
        // Initialize response
        res.json({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              logging: {},
            },
            serverInfo: {
              name: "Shrimp Task Manager",
              version: "1.0.21",
            },
          },
        });
        return;
      }

      if (message.method === "tools/list") {
        // Return list of tools in MCP format with schemas
        const tools = getToolsList();
        res.json({
          jsonrpc: "2.0",
          id: message.id,
          result: { tools },
        });
        return;
      }

      if (message.method === "tools/call") {
        // Handle tool execution
        const { name, arguments: args } = message.params || {};
        
        if (!name) {
          res.json({
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32602,
              message: "Invalid params",
              data: "Tool name is required",
            },
          });
          return;
        }

        let result;
        let parsedArgs;

        try {
          switch (name) {
            case "plan_task":
              parsedArgs = await planTaskSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await planTask(parsedArgs.data);
              break;

            case "analyze_task":
              parsedArgs = await analyzeTaskSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await analyzeTask(parsedArgs.data);
              break;

            case "reflect_task":
              parsedArgs = await reflectTaskSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await reflectTask(parsedArgs.data);
              break;

            case "split_tasks":
              parsedArgs = await splitTasksRawSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await splitTasksRaw(parsedArgs.data);
              break;

            case "list_tasks":
              parsedArgs = await listTasksSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await listTasks(parsedArgs.data);
              break;

            case "execute_task":
              parsedArgs = await executeTaskSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await executeTask(parsedArgs.data);
              break;

            case "verify_task":
              parsedArgs = await verifyTaskSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await verifyTask(parsedArgs.data);
              break;

            case "delete_task":
              parsedArgs = await deleteTaskSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await deleteTask(parsedArgs.data);
              break;

            case "clear_all_tasks":
              parsedArgs = await clearAllTasksSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await clearAllTasks(parsedArgs.data);
              break;

            case "update_task":
              parsedArgs = await updateTaskContentSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await updateTaskContent(parsedArgs.data);
              break;

            case "query_task":
              parsedArgs = await queryTaskSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await queryTask(parsedArgs.data);
              break;

            case "get_task_detail":
              parsedArgs = await getTaskDetailSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await getTaskDetail(parsedArgs.data);
              break;

            case "process_thought":
              parsedArgs = await processThoughtSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await processThought(parsedArgs.data);
              break;

            case "init_project_rules":
              result = await initProjectRules();
              break;

            case "research_mode":
              parsedArgs = await researchModeSchema.safeParseAsync(args || {});
              if (!parsedArgs.success) {
                throw new Error(`Invalid arguments: ${parsedArgs.error.message}`);
              }
              result = await researchMode(parsedArgs.data);
              break;

            default:
              res.json({
                jsonrpc: "2.0",
                id: message.id,
                error: {
                  code: -32601,
                  message: "Method not found",
                  data: `Tool '${name}' not found`,
                },
              });
              return;
          }

          // Trigger Web UI update if tasks were modified
          const tasksModifyingTools = [
            "plan_task",
            "analyze_task",
            "reflect_task",
            "split_tasks",
            "execute_task",
            "verify_task",
            "delete_task",
            "clear_all_tasks",
            "update_task",
            "process_thought",
          ];
          if (webServerInstance && tasksModifyingTools.includes(name)) {
            webServerInstance.sendSseUpdate();
          }

          // Return result in MCP format
          res.json({
            jsonrpc: "2.0",
            id: message.id,
            result: {
              content: result.content || [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            },
          });
        } catch (error) {
          res.json({
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32000,
              message: "Tool execution failed",
              data: error instanceof Error ? error.message : String(error),
            },
          });
        }
        return;
      }

      // Handle notifications (no response needed)
      if (message.method === "notifications/initialized") {
        // Start web UI if enabled (will be defined later in the function)
        if (process.env.ENABLE_GUI === "true" && !webServerInstance) {
          // Start web UI asynchronously
          createWebServer()
            .then((ws) => {
              webServerInstance = ws;
              return ws.startServer();
            })
            .catch(() => {});
        }
        res.status(204).send(); // No content for notifications
        return;
      }

      // Unknown method
      res.json({
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32601,
          message: "Method not found",
          data: `Method '${message.method}' not found`,
        },
      });
    } catch (error) {
      res.json({
        jsonrpc: "2.0",
        id: req.body?.id || null,
        error: {
          code: -32700,
          message: "Parse error",
          data: error instanceof Error ? error.message : String(error),
        },
      });
    }
  });

  // MCP Protocol endpoints
  // List all available tools (REST endpoint with full schemas)
  app.get("/mcp/tools", async (req: Request, res: Response) => {
    try {
      const tools = getToolsList();
      res.json({ tools });
    } catch (error) {
      res.status(500).json({
        error: "Failed to list tools",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Call tool endpoint (MCP protocol compatible)
  app.post("/mcp/call", (async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, arguments: args } = req.body;

      if (!name) {
        res.status(400).json({ error: "Tool name is required" });
        return;
      }

      let result;
      let parsedArgs;

      switch (name) {
        case "plan_task":
          parsedArgs = await planTaskSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await planTask(parsedArgs.data);
          break;

        case "analyze_task":
          parsedArgs = await analyzeTaskSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await analyzeTask(parsedArgs.data);
          break;

        case "reflect_task":
          parsedArgs = await reflectTaskSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await reflectTask(parsedArgs.data);
          break;

        case "split_tasks":
          parsedArgs = await splitTasksRawSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await splitTasksRaw(parsedArgs.data);
          break;

        case "list_tasks":
          parsedArgs = await listTasksSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await listTasks(parsedArgs.data);
          break;

        case "execute_task":
          parsedArgs = await executeTaskSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await executeTask(parsedArgs.data);
          break;

        case "verify_task":
          parsedArgs = await verifyTaskSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await verifyTask(parsedArgs.data);
          break;

        case "delete_task":
          parsedArgs = await deleteTaskSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await deleteTask(parsedArgs.data);
          break;

        case "clear_all_tasks":
          parsedArgs = await clearAllTasksSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await clearAllTasks(parsedArgs.data);
          break;

        case "update_task":
          parsedArgs = await updateTaskContentSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await updateTaskContent(parsedArgs.data);
          break;

        case "query_task":
          parsedArgs = await queryTaskSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await queryTask(parsedArgs.data);
          break;

        case "get_task_detail":
          parsedArgs = await getTaskDetailSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await getTaskDetail(parsedArgs.data);
          break;

        case "process_thought":
          parsedArgs = await processThoughtSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await processThought(parsedArgs.data);
          break;

        case "init_project_rules":
          result = await initProjectRules();
          break;

        case "research_mode":
          parsedArgs = await researchModeSchema.safeParseAsync(args || {});
          if (!parsedArgs.success) {
            res.status(400).json({
              error: "Invalid arguments",
              details: parsedArgs.error.errors,
            });
            return;
          }
          result = await researchMode(parsedArgs.data);
          break;

        default:
          res.status(404).json({
            error: `Tool '${name}' not found`,
          });
          return;
      }

      // Trigger Web UI update if tasks were modified (before sending response)
      const tasksModifyingTools = [
        "plan_task",
        "analyze_task",
        "reflect_task",
        "split_tasks",
        "execute_task",
        "verify_task",
        "delete_task",
        "clear_all_tasks",
        "update_task",
        "process_thought",
      ];
      if (webServerInstance && tasksModifyingTools.includes(name)) {
        webServerInstance.sendSseUpdate();
      }

      // MCP protocol response format (REST endpoint - returns content directly)
      res.json({
        content: result.content || [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: "Tool execution failed",
        message: errorMsg,
      });
    }
  }) as RequestHandler);

  // Start web UI server if enabled
  const startWebUI = async () => {
    const ENABLE_GUI = process.env.ENABLE_GUI === "true";
    if (ENABLE_GUI) {
      try {
        webServerInstance = await createWebServer();
        await webServerInstance.startServer();
        const webPort = process.env.WEB_PORT || "3001";
        console.log(`🌐 Web UI available at http://localhost:${webPort}`);
      } catch (error) {
        console.error("Failed to start web UI:", error);
      }
    }
  };

  return {
    app,
    startWebUI,
  };
}

