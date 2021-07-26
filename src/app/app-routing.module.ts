import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './Views/home/home.component';


const routes: Routes = [
    { path: '', component: HomeComponent },
    
    { path: 'auth', loadChildren: () => import('./auth/auth.module').then(mod => mod.AuthModule) },
    { path: 'aulasRemotas', loadChildren: () => import('./aulas-remotas/aulas-remotas.module').then(mod => mod.AulasRemotasModule) },

    { path: '**', component: HomeComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)], // RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    exports: [RouterModule]
})
export class AppRoutingModule { }
