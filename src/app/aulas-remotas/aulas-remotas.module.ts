import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';
import { AulasRemotasRoutingModule } from './aulas-remotas-routing.module';

import { AulasRemotasSocket } from './services/AulasRemotasSocket.service';
import { SocketIoModule } from 'ngx-socket-io';
import { AulaComponent } from './Views/aula/aula.component';


@NgModule({
    declarations: [
        AulasRemotasComponent,
        AulaComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AulasRemotasRoutingModule,
        SocketIoModule,
    ],
    providers: [AulasRemotasSocket], //AuthGuard
})
export class AulasRemotasModule { }
