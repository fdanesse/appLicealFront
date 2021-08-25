import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';
import { AulasRemotasRoutingModule } from './aulas-remotas-routing.module';

import { AulasRemotasSocket } from './services/AulasRemotasSocket.service';
import { SocketIoModule } from 'ngx-socket-io';
import { AulaComponent } from './Views/aula/aula.component';
import { VideoComponent } from './Componentes/video/video.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
    declarations: [
        AulasRemotasComponent,
        AulaComponent,
        VideoComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AulasRemotasRoutingModule,
        SocketIoModule,
        FontAwesomeModule,
    ],
    providers: [AulasRemotasSocket], //AuthGuard
})
export class AulasRemotasModule { }
