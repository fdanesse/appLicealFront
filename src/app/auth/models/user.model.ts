export class Usuario {
    _id; 
    nombre; 
    apellido; 
    usuario; 
    clave; 
    cedula; 
    celular; 
    email; 
    foto; 
    rol;
    
    constructor (user){
        this._id = user._id;
        this.nombre = user.nombre; 
        this.apellido = user.apellido; 
        this.usuario = user.usuario; 
        this.clave = user.clave; 
        this.cedula = user.cedula; 
        this.celular = user.celular; 
        this.email = user.email; 
        this.foto = user.foto; 
        this.rol = user.rol; 
    }
}