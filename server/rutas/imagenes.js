const express = require('express');
const fs = require('fs');
const path = require('path');
let app = express();
const { verificarTokenImg } = require('../middlewares/autenticacion');
const log = require('../services/apilogger');

app.get('/imagen/:tipo/:img', verificarTokenImg, (req, res) => {
    log.logger.info(`{"verb":"${req.method}", "path":"${req.baseUrl + req.path}", "params":"${JSON.stringify(req.params)}", "query":"${JSON.stringify(req.query)}"`);
    let tipo = req.params.tipo;
    let img = req.params.img;
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        let pathNoimg = path.resolve(__dirname, '../assets/original.jpg');
        res.sendFile(pathNoimg);
    }
});

module.exports = app;