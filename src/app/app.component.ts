import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UsersService } from './auth/Services/users.service';

// https://www.npmjs.com/package/@fortawesome/angular-fontawesome
import { faHome, faUserPlus, faKey, faSignOutAlt, faUserEdit } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnDestroy {
    title = 'AngularBase';

    registroIcon = faUserPlus;
    homeIcon = faHome;
    perfilIcon = faUserEdit;
    keyIcon = faKey;
    salirIcon = faSignOutAlt;

    token = '';
    userLoggued = null;

    private tokenSubscription: Subscription = null;
    private userLogguedSubscription: Subscription = null;

    constructor(private userService: UsersService, private router: Router){
        this.tokenSubscription = this.userService.obsToken.subscribe(
            res => {
                this.token = res;
            },
            err => {
                this.token = '';
            }
        )

        this.userLogguedSubscription = this.userService.obsUserLoggued.subscribe(
            res => {
                this.userLoggued = res;
                //console.log(this.userLoggued);
            },
            err => {
                this.userLoggued = null;
            }
        )
    }

    toggleNavBar () {
        // hack para que se cierre el navbar
        let element: HTMLElement = document.getElementsByClassName( 'navbar-toggler' )[ 0 ] as HTMLElement;
        if ( element.getAttribute( 'aria-expanded' ) == 'true' ) {
            element.click();
        }
    }

    salir(){
        this.userService.logout(); 
        this.router.navigateByUrl('/');
    }

    ngOnDestroy(){
        if (this.tokenSubscription) this.tokenSubscription.unsubscribe();
        if (this.userLogguedSubscription) this.userLogguedSubscription.unsubscribe();
    }
}
