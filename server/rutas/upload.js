const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
const log = require('../services/apilogger');

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}"`);
        let tipo = req.params.tipo;
        let id = req.params.id;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'No se cargó ningun archivo'
                }
            });
        }
        //Validar el tipo
        let tiposValidos = ['productos', 'usuarios'];
        if (tiposValidos.indexOf(tipo) < 0) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Los tipos validos son ' + tiposValidos.join(', '),
                    tipo
                }
            });
        }
        let archivo = req.files.archivo;
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];
        //Extensiones validas
        let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
        if (extensionesValidas.indexOf(extension) < 0) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                    extension
                }
            });
        }
        //Cambiar el nombre del archivo
        let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
        let archivo2 = await archivo.mv(`uploads/${tipo}/${nombreArchivo}`);
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    } catch (error) {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "error":"${error}"`);
        res.status(500).json({
            ok: false,
            error
        });
    }
});

async function imagenUsuario(id, res, nombreArchivo) {
    try {
        let usuarioDB = await Usuario.findById(id);
        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El usuario no existe'
                }
            });
        }
        borrarArchivo(usuarioDB.img, 'usuarios');
        usuarioDB.img = nombreArchivo
        let usuarioGuardado = await usuarioDB.save()
        res.json({
            ok: true,
            usuario: usuarioGuardado,
            img: nombreArchivo
        });
    } catch (error) {
        borrarArchivo(nombreArchivo, 'usuarios');
        return res.status(500).json({
            ok: false,
            error
        });
    }
}

async function imagenProducto(id, res, nombreArchivo) {
    try {
        let productoDB = await Producto.findById(id);
        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El producto no existe'
                }
            });
        }
        borrarArchivo(productoDB.img, 'productos');
        productoDB.img = nombreArchivo;
        let productoActualizado = await productoDB.save();
        res.json({
            ok: true,
            producto: productoActualizado,
            img: nombreArchivo
        });
    } catch (error) {
        borrarArchivo(nombreArchivo, 'productos');
        return res.status(500).json({
            ok: false,
            error
        });
    }
}

function borrarArchivo(nombreArchivo, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;