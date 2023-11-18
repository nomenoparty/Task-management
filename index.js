const express = require("express");
const database = require("./config/database");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT;  

const routeApiVer1 = require("./api/v1/routes/index.route");

database.connect();

app.use(cors());

app.use(cookieParser());

app.use(bodyParser.json());

routeApiVer1(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});