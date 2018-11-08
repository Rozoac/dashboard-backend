var express = require("express");
var app = express();
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var mdAutenticacion = require("../middlewares/autenticacion");

// =============================
// OBTENER HOSPITAL CON SUS MEDICOS
// =============================

app.get("/:id", (req, res, next) => {
  var id = req.params.id;
  Medico.find({ hospital: id })
    .exec((err, HospitalRespuesta) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando hospitales",
          error: err
        });
      }
      Hospital.findById(id).exec((err, Hospital2) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error cargando hospitales",
            error: err
          });
        }
        res.status(200).json({ Hospital: Hospital2.nombre, Medicos: HospitalRespuesta });
      });
    });
});
// =============================
// OBTENER TODOS LOS HOSPITALES
// =============================

app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando hospitales",
          error: err
        });
      }
      Hospital.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total: conteo
        });
      });
    });
});

// =============================
// ACTUALIZAR HOSPITAL
// =============================

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        error: err
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: "El hospital con el id" + id + "no existe",
        error: "No existe un hospital con ese ID"
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          error: err
        });
      }

      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });
  });
});

// =============================
// Crear un hospital nuevo
// =============================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  // mdAutenticacion.verificaToken
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear un hospital",
        error: err
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });
  });
});

// =============================
// borrar un hospital
// =============================

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al borrar un hospital",
        error: err
      });
    }

    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "El hospital con el id" + id + "no existe",
        error: "No existe un hospital con ese ID"
      });
    }

    res.status(200).json({ ok: true, hospital: hospitalBorrado });
  });
});

module.exports = app;
