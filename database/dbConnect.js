import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; //5 seconds

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    //Configure mongoose settings
    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected Successfully");
      this.isConnected = true;
    });
    mongoose.connection.on("error", () => {
      console.log("MongoDB connection error");
      this.isConnected = false;
    });
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      // this.isConnected = false;
      // attempt a reconnection
      this.handleDisconnection();
    });

    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connect() {
    try {
      if (!process.env.MONGO_URI)
        throw new Error("MONGODB_URI is not defined in environment variables");

      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, //use of ipv4
      };

      if (process.env.NODE_ENV === "development") mongoose.set("debug", true);

      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0; //if reaching here therefore the connection was successfull therefore reseting the retry count
    } catch (error) {
      console.error(error.message);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying connection.....Attempt no. ${
          this.retryCount
        } of${MAX_RETRIES} after ${RETRY_INTERVAL / 1000} seconds`
      );

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve;
        }, RETRY_INTERVAL)
      );
      return this.connect();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Please check your connection.`
      );
      process.exit(1);
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnected to MongoDB.....");
      this.connect();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through the app termination");
      process.exit(0);
    } catch (error) {
      console.error("error during app termination", error);
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// create singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection.connect.bind(dbConnection);
export const getdbConnectionStatus = dbConnection.getConnectionStatus.bind(dbConnection);
