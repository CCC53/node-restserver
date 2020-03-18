const express = require('express');
const { verificarToken } = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');
const log = require('../services/apilogger');

app.get('/producto', verificarToken, async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "query":"${JSON.stringify(req.query)}", "user":"${req.usuario._id}"}`);
        let desde = req.query.desde || 0;
        desde = Number(desde);
        let limite = req.query.limite || 5;
        limite = Number(limite);
        let categorias = await Producto.find({ disponible: true }).skip(desde).limit(limite).populate('usuario categoria', 'nombre email nombre').exec();
        res.json({
            ok: true,
            categorias,
        });
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "query":"${JSON.stringify(req.query)}", "user":"${req.usuario._id}"}, error: "${error}"`);
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.get('/producto/:id', verificarToken, async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "user":"${req.usuario._id}"}`);
        let id = req.params.id;
        let productoDB = await Producto.findById(id).populate('usuario categoria', 'nombre email descripcion').exec();
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'Producto no encontrado'
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "user":"${req.usuario._id}"}, error: "${error}"`);
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.get('/producto/buscar/:termino', verificarToken, async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "user":"${req.usuario._id}"}`);
        let termino = req.params.termino;
        let regex = new RegExp(termino, 'i');
        let productos = await Producto.find({ nombre: regex }).populate('categoria', 'descripcion').exec();
        res.json({
            ok: true,
            productos
        });
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "user":"${req.usuario._id}"}, error: "${error}"`);
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.post('/producto', verificarToken, async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "body":"${JSON.stringify(req.body)}", "user":"${req.usuario._id}"}`);
        let body = req.body
        let producto = new Producto({
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: body.disponible,
            categoria: body.categoria,
            usuario: req.usuario._id
        });
        let productoDB = await producto.save();
        res.json({
            ok: true,
            producto: productoDB
        });
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "body":"${JSON.stringify(req.body)}", "user":"${req.usuario._id}", error: "${error}"}`);
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.put('/producto/:id', verificarToken, async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}" ,"body":"${JSON.stringify(req.body)}", "user":"${req.usuario._id}"}`);
        let id = req.params.id;
        let body = req.body;
        let productoDB = await Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}" ,"body":"${JSON.stringify(req.body)}", "user":"${req.usuario._id}"}, error: "${error}"`);
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.delete('/producto/:id', verificarToken, async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "user":"${req.usuario._id}"}`);
        let id = req.params.id;
        let deshabilitar = {
            disponible: false
        };
        let productoBorrado = await Producto.findByIdAndUpdate(id, deshabilitar, { new: true, runValidators: true });
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no fue encontrado'
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado,
            mensaje: 'El producto ha sido borrado'
        });
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "user":"${req.usuario._id}", error: "${error}"}`);
        res.status(500).json({
            ok: false,
            error
        });
    }
});

module.exports = app;