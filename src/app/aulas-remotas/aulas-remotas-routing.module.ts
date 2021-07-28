import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';


const routes: Routes = [
    { path: '', component: AulasRemotasComponent },
    { path: 'aulasRemotas', component: AulasRemotasComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AulasRemotasRoutingModule { }
