const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();
const Usuario = require('../models/usuario');
const { verificarToken, verificarRole } = require('../middlewares/autenticacion');
const { check, validationResult, matchedData } = require('express-validator');
const log = require('../services/apilogger');

app.get('/usuario', verificarToken, async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "query":"${JSON.stringify(req.query)}", "user":"${req.usuario._id}"}`);
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
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}" ,"query":"${JSON.stringify(req.query)}", "user":"${req.usuario._id}", error: "${error}"}`);
        res.status(400).json({
            ok: false,
            error
        });
    }
});

app.post('/usuario', [check('nombre').exists().withMessage('El nombre es obligatorio'),
    check('email').exists().withMessage('El email es obligatorio').isEmail().withMessage('Email invalido'),
    check('password').exists().withMessage('La contraseña es obligatoria')
], [verificarToken, verificarRole], async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}" ,"body":"${JSON.stringify(req.body)}", "user":"${req.usuario._id}"}`);
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
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}" ,"body":"${JSON.stringify(req.body)}", "user":"${req.usuario._id}"}, error: "${error}"`);
        res.status(400).json({
            ok: false,
            error
        });
    }
});

app.put('/usuario/:id', [check('nombre').exists().withMessage('El nombre es obligatorio'),
    check('email').exists().withMessage('El email es obligatorio').isEmail().withMessage('Email invalido'),
    check('password').exists().withMessage('La contraseña es obligatoria')
], [verificarToken, verificarRole], async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}" ,"body":"${JSON.stringify(req.body)}", "user":"${req.usuario._id}"}`);
        let id = req.params.id;
        let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
        usuarioDB = await Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}" ,"body":"${JSON.stringify(req.body)}", "user":"${req.usuario._id}"}, error: "${error}"`);
        res.status(400).json({
            ok: false,
            error
        });
    }
});

app.delete('/usuario/:id', [verificarToken, verificarRole], async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "user":"${req.usuario._id}"}`);
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
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "user":"${req.usuario._id}"}, error: "${error}"`);
        res.status(400).json({
            ok: false,
            error
        });
    }
});

module.exports = app;