//Configuracion global del puerto de la aplicacion
process.env.PORT = process.env.PORT || 3000;


//Configuracion del entorno de la aplicacion
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//Configuracion de la base de datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://unforgiven964:QaEs0TmfQWVbdwpv@cluster0-5epze.mongodb.net/cafe';
}

process.env.URLDB = urlDB;