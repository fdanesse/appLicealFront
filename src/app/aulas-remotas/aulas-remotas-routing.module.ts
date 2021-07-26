import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';


const routes: Routes = [
    { path: '', component: AulasRemotasComponent },
    { path: 'aulasRemotas', component: AulasRemotasComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)], //https://medium.com/@HenryGBC/c%C3%B3mo-implementar-lazy-loading-en-angular-74b6e85d021f
    exports: [RouterModule]
})

export class AulasRemotasRoutingModule { }
