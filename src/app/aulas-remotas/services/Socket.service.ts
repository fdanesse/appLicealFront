import { Injectable } from '@angular/core';

// https://www.npmjs.com/package/ngx-socket-io
import { Socket } from 'ngx-socket-io';


@Injectable({ providedIn: 'root' })
export class SocketService {
    constructor(private socket: Socket) {
    }
}