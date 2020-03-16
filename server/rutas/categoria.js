const express = require('express');
const app = express();
const Categoria = require('../models/categoria');
const { verificarToken, verificarRole } = require('../middlewares/autenticacion');

app.get('/categoria', verificarToken, async(req, res) => {
    try {
        categorias = await Categoria.find({}).sort('descripcion').populate('usuario', 'nombre email').exec();
        res.json({
            ok: true,
            categorias
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.get('/categoria/:id', verificarToken, async(req, res) => {
    try {
        let id = req.params.id;
        categoriaDB = await Categoria.findById(id).populate('usuario', 'nombre email').exec();
        if (!categoriaDB) {
            return res.status(404).json({
                ok: false,
                message: "La categoria no existe"
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.post('/categoria', verificarToken, async(req, res) => {
    try {
        let body = req.body;
        let categoria = new Categoria({
            descripcion: body.descripcion,
            usuario: req.usuario._id
        });
        categoriaDB = await categoria.save();
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.put('/categoria/:id', verificarToken, async(req, res) => {
    try {
        let id = req.params.id;
        let body = req.body;
        categoriaDB = await Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!categoriaDB) {
            return res.status(404).json({
                ok: false,
                message: 'La categoria no existe'
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});

app.delete('/categoria/:id', [verificarToken, verificarRole], async(req, res) => {
    try {
        let id = req.params.id;
        categoriaBorrada = await Categoria.findByIdAndRemove(id, { new: true });
        if (!categoriaBorrada) {
            return res.status(404).json({
                ok: false,
                message: 'La categoria no existe'
            });
        }
        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error
        });
    }
});

module.exports = app;