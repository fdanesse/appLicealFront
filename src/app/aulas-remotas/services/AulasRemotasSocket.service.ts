import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from "rxjs";

// https://www.npmjs.com/package/ngx-socket-io
import { Socket, SocketIoConfig } from 'ngx-socket-io';

import { UsersService } from '../../auth/Services/users.service';

const config: SocketIoConfig = {
    url: 'http://localhost:8080', //'https://lit-fortress-19290.herokuapp.com',
    options: {
        withCredentials: false,
        rememberUpgrade:true,
        transports: ['websocket'],
        secure:true, 
        rejectUnauthorized: false
    }}
//options corrige => Access to XMLHttpRequest at 'http://localhost:8080/socket.io/?EIO=3&transport=polling&t=Nhk9XQr' from origin 'http://localhost:4200' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.


@Injectable({ providedIn: 'root' })
export class AulasRemotasSocket extends Socket{

    token = '';
    userLoggued = null;

    private tokenSubscription: Subscription = null;
    private userLogguedSubscription: Subscription = null;

    private obsNewOffer = new BehaviorSubject(null);
    public newOffer = this.obsNewOffer.asObservable();

    private obsNewCandidate = new BehaviorSubject(null);
    public newCandidate = this.obsNewCandidate.asObservable();

    private obsNewRespuesta = new BehaviorSubject(null);
    public newRespuesta = this.obsNewRespuesta.asObservable();

    constructor(private userService: UsersService) {
        super(config);

        // FIXME: Resolver el uso del token y usuario logueado
        this.tokenSubscription = this.userService.obsToken.subscribe(
            res => {
                this.token = res;
            },
            err => {
                this.token = '';
            });

        this.userLogguedSubscription = this.userService.obsUserLoggued.subscribe(
            res => {
                this.userLoggued = res;
            },
            err => {
                this.userLoggued = null;
            });

        this.processEvents();
    }

    processEvents(){
        this.on('connect', () => {
            // FIXME: que no se envie nada antes de que esto se ejecute.
            console.log('Socket conectado');
        });

        this.on("disconnect", (reason) => {
            // FIXME: Resolver desconexión de socket local
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
        if (this.tokenSubscription) this.tokenSubscription.unsubscribe();
        if (this.userLogguedSubscription) this.userLogguedSubscription.unsubscribe();
    }

}