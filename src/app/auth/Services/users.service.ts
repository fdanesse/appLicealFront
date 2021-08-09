import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from 'rxjs/operators';

import { Usuario } from '../models/user.model';


@Injectable({providedIn: 'root'})  // Quitandolo solo se accedería desde modulo hijo (auth.module en este caso)
export class UsersService {

    private url: string = 'https://lit-fortress-19290.herokuapp.com'; //'http://localhost:8080';

    private obsT = new BehaviorSubject(null);
    private obsUL = new BehaviorSubject(null);

    public obsToken = this.obsT.asObservable();
    public obsUserLoggued = this.obsUL.asObservable();

    constructor(private httpClient: HttpClient) {
        const token = localStorage.getItem("Authorization");
        if (token) {this.saveToken(token);}
        const UserLoggued = JSON.parse(localStorage.getItem("UserLoggued"));
        if (UserLoggued) {this.saveUserLoggued(UserLoggued);}
    }
    
    getToken(): string{
        //return localStorage.getItem("Authorization");
        return this.obsT.getValue();
    }

    getUserLoggued(): any{
        //return JSON.parse(localStorage.getItem("UserLoggued"));
        return this.obsUL.getValue();
    }

    private saveToken (token: string): void{
        this.obsT.next(token);
        localStorage.setItem("Authorization", token);
    }

    private saveUserLoggued(usuario: Usuario): void{
        localStorage.setItem("UserLoggued", JSON.stringify(usuario));
        this.obsUL.next(usuario);
    }

    logout(): void {
        this.obsT.next(null);
        this.obsUL.next(null);
        localStorage.removeItem("Authorization");
        localStorage.removeItem("UserLoggued");
    }

    login(user: any): Observable<any> {
        return this.httpClient.post(this.url  + '/usuarios/login', user).pipe(
            tap(
                res => {
                    const { authUser, accesToken } = res;
                    const usuario = new Usuario(authUser);
                    window.alert(`Bienvenido ${usuario.usuario}`);
                    this.saveToken(accesToken);
                    this.saveUserLoggued(usuario);
                    },
                err => {
                }
            )
        );
    }

    registro(user: any): Observable<any> {
        // https://www.tektutorialshub.com/angular/angular-observable-pipe/
        //return this.httpClient.post(this.url  + '/usuarios/registro', user, this.httpOptions).pipe(
        return this.httpClient.post(this.url  + '/usuarios/registro', user).pipe(
            tap(
                res => {
                    const { authUser, accesToken } = res;
                    const usuario = new Usuario(authUser);
                    window.alert(`Bienvenido ${usuario.usuario}`);
                    this.saveToken(accesToken);
                    this.saveUserLoggued(usuario);
                    },
                err => {
                }
            )
        );
    }

    getPerfil(_id: string): Observable<any> {
        const httpOptions = {headers: new HttpHeaders({'Authorization': this.getToken()})};
        return this.httpClient.get(this.url  + '/usuarios/user/' + _id, httpOptions).pipe(
            tap(
                res => {},
                err => {console.log(err);}
            )
        );
    }

    actualizar(_id: string, user: any): Observable<any> {
        // user son los datos a actualizar. _id indica a que perfil pertenecen esos datos.
        // el token identifica a quien realiza las modificaciones.
        const httpOptions = {headers: new HttpHeaders({'Authorization': this.getToken()})};
        return this.httpClient.patch(this.url  + '/usuarios/user/' + _id, user, httpOptions).pipe(
            tap(
                res => {
                    const { user } = res;
                    const usuario = new Usuario(user);
                    const userlogged = this.getUserLoggued();
                    if (usuario._id === userlogged._id){
                        this.saveUserLoggued(usuario);}
                },
                err => {console.log(err);}
            )
        );
    }

    delete(_id: string): Observable<any> {
        const httpOptions = {headers: new HttpHeaders({'Authorization': this.getToken()})};
        return this.httpClient.delete(this.url  + '/usuarios/user/' + _id, httpOptions).pipe(
            tap(
                res => {
                    const userlogged = this.getUserLoggued();
                    if (_id === userlogged._id){
                        this.logout();}
                },
                err => {console.log(err);}
            )
        );
    }
}
