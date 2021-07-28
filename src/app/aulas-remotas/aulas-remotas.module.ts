import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';
import { AulasRemotasRoutingModule } from './aulas-remotas-routing.module';

import { SocketService } from './services/Socket.service';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = {
    url: 'http://localhost:8080',
    options: {
        withCredentials: false,
        rememberUpgrade:true,
        transports: ['websocket'],
        secure:true, 
        rejectUnauthorized: false
    }}

@NgModule({
    declarations: [
        AulasRemotasComponent],
    imports: [
        CommonModule,
        AulasRemotasRoutingModule,
        SocketIoModule.forRoot(config),
    ],
    providers: [SocketService], //AuthGuard
})
export class AulasRemotasModule { }
