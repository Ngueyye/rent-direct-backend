import express from "express";
import cors from "cors";
import landlordRoutes from "./routes/landlordRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("RentDirect API is running");
});

app.use("/v1/landlords", landlordRoutes);
app.use("/v1/listings", listingRoutes);

export default app;