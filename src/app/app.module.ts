import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // https://www.npmjs.com/package/@fortawesome/angular-fontawesome

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Views/home/home.component';

import { UsersService } from './auth/Services/users.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { NoauthGuard } from './auth/guards/noauth.guard';

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
        AppComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FontAwesomeModule,
        SocketIoModule.forRoot(config),
    ],
    providers: [UsersService, AuthGuard, NoauthGuard],
    bootstrap: [AppComponent]
})
export class AppModule { }
