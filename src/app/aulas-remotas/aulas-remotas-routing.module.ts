import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';
import { AulaComponent } from './Views/aula/aula.component';
import { AuthGuard } from '../auth/guards/auth.guard';


const routes: Routes = [
    { path: '', component: AulasRemotasComponent, canActivate: [AuthGuard] },
    { path: 'aulasRemotas', component: AulasRemotasComponent, canActivate: [AuthGuard] },
    { path: 'aula/:aula/:id', component: AulaComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AulasRemotasRoutingModule { }
