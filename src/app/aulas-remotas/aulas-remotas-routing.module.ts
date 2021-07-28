import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';
import { AuthGuard } from '../auth/guards/auth.guard';


const routes: Routes = [
    { path: '', component: AulasRemotasComponent, canActivate: [AuthGuard] },
    { path: 'aulasRemotas', component: AulasRemotasComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AulasRemotasRoutingModule { }
