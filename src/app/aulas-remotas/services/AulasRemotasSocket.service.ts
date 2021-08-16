import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

// https://www.npmjs.com/package/ngx-socket-io
import { Socket, SocketIoConfig } from 'ngx-socket-io';


const config: SocketIoConfig = {
    url: 'http://localhost:8080', //'https://lit-fortress-19290.herokuapp.com',
    //options corrige => Access to XMLHttpRequest at 'http://localhost:8080/socket.io/?EIO=3&transport=polling&t=Nhk9XQr' from origin 'http://localhost:4200' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
    options: {
        withCredentials: false,
        rememberUpgrade:true,
        transports: ['websocket'],
        secure:true, 
        rejectUnauthorized: false,
        query: {
            token: localStorage.getItem("Authorization")
        },
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

    constructor() {
        super(config);

        this.processEvents();
    }

    processEvents(){
        this.on('connect', () => {
            // FIXME: La interfaz no debe permitir crear ni conectarse a un aula hasta que se reciba este mensaje
            console.log('Socket conectado');
        });

        this.on("disconnect", (reason) => {
            // Conexión rechazada
            console.log('Socket desconectado:', reason);
        });

        this.on("connect_error", (error) => {
            // FIXME: Resolver este error de conexión
            console.log('Socket error de conexión:', error);
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

        // FIXME: Completar tarea
        this.on("desconectado", (socketId) => {
            console.log('Usuario desconectado', socketId);
        });

    }

    public enviarRespuesta(localDescription){
        this.emit('respuesta', localDescription);
    }

    public enviarOferta(aula, localDescription){
        this.emit('oferta', {'aula': aula, 'sdp': localDescription});
    }

    public enviarCandidato(candidato){
        this.emit('candidato', candidato);
    }

    ngOnDestroy(){
    }

}