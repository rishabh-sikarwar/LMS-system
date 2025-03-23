import { getdbConnectionStatus } from "../database/dbConnect.js";

export const checkHealth = async (req, res) => {
  try {
    const dbStatus = getdbConnectionStatus();

    const healthStatus = {
      status: "OK",
      timeStamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.isConnected ? "healthy" : "unhealthy",
          details: {
            ...dbStatus,
            readyState: getReadyStateText(dbStatus.readyState),
          },
        },
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      },
    };

    const httpStatus =
      healthStatus.services.database.status === "healthy" ? 200 : 503;

    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    console.error("Health check failed", error);
    res
      .status(500)
      .json({
        status: "error",
        error: error.message,
        timeStamp: new Date().toISOString(),
      });
  }
};


//Utility Method
function getReadyStateText(state) {
  switch (state) {
    case 0:
      return "disconnected";
      break;
    case 1:
      return "connected";
      break;
    case 2:
      return "connecting";
      break;
    case 3:
      return "disconnecting";
      break;

    default:
      return "unknown";
  }
}
