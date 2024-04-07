import express, { Express } from "express";
import dotenv from "dotenv";
import { fetchGoldPricesHandler } from "./api_data";

dotenv.config();
const port = process.env.PORT || 3000;

const app: Express = express();
app.use(express.static("frontend"));

app.get("/fetchGoldPrices", fetchGoldPricesHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
