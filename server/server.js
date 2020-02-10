require('./config/config');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(require('./rutas/usuario'));

mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (error, res) => {
    if (error) {
        throw error;
    } else {
        console.log('Base de datos ONLINE');
    }
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando peticiones en el puerto:', process.env.PORT);
});