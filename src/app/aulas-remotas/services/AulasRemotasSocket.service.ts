import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

// https://www.npmjs.com/package/ngx-socket-io
import { Socket, SocketIoConfig } from 'ngx-socket-io';
//import jwt_decode from "jwt-decode"; //https://www.npmjs.com/package/jwt-decode

const token = localStorage.getItem("Authorization");

const config: SocketIoConfig = {
    url: 'http://localhost:8080', //'https://lit-fortress-19290.herokuapp.com',
    //options corrige => Access to XMLHttpRequest at 'http://localhost:8080/socket.io/?EIO=3&transport=polling&t=Nhk9XQr' from origin 'http://localhost:4200' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
    options: {
        withCredentials: false,
        rememberUpgrade:true,
        transports: ['websocket'],
        secure:true, 
        rejectUnauthorized: false,
        query: {token: token},
    }
}


@Injectable({ providedIn: 'root' })
export class AulasRemotasSocket extends Socket{

    private obsNewOffer = new BehaviorSubject(null);
    public newOffer = this.obsNewOffer.asObservable();

    private obsNewCandidate = new BehaviorSubject(null);
    public newCandidate = this.obsNewCandidate.asObservable();

    private obsNewRespuesta = new BehaviorSubject(null);
    public newRespuesta = this.obsNewRespuesta.asObservable();

    private obsNewHello = new BehaviorSubject(null);
    public newHello = this.obsNewHello.asObservable();

    private obsDesconectado = new BehaviorSubject(null);
    public Desconectado = this.obsDesconectado.asObservable();

    //private userId = undefined;

    constructor() {
        super(config);
        
        //let decoded = jwt_decode(token, { header: false });
        //this.userId = decoded['id'];

        this.processEvents();
    }

    public enviarhello(aula){
        // Cuando un usuario entra a un aula saluda para que todos le envíen una oferta de conexión webRTC.
        this.emit('hello', aula);
    }

    processEvents(){
        this.on('connect', () => {
            // FIXME: La interfaz no debe permitir crear ni conectarse a un aula hasta que se reciba este mensaje
            console.log('Socket conectado');
        });

        this.on("disconnect", (reason) => {
            // FIXME: Conexión rechazada. Resolver que hacer en el Frontend
            console.log('Socket desconectado:', reason);
        });

        this.on("connect_error", (error) => {
            // FIXME: Resolver este error de conexión
            console.log('Socket error de conexión:', error);
        });
        


        this.on("hello", (conexion) => {
            this.obsNewHello.next(conexion);
        });
        
        this.on("oferta", (data) => {
            this.obsNewOffer.next(data);
        });

        this.on("respuesta", (data) => {
            this.obsNewRespuesta.next(data);
        });

        this.on("candidato", (data) => {
            this.obsNewCandidate.next(data);
        });

        this.on("desconectado", (data) => {
            this.obsDesconectado.next(data);
        });
    }

    public enviarRespuesta(socketIdDestino, localDescription){
        this.emit('respuesta', {socketIdDestino: socketIdDestino, sdp: localDescription});
    }

    public enviarOferta(socketIdDestino, localDescription){
        this.emit('oferta', {socketIdDestino: socketIdDestino, sdp: localDescription});
    }
    
    public enviarCandidato(socketIdDestino, candidato){
        this.emit('candidato', {socketIdDestino: socketIdDestino, ice: candidato});
    }
    
    ngOnDestroy(){
    }

}