import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from "rxjs";

// https://www.npmjs.com/package/ngx-socket-io
import { Socket } from 'ngx-socket-io';

import { UsersService } from '../../auth/Services/users.service';


@Injectable({ providedIn: 'root' })
export class AulasRemotasSocket {

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

    constructor(private socket: Socket, private userService: UsersService) {
        
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
        this.socket.on('connect', () => {
            console.log('Socket conectado');
        });

        this.socket.on("disconnect", (reason) => {
            console.log('Socket desconectado:', reason);
        });

        this.socket.on("connect_error", (error) => {
            console.log('Socket error de conexión:', error);
        });
        


        this.socket.on("oferta", (data) => {
            this.obsNewOffer.next(data);
        });

        this.socket.on("respuesta", (data) => {
            this.obsNewRespuesta.next(data);
        });

        this.socket.on("candidato", (data) => {
            this.obsNewCandidate.next(data);
        });

        // FIXME: Completar tarea
        this.socket.on("desconectado", (socketId) => {
            console.log('Usuario desconectado', socketId);
        });

    }

    public enviarRespuesta(localDescription){
        this.socket.emit('respuesta', localDescription);
    }

    public enviarOferta(aula, localDescription){
        this.socket.emit('oferta', {'aula': aula, 'sdp': localDescription});
    }

    public enviarCandidato(candidato){
        this.socket.emit('candidato', candidato);
    }

    ngOnDestroy(){
        if (this.tokenSubscription) this.tokenSubscription.unsubscribe();
        if (this.userLogguedSubscription) this.userLogguedSubscription.unsubscribe();
    }

}