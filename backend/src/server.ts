import cors from "cors";
import express from "express";
import { routes } from "./routes";

const app = express();

app.use(cors()); // Permite chamadas vindas do seu React
app.use(express.json());
app.use("/api", routes);

app.listen(3333, () => {
  console.log("Backend rodando em http://localhost:3333/api");
});
