import { Injectable } from '@angular/core';

// https://www.npmjs.com/package/ngx-socket-io
import { Socket } from 'ngx-socket-io';


@Injectable({ providedIn: 'root' })
export class AulasRemotasSocket {

    private aula: string;
    private usuarios = {};


    constructor(private socket: Socket) {
        this.processEvents();
    }

    processEvents(){
        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on("disconnect", (reason) => {
            console.log('Socket disconnect:', reason);
        });

        this.socket.on("connect_error", (error) => {
            console.log('Socket connection error:', error);
        });
    }

    public sendToServer(msg: string, obj: Object){
        this.socket.emit(msg, obj);
    }

}