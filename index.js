const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mainRoutes = require("./routes/routes");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:9001",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

app.use("/api_fe", mainRoutes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});
