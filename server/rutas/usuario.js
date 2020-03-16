const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();
const Usuario = require('../models/usuario');
const { verificarToken, verificarRole } = require('../middlewares/autenticacion');

app.get('/usuario', verificarToken, async(req, res) => {
    try {
        let desde = req.query.desde || 0;
        desde = Number(desde);
        let limite = req.query.limite || 5;
        limite = Number(limite);
        let usuarios = await Usuario.find({ estado: true }, 'nombre email role estado google img').skip(desde).limit(limite).exec()
        let conteo = await Usuario.count({ estado: true });
        res.json({
            ok: true,
            usuarios,
            cuantos: conteo
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            error
        });
    }
});

app.post('/usuario', [verificarToken, verificarRole], async(req, res) => {
    try {
        let body = req.body;
        let usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            role: body.role
        });
        let usuarioDB = await usuario.save();
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            error
        });
    }
});

app.put('/usuario/:id', [verificarToken, verificarRole], async(req, res) => {
    try {
        let id = req.params.id;
        let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
        usuarioDB = await Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            error
        });
    }
});

app.delete('/usuario/:id', [verificarToken, verificarRole], async(req, res) => {
    try {
        let id = req.params.id;
        let cambiaEstado = {
            estado: false
        };
        usuarioBorrado = await Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true });
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            error
        });
    }
});

module.exports = app;