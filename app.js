// REQUIRES
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

//INICIACION DE VARIABLES
var app = express();

//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  next();
});

app.use(bodyParser.urlencoded({ expented: false }));
app.use(bodyParser.json());

//Importar rutas
var appRoutes = require("./routes/app");
var usuarioRoutes = require("./routes/usuario");
var loginRoutes = require("./routes/login");
var hospitalRoutes = require("./routes/hospital");
var medicoRoutes = require("./routes/medico");

//rutas
app.use("/usuario", usuarioRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/login", loginRoutes);
app.use("/", appRoutes);

//CONEXION A LA BASE DE DATOS
mongoose.connection.openUri(
  "mongodb://localhost:27017/mobiliaria",
  (err, res) => {
    if (err) throw err;
    console.log("Base de datos online");
  }
);

// SERVIDOR
app.listen(3000, () => {
  console.log("SERVIDOR ARRIBA EN EL PUERTO 3000");
});
