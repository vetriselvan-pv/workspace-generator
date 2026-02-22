import dotenv from "dotenv";
import { app } from "./app.js";
import { env } from "./config/env.js";
import cors from "cors";

dotenv.config();

app.use(
  cors({
    origin: process.env.URL,
  }),
);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

export default app;
