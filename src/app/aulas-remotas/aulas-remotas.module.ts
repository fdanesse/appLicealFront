import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';
import { AulasRemotasRoutingModule } from './aulas-remotas-routing.module';

import { AulasRemotasSocket } from './services/AulasRemotasSocket.service';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AulaComponent } from './Views/aula/aula.component';

const config: SocketIoConfig = {
    url: 'https://lit-fortress-19290.herokuapp.com',
    options: {
        withCredentials: false,
        rememberUpgrade:true,
        transports: ['websocket'],
        secure:true, 
        rejectUnauthorized: false
    }}
//options corrige => Access to XMLHttpRequest at 'http://localhost:8080/socket.io/?EIO=3&transport=polling&t=Nhk9XQr' from origin 'http://localhost:4200' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.


@NgModule({
    declarations: [
        AulasRemotasComponent,
        AulaComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AulasRemotasRoutingModule,
        SocketIoModule.forRoot(config),
    ],
    providers: [AulasRemotasSocket], //AuthGuard
})
export class AulasRemotasModule { }
