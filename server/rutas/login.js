const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const Usuario = require('../models/usuario');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const { check, validationResult, matchedData } = require('express-validator');
const log = require('../services/apilogger');

app.post('/login', [check('email').exists().withMessage('El email es obligatorio').isEmail().withMessage('Email invalido'),
    check('password').exists().withMessage('La contraseña es obligatoria')
], async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "body":"${JSON.stringify(req.body)}"`);
        let body = req.body;
        let usuarioDB = await Usuario.findOne({ email: body.email });
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "body":"${JSON.stringify(req.body)}, error: "${error}""`);
        return res.status(500).json({
            ok: false,
            error
        });
    }
});

//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        ok: true
    }
}

app.post('/google', async(req, res) => {
    try {
        log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "body":"${JSON.stringify(req.body)}"`);
        let token = req.body.idtoken;
        let googleUser = await verify(token).catch(error => {
            return res.status(403).json({
                ok: false,
                error
            });
        });
        let usuarioDB = await Usuario.findOne({ email: googleUser.email });
        if (usuarioDB) {
            //Si el usuario no esta registrado con google pero ya esta registrado
            if (usuarioDB.google === false) {
                res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Debe ingresar como usuario normal'
                    }
                });
            } else {
                //Si fue registrado con google y quiere iniciar sesion
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //Si apenas se va a registrar pero con google
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            let usuarioDB = await usuario.save()
            let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
            res.json({
                ok: true,
                usuario: usuarioDB,
                token
            });
        }
    } catch (error) {
        log.logger.error(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "body":"${JSON.stringify(req.body)}", "error":"${error}"`);
        res.status(500).json({
            ok: false,
            error
        });
    }
});


module.exports = app;