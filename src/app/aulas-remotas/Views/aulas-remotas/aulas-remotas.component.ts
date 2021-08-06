import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AulasRemotasSocket } from '../../services/AulasRemotasSocket.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
    selector: 'app-aulas-remotas',
    templateUrl: './aulas-remotas.component.html',
    styleUrls: ['./aulas-remotas.component.css']
})
export class AulasRemotasComponent implements OnInit {
  
    public classRoomForm: FormGroup;

    constructor(private aulasSocketService: AulasRemotasSocket, public router: Router) { 
    }

    ngOnInit() {
        this.settingFormControls();
    }

    settingFormControls() {
        this.classRoomForm = new FormGroup({
            aula: new FormControl('', [Validators.required]),
        });
    }

    onSubmit() {
        if (this.classRoomForm.valid) {
            const { aula } = this.classRoomForm.value;
            this.router.navigateByUrl('/aulasRemotas/aula/' + aula);
            // [routerLink]="['/auth/perfil', userLoggued._id]"
        }
    }

}
