const jwt = require('jsonwebtoken');

//Verificar Token
let verificarToken = (req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                ok: false,
                error
            })
        }
        req.usuario = decoded.usuario;
        next();
    })
}

//Verificar AdminRole
let verificarRole = (req, res, next) => {
    let usuario = req.usuario
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            message: 'El usuario no es un administrador'
        });
    }
}

module.exports = {
    verificarToken,
    verificarRole
}