import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsersService } from '../Services/users.service';


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private userService: UsersService){
    }

    canActivate(){
        let token = this.userService.getToken();
        if(token){
            return true;
        }else{
            //window.alert('No puedes acceder a esta área sin loguearte.');
            this.router.navigate(['/home']);
            return false;
        }
    }
  
}
