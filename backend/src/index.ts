import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";

// Routes //

// Connection //
connectToDatabase()
  .then(() => {
    console.log("Connected to MongoDB 🍃");
    app.listen(process.env.PORT, () => {
      console.log("Server Open ✅");
    });
  })
  .catch((err) => {
    console.log(err);
  });
