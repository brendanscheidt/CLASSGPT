import app from "./App.js";
import { connectToDatabase } from "./db/connection.js";
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
//# sourceMappingURL=index.js.map
