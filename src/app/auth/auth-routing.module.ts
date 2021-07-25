import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { NoauthGuard } from './guards/noauth.guard';

import { LoginComponent } from './Views/login/login.component';
import { PerfilComponent } from './Views/perfil/perfil.component';
import { RegistroComponent } from './Views/registro/registro.component';


const routes: Routes = [
    { path: '', component: RegistroComponent, canActivate: [NoauthGuard] },
    { path: 'login', component: LoginComponent, canActivate: [NoauthGuard] },
    { path: 'registro', component: RegistroComponent, canActivate: [NoauthGuard] },
    { path: 'perfil/:_id', component: PerfilComponent, canActivate: [AuthGuard] } //https://medium.com/@yonem9/angular-c%C3%B3mo-se-pasan-datos-entre-urls-1a9ec5d779ea
];

@NgModule({
    imports: [RouterModule.forChild(routes)], //https://medium.com/@HenryGBC/c%C3%B3mo-implementar-lazy-loading-en-angular-74b6e85d021f
    exports: [RouterModule]
})

export class AuthRoutingModule { }
