//Configuracion global del puerto de la aplicacion
process.env.PORT = process.env.PORT || 3000;


//Configuracion del entorno de la aplicacion
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//Vencimiento o caducidad del token
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//SEED de autenticacion
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';


//Configuracion de la base de datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URL;
}

process.env.URLDB = urlDB;

//Client ID
process.env.CLIENT_ID = process.env.CLIENT_ID || '130572075357-qjammse9g1dsnevufgbdclkfvh3n32qh.apps.googleusercontent.com';