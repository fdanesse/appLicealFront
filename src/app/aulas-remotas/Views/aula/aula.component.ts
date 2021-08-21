import { Component, OnInit, OnDestroy } from '@angular/core';
import { AulasRemotasSocket } from '../../services/AulasRemotasSocket.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

/*
class Conexion{
    constructor(socketId, userId, tiempo){
        this.socketId = socketId
        this.userId = userId
        this.tiempo = tiempo
    }
}
*/


@Component({
    selector: 'app-aula',
    templateUrl: './aula.component.html',
    styleUrls: ['./aula.component.css']
})
export class AulaComponent implements OnInit, OnDestroy {

    private localvideo = undefined;
    private stream = undefined;

    public aula: Object = {};

    // https://webrtc.github.io/samples/src/content/peerconnection/multiple/
    // https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/multiple/js/main.js
    private conexiones = [];

    private newOfferSubscription: Subscription = null;
    private newCandidateSubscription: Subscription = null;
    private newRespuestaSubscription: Subscription = null;
    private newHelloSubscription: Subscription = null;

    constructor(private aulasSocketService: AulasRemotasSocket, private _route: ActivatedRoute) {
        this.aula['nombre'] = this._route.snapshot.paramMap.get('aula');
        this.aula['id'] = this._route.snapshot.paramMap.get('id');
    }

    ngOnInit() {
        this.localvideo = document.getElementById('localVideo');
        this.localvideo.muted = true;

        this.obtenerStreamingLocal();
    }

    configurarObservers(){
        // Cuando alguien nos envía un saludo, le enviamos una oferta de conexión webRTC.
        this.newHelloSubscription = this.aulasSocketService.newHello.subscribe(
            conexionRemitente => {
                if (conexionRemitente){
                    let peerConn = this.newRTCPeerConnection();
                    this.negociarConexion(peerConn, conexionRemitente)
                    conexionRemitente['peerconn'] = peerConn;
                    this.conexiones.push(conexionRemitente);
                    console.log("Dice Hello:", conexionRemitente);
                }
            },
            err => {
                console.log("Error al recibir hello", err);
            }
        )

        // Contestar llamada, escuchar ofertas y construir respuesta
        this.newOfferSubscription = this.aulasSocketService.newOffer.subscribe(
            offer => {
                if (offer){
                    const {conexionRemitente, sdp} = offer
                    let peerConn = this.newRTCPeerConnection();
                    this.negociarConexion(peerConn, conexionRemitente)
                    conexionRemitente['peerconn'] = peerConn;
                    this.conexiones.push(conexionRemitente);
                    console.log("Nueva oferta recibida de:", conexionRemitente.socketId);
                    this.responder(conexionRemitente, sdp);
                }
            },
            err => {
                console.log("Error al recibir una oferta", err);
            }
        )

        // Llamar y contestar llamada, agregar candidatos recibidos
        this.newCandidateSubscription = this.aulasSocketService.newCandidate.subscribe(
            candidato => {
                if (candidato){
                    const {remitente, ice} = candidato;
                    let conexion = this.conexiones.find(elemento => elemento.socketId === remitente)
                    console.log("Nuevo candidato recibido de:", remitente, candidato);
                    conexion.peerconn.addIceCandidate(ice);
                }
            },
            err => {
                console.log("Error al recibir un candidato", err);
            }
        )
        
        // Llamada, recibir respuestas
        this.newRespuestaSubscription = this.aulasSocketService.newRespuesta.subscribe(
            respuesta => {
                if (respuesta){
                    const {remitente, sdp} = respuesta;
                    let conexion = this.conexiones.find(elemento => elemento.socketId === remitente)
                    console.log("Nueva respuesta recibida:", remitente);
                    conexion.peerconn.setRemoteDescription(sdp);
                }
            },
            err => {
                console.log("Error al recibir una respuesta", err);
            }
        )
    }

    // Contestar llamada, construir y enviar respuesta
    responder(conexionRemitente, offer) {
        conexionRemitente.peerconn.setRemoteDescription(new RTCSessionDescription(offer))
            .then(() => {
                return conexionRemitente.peerconn.createAnswer();
            })
            .then((answer) => {
                return conexionRemitente.peerconn.setLocalDescription(answer);
            })
            .then((answer) => {
                console.log("Enviando Respuesta a:", conexionRemitente.socketId);
                this.aulasSocketService.enviarRespuesta(conexionRemitente.socketId, conexionRemitente.peerconn.localDescription);
            })
            .catch(this.UserMediaError);
    }
   
