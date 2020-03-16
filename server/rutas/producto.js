const express = require('express');
const { verificarToken } = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');

app.get('/producto', async(req, res) => {
    try {
        let desde = req.query.desde || 0;
        desde = Number(desde);
        let limite = req.query.limite || 5;
        limite = Number(limite);
        let categorias = await Producto.find({ disponible: true }).skip(desde).limit(limite).populate('usuario categoria', 'nombre email nombre').exec();
        let conteo = await Producto.count({ disponible: true });
        res.json({
            ok: true,
            categorias,
            conteo
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.get('/producto/:id', async(req, res) => {
    try {
        let id = req.params.id;
        let productoDB = await Producto.findById(id).populate('usuario categoria', 'nombre email descripcion').exec();
        if (!productoDB) {
            return res.status(404).json({
                ok: false,
                message: 'Producto no encontrado'
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.get('/producto/buscar/:termino', verificarToken, async(req, res) => {
    try {
        let termino = req.params.termino;
        let regex = new RegExp(termino, 'i');
        let productos = await Producto.find({ nombre: regex }).populate('categoria', 'descripcion').exec();
        res.json({
            ok: true,
            productos
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});




app.post('/producto', verificarToken, async(req, res) => {
    try {
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
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.put('/producto/:id', verificarToken, async(req, res) => {
    try {
        let id = req.params.id;
        let body = req.body;
        let productoDB = await Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!productoDB) {
            return res.status(404).json({
                ok: false,
                message: 'El producto no existe'
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.delete('/producto/:id', async(req, res) => {
    try {
        let id = req.params.id;
        let deshabilitar = {
            disponible: false
        };
        let productoBorrado = await Producto.findByIdAndUpdate(id, deshabilitar, { new: true, runValidators: true });
        if (!productoBorrado) {
            return res.status(404).json({
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
        res.status(500).json({
            ok: false,
            error
        });
    }
});

module.exports = app;