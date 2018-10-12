var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");

var app = express();

app.use(fileUpload());

var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //tipos de colecciom
  var tiposValidos = ["hospitales", "medicos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de coelccion no es valida",
      error: {
        mensaje: "seleccione un tipo valido"
      }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No seleciono una imagen",
      error: {
        mensaje: "Debe seleccionar una imagen"
      }
    });
  }
  // Obtener el nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // TIPOS DE EXTENSIONES
  var extensionesValidas = ["png", "jpg", "jpeg"];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no valida",
      error: {
        mensaje: "Las extensiones validas son " + extensionesValidas.join(", ")
      }
    });
  }

  //Nombre de archivo personalizada
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //mover archivo
  var path = `./uploads/${tipo}/${nombreArchivo}`;
  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover el archivo",
        error: err
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuario) => {
      if (!usuario) {
        return res.status(400).json({
          ok: true,
          mensaje: "Usuario no existe",
          error: { mensaje: "Usuario no existe" }
        });
      }

      var pathViejo = "./uploads/usuarios/" + usuario.img;
      // si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      usuario.img = nombreArchivo;
      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = ":) .!.";
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          usuario: usuarioActualizado
        });
      });
    });
  }
  if (tipo === "medicos") {
    Medico.findById(id, (err, medico) => {
      if (!medico) {
        return res.status(400).json({
          ok: true,
          mensaje: "medico no existe",
          error: { mensaje: "medico no existe" }
        });
      }

      var pathViejo = "./uploads/medicos/" + medico.img;
      // si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      medico.img = nombreArchivo;
      medico.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de medico actualizada",
          medico: medicoActualizado
        });
      });
    });
  }
  if (tipo === "hospitales") {
    Hospital.findById(id, (err, hospital) => {
      if (!hospital) {
        return res.status(400).json({
          ok: true,
          mensaje: "hospital no existe",
          error: { mensaje: "hospital no existe" }
        });
      }
      var pathViejo = "./uploads/hositales/" + hospital.img;
      // si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      hospital.img = nombreArchivo;
      hospital.save((err, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de hospital actualizada",
          usuario: hospitalActualizado
        });
      });
    });
  }
}

module.exports = app;