    negociarConexion(peerConn, conexionRemitente){
        peerConn.ontrack = ({track, streams}) => {
            track.onunmute = () => {
                console.log("Pista Remota Recibida de:", conexionRemitente.socketId);
                let remoteVideo = <HTMLVideoElement>document.getElementById('remoteVideo');
                if (remoteVideo.srcObject) {return;}
                remoteVideo.srcObject = streams[0];
                remoteVideo.muted = true;
            };
        };
        peerConn.onnegotiationneeded = () => {
            peerConn.createOffer()
                .then((offer) => {
                    return peerConn.setLocalDescription(offer);
                })
                .then(() => {
                    console.log("Enviando Oferta a:", conexionRemitente.socketId)
                    this.aulasSocketService.enviarOferta(conexionRemitente.socketId, peerConn.localDescription);
                })
                .catch((reason) => {
                    console.log("onnegotiationneeded Error:", reason);
                });
        };
        peerConn.onicecandidate = (event) => {
            console.log("Enviando Candidato a:", conexionRemitente.socketId)
            this.aulasSocketService.enviarCandidato(conexionRemitente.socketId, event.candidate);
        }
    }

    obtenerStreamingLocal(){
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video: {width:300, height: 300}, audio: true})
                .then(stream => {
                    this.stream = stream;
                    this.localvideo.srcObject = stream;
                    
                    this.configurarObservers();
                    this.aulasSocketService.enviarhello(this.aula);
                })
                .catch(this.UserMediaError);
        }else {this.UserMediaError;}
    }

    newRTCPeerConnection(): RTCPeerConnection{
        const configuration = {
            iceServers: [{
                "urls": [ 
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                    "stun:stun.ekiga.net",
                    "stun:stun.ideasip.com",
                    "stun:stun.schlund.de",
                    "stun:stun.stunprotocol.org:3478",
                    "stun:stun.voiparound.com",
                    "stun:stun.voipbuster.com",
                    "stun:stun.voipstunt.com"]
            }]
        };
        let peerConn = new RTCPeerConnection(configuration);
        this.stream.getTracks().forEach(track => {peerConn.addTrack(track, this.stream);});

        return peerConn;
    }





    
    UserMediaError(error) {
        switch(error.name) {
            case "NotFoundError":
                alert("No se encontró la cámara o el micrófono.");
                break;
            case "SecurityError":
                alert("Error de Seguridad: " + error.message);
            case "PermissionDeniedError":
                alert("Usuario canceló la llamada: " + error.message);
                break;
            default:
                alert("Error de acceso a cámara o micrófono: " + error.message);
                break;
        }
        //this.closeVideoCall();
    }
    
   /*
    closeVideoCall() {
        if (this.peerConn) {
            this.peerConn.ontrack = null;
            //this.peerConn.onremovetrack = null;
            //this.peerConn.onremovestream = null;
            this.peerConn.onicecandidate = null;
            this.peerConn.oniceconnectionstatechange = null;
            this.peerConn.onsignalingstatechange = null;
            this.peerConn.onicegatheringstatechange = null;
            this.peerConn.onnegotiationneeded = null;
        
            if (this.remoteVideo.srcObject) {
                this.remoteVideo.srcObject.getTracks().forEach(track => track.stop());
            }
        
            if (this.localvideo.srcObject) {
                this.localvideo.srcObject.getTracks().forEach(track => track.stop());
            }
        
            this.peerConn.close();
            this.peerConn = null;
        }
      
        this.remoteVideo.removeAttribute("src");
        this.remoteVideo.removeAttribute("srcObject");
        this.localvideo.removeAttribute("src");
        this.remoteVideo.removeAttribute("srcObject");
    }
    */
    
    ngOnDestroy(){
        if (this.newOfferSubscription) this.newOfferSubscription.unsubscribe();
        if (this.newCandidateSubscription) this.newCandidateSubscription.unsubscribe();
        if (this.newRespuestaSubscription) this.newRespuestaSubscription.unsubscribe();
        if (this.newHelloSubscription) this.newHelloSubscription.unsubscribe();
        //this.peerConn.close();
    }
}
