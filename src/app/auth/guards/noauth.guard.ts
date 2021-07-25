import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsersService } from '../Services/users.service';


@Injectable({
    providedIn: 'root'
})
export class NoauthGuard implements CanActivate {

    constructor(private router: Router, private userService: UsersService){
    }

    canActivate(){
        let token = this.userService.getToken();
        if(token){
            //window.alert('Ya estás logueado.');
            this.router.navigate(['/home']);
            return false;
        }else{
            return true;
        }
    }
  
}