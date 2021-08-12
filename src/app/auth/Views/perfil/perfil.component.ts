import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

//import { passwordValidator } from "../registro/passwordValidator";

import { UsersService } from '../../Services/users.service';

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit, OnDestroy {

    public registroForm: FormGroup;
    public err: String = "";
    private subs: Subscription = null;

    private localvideo = undefined;
    private canvas = undefined;
    private stream = undefined;
    public userPerfil = undefined;

    public token = '';

    private tokenSubscription: Subscription = null;
    private userSubscription: Subscription = null;

    constructor(private userService: UsersService, public router: Router, private _route: ActivatedRoute) {
        this.tokenSubscription = this.userService.obsToken.subscribe(
            res => {this.token = res;},
            err => {this.token = '';}
        )
    }

    ngOnInit() {
        this.settingFormControls();
        
        this.canvas = document.getElementById('canvas');
        this.localvideo = document.getElementById('localVideo');
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: {width:200, height: 200}, audio: false})
            .then(stream => {
                this.stream = stream;
                this.localvideo.srcObject = stream;
            })
            .catch(err => {window.alert("Se necesita una cámara para tomar la fotografía");});
        }else {window.alert("Se necesita una cámara para tomar la fotografía");}

        this.userSubscription = this.userService.getPerfil(this._route.snapshot.paramMap.get('_id')).subscribe(
            res => {
                this.userPerfil = res.user;
                this.loadData();
            },
            err => {
                window.alert(`${err.statusText}`);
                this.router.navigateByUrl('/');
            }
        );
    }

    ngOnDestroy(){
        if (this.subs) {this.subs.unsubscribe();}
        if (this.userSubscription) {this.userSubscription.unsubscribe();}
        if (this.tokenSubscription) {this.tokenSubscription.unsubscribe();}
        this.stream.getAudioTracks().forEach(track => {track.stop();});
        this.stream.getVideoTracks().forEach(track => {track.stop();});
        this.stream = null;
    }

    loadData() {
        let data = this.userPerfil.foto // this.canvas.toDataURL('image/png');
        this.registroForm.controls['foto'].setValue(this.userPerfil.foto);

        this.canvas.setAttribute('width', this.localvideo.videoWidth);
        this.canvas.setAttribute('height', this.localvideo.videoHeight);

        // FIXME: Usualmente no se dibuja la imagen
        let context = this.canvas.getContext("2d")
        let imagen = new Image();
        imagen.src = data;
        context.drawImage(imagen, 0, 0, this.localvideo.videoWidth, this.localvideo.videoHeight);
        
        this.registroForm.controls['nombre'].setValue(this.userPerfil.nombre);
        this.registroForm.controls['apellido'].setValue(this.userPerfil.apellido);
        this.registroForm.controls['cedula'].setValue(this.userPerfil.cedula);
        this.registroForm.controls['email'].setValue(this.userPerfil.email);
        this.registroForm.controls['celular'].setValue(this.userPerfil.celular);
        this.registroForm.controls['usuario'].setValue(this.userPerfil.usuario);
        //this.registroForm.controls['clave'].setValue(this.userPerfil.clave);
        //this.registroForm.controls['claveR'].setValue(this.userPerfil.claveR);
    }

    settingFormControls(): void {
        const names_pattern = '^[a-zA-ZÁ-Úá-ú]{2,15}( ?[a-zA-ZÁ-Úá-ú]{1,15})*[a-zA-ZÁ-Úá-ú]+$';
        const telefonos_pattern = '^[0-9]{9}$';
        const cedula_pattern = '^[0-9]{8}$';
        const email_pattern = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';
        const password_perfil_pattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{0,16}';
        const userName_pattern = '^[a-zA-Z0-9_-]{4,18}$';

        this.registroForm = new FormGroup({
            nombre: new FormControl('', [
                Validators.pattern(names_pattern)]),
            apellido: new FormControl('', [
                Validators.pattern(names_pattern)]),
            cedula: new FormControl('', [
                Validators.pattern(cedula_pattern)]),
            email: new FormControl('', [
                Validators.pattern(email_pattern)]),
            celular: new FormControl('', [
                Validators.pattern(telefonos_pattern)]),
            usuario: new FormControl('', [
                Validators.pattern(userName_pattern)]),
            //clave: new FormControl('', [
            //    Validators.pattern(password_perfil_pattern)]),
            //claveR: new FormControl('', [
            //    Validators.pattern(password_perfil_pattern)]),
            clave: new FormControl({value: '', disabled: true}),
            claveR: new FormControl({value: '', disabled: true}),
            foto: new FormControl('', [
                Validators.required])
            }, );//{ validators: passwordValidator });
    }

    onSubmit(): void {
        if (this.registroForm.valid) {
            
            let data = JSON.parse(JSON.stringify(this.registroForm.value));
            let envio = {};

            let Pkeys = Object.keys(this.userPerfil);
            Object.keys(data).forEach(key => {
                if (Pkeys.includes(key)){
                    if (this.userPerfil[key] != data[key]) {
                        envio[key] = data[key]
                    }
                }
            });
                    
            this.subs = this.userService.actualizar(this.userPerfil._id, envio).subscribe(
                res => {
                    this.err = "";
                    window.alert("Perfil actualizado.");
                    this.userPerfil = res.user;
                    this.loadData();
                },
                err => {
                    this.err = err.statusText;
                    if (this.err === "Unknown Error"){
                        window.alert("Actualización incorrecta. Error en el Servidor.");
                    }else{
                        window.alert(`Actualización incorrecta ${err.statusText}`);}
            });
        }
    }

    public capture(): void {
        this.canvas.setAttribute('width', 200);
        this.canvas.setAttribute('height', 200);

        this.canvas.setAttribute('width', this.localvideo.videoWidth);
        this.canvas.setAttribute('height', this.localvideo.videoHeight);

        let context = this.canvas.getContext("2d")

        this.localvideo.pause();
        context.drawImage(this.localvideo, 0, 0, this.localvideo.videoWidth, this.localvideo.videoHeight);
        this.localvideo.play();

        let data = this.canvas.toDataURL('image/png');
        this.registroForm.controls['foto'].setValue(data);
    }

    public delete(): void {
        this.subs = this.userService.delete(this.userPerfil._id).subscribe(
            res => {
                this.router.navigateByUrl('/');
            },
            err => {
                console.log(err);
                window.alert(`Delete incorrecto ${err.statusText}`);}
        );
    }
}
