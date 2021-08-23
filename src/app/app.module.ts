import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";

// https://www.npmjs.com/package/@fortawesome/angular-fontawesome
// https://github.com/FortAwesome/angular-fontawesome/blob/HEAD/docs/usage/icon-library.md#using-the-icon-library
// https://github.com/FortAwesome/angular-fontawesome/blob/HEAD/docs/usage/features.md
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Views/home/home.component';

import { UsersService } from './auth/Services/users.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { NoauthGuard } from './auth/guards/noauth.guard';


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
        
    ],
    providers: [UsersService, AuthGuard, NoauthGuard],
    bootstrap: [AppComponent]
})
export class AppModule { }
