import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
//import { HttpClientModule } from "@angular/common/http";

import { PerfilComponent } from './Views/perfil/perfil.component';
import { LoginComponent } from './Views/login/login.component';
import { RegistroComponent } from './Views/registro/registro.component';

import { AuthRoutingModule } from './auth-routing.module';
//import { UsersService } from './Services/users.service';
//import { AuthGuard } from './guards/auth.guard';
//import { NoauthGuard } from './guards/noauth.guard';


@NgModule({
    declarations: [
        PerfilComponent,
        LoginComponent,
        RegistroComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        //HttpClientModule,
        AuthRoutingModule
    ],
    //providers: [AuthGuard, NoauthGuard] //UsersService
})
export class AuthModule { }
