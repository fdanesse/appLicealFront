import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { passwordValidator } from "./passwordValidator";

import { UsersService } from '../../Services/users.service';


@Component({
    selector: 'app-registro',
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit, OnDestroy {

    public registroForm: FormGroup;
    private subs: Subscription = null;
    public err: String = "";
    private localvideo = undefined;
    private canvas = undefined;
    private stream = undefined;

    constructor(private userService: UsersService, public router: Router) { }

    ngOnInit() {
        this.settingFormControls();
        
        this.canvas = document.getElementById('canvas');
        this.localvideo = document.getElementById('localVideo');
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.getUserMedia({video: {width:200, height: 200}, audio: false},
                stream => {
                    this.stream = stream;
                    this.localvideo.srcObject = stream
                }, err => {
                    console.log("Video Error:", err)
                    window.alert("Se necesita una cámara para tomar la fotografía");
                })
        }else {window.alert("Se necesita una cámara para tomar la fotografía");}
    }

    ngOnDestroy(){
        if (this.subs) {this.subs.unsubscribe();}
        this.stream.getAudioTracks().forEach(function(track) {track.stop();});
        this.stream.getVideoTracks().forEach(function(track) {track.stop();});
        this.stream = null;
    }

    settingFormControls() {
        //https://angular.io/guide/reactive-forms
        //https://angular.io/guide/form-validation
        //https://angular.io/api/forms/Validators#pattern
        //https://ichi.pro/es/agregar-validacion-de-formulario-de-campo-cruzado-con-angular-100506287562082

        /*Comienza con una palabra de entre 3 y 15 caracteres, pueden seguir con varias palabras
        de 2 a 15 caracteres cada una, pero nunca tendrá mas de un espacio entre ellas y
        siempre termina en una letra, no se aceptan números, permite ñ y tildes.*/
        const names_pattern = '^[a-zA-ZÁ-Úá-ú]{2,15}( ?[a-zA-ZÁ-Úá-ú]{1,15})*[a-zA-ZÁ-Úá-ú]+$';
        const telefonos_pattern = '^[0-9]{9}$';
        const cedula_pattern = '^[0-9]{8}$';
        const email_pattern = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';
        const password_pattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{12,16}';
        const userName_pattern = '^[a-zA-Z0-9_-]{4,12}$';

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
            clave: new FormControl('', [
                Validators.pattern(password_pattern)]),
            claveR: new FormControl('', [
                Validators.pattern(password_pattern)]),
            foto: new FormControl('', [
                Validators.required])
            }, { validators: passwordValidator });
    }

    onSubmit(): void {
        if (this.registroForm.valid) {
            const { claveR, ...user } = this.registroForm.value           
            this.subs = this.userService.registro(user).subscribe(
                res => {
                    this.err = "";
                    this.router.navigateByUrl('/');
                },
                err => {
                    this.err = err.statusText;
                    if (this.err === "Unknown Error"){
                        window.alert("Registro incorrecto. Error en el Servidor.");
                    }else{
                        window.alert(`Registro incorrecto ${err.statusText}`);}
            });
        }
    }

    public capture() {
        this.canvas.setAttribute('width', this.localvideo.videoWidth);
        this.canvas.setAttribute('height', this.localvideo.videoHeight);

        let context = this.canvas.getContext("2d")

        this.localvideo.pause();
        context.drawImage(this.localvideo, 0, 0, this.localvideo.videoWidth, this.localvideo.videoHeight);
        this.localvideo.play();

        let data = this.canvas.toDataURL('image/png');
        this.registroForm.controls['foto'].setValue(data);
    }

}
