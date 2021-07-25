import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsersService } from '../../auth/Services/users.service';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {

    userLoggued = null;

    private userLogguedSubscription: Subscription = null;

    constructor(private userService: UsersService) {
        this.userLogguedSubscription = this.userService.obsUserLoggued.subscribe(
            res => {
                this.userLoggued = res;
            },
            err => {
                this.userLoggued = null;
            }
        )
    }

    ngOnDestroy(){
        if (this.userLogguedSubscription) this.userLogguedSubscription.unsubscribe();
    }

}
