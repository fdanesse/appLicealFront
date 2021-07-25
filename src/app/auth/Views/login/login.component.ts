//https://codingpotions.com/angular-login-sesion

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UsersService } from '../../Services/users.service';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

    public loginForm: FormGroup;
    public err: string = "";
    private subs: Subscription = null;

    constructor(private userService: UsersService, public router: Router) { }

    ngOnInit() {
        this.settingFormControls();
    }

    ngOnDestroy(){
        if (this.subs) this.subs.unsubscribe();
    }

    settingFormControls() {
        //https://angular.io/guide/reactive-forms
        //https://angular.io/guide/form-validation
        this.loginForm = new FormGroup({
            usuario: new FormControl('', [Validators.required]),
            clave: new FormControl('', [Validators.required])
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            const user = this.loginForm.value
            this.subs = this.userService.login(user).subscribe(
                res => {
                    this.err = "";
                    this.router.navigateByUrl('/');
                },
                err => {
                    this.err = err.statusText;
                    window.alert(`Login incorrecto ${err.statusText}`);
            });
        }
    }

}
