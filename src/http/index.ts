import "dotenv/config";
import { createHttpServer } from "./httpServer.js";
import getPort from "get-port";

async function main() {
  try {
    const { app, startWebUI } = createHttpServer();
    const port = process.env.HTTP_PORT
      ? parseInt(process.env.HTTP_PORT, 10)
      : await getPort({ port: 3000 });

    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Shrimp Task Manager HTTP Server running on port ${port}`);
      console.log(`📡 Health check: http://localhost:${port}/health`);
      console.log(`🔧 MCP Tools: http://localhost:${port}/mcp/tools`);
      console.log(`📞 MCP Call: http://localhost:${port}/mcp/call`);
      
      // Start web UI if enabled
      startWebUI();
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log("\n🛑 Shutting down HTTP server...");
      server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start HTTP server:", error);
    process.exit(1);
  }
}

main().catch(console.error);

