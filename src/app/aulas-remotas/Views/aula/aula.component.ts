import { Component, OnInit, OnDestroy } from '@angular/core';
import { AulasRemotasSocket } from '../../services/AulasRemotasSocket.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-aula',
    templateUrl: './aula.component.html',
    styleUrls: ['./aula.component.css']
})
export class AulaComponent implements OnInit, OnDestroy {

    private localvideo = undefined;
    private remoteVideo = undefined;
    private stream = undefined;
    public aula: string;
    private peerConn: RTCPeerConnection;

    private newOfferSubscription: Subscription = null;
    private newCandidateSubscription: Subscription = null;
    private newRespuestaSubscription: Subscription = null;

    constructor(private aulasSocketService: AulasRemotasSocket, private _route: ActivatedRoute) {
        this.aula = this._route.snapshot.paramMap.get('aula');
    }

    ngOnInit() {
        this.localvideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.localvideo.muted = true;
        this.remoteVideo.muted = true;

        this.configurarObservers();
        this.crearRTCPeerConnection();
        this.obtenerStreamingLocal();

        this.peerConn.ontrack = ({track, streams}) => {
            track.onunmute = () => {
                if (this.remoteVideo.srcObject) {return;}
                console.log("Seteando video remoto...", track, streams);
                this.remoteVideo.srcObject = streams[0];
            };
        };

        this.peerConn.onnegotiationneeded = () => {
            this.peerConn.createOffer()
                .then((offer) => {
                    return this.peerConn.setLocalDescription(offer);
                })
                .then(() => {
                    this.aulasSocketService.enviarOferta(this.aula, this.peerConn.localDescription);;
                })
                .catch((reason) => {
                    console.log("onnegotiationneeded Error:", reason);
                });
        };

        this.peerConn.onicecandidate = (event) => {
            this.aulasSocketService.enviarCandidato(event.candidate);
        }

    }

    configurarObservers(){
        this.newOfferSubscription = this.aulasSocketService.newOffer.subscribe(
            offer => {
                if (offer){
                    console.log("Nueva oferta recibida...", offer);
                    this.realizarRespuesta(offer);
                }
            },
            err => {
                console.log("Error al recibir una oferta", err);
            }
        )

        this.newCandidateSubscription = this.aulasSocketService.newCandidate.subscribe(
            candidato => {
                if (candidato){
                    console.log("Nuevo candidato recibido...", candidato);
                    this.peerConn.addIceCandidate(candidato);
                }
            },
            err => {
                console.log("Error al recibir un candidato", err);
            }
        )

        this.newRespuestaSubscription = this.aulasSocketService.newRespuesta.subscribe(
            respuesta => {
                if (respuesta){
                    console.log("Nueva respuesta recibida...", respuesta);
                    this.peerConn.setRemoteDescription(respuesta);
                }
            },
            err => {
                console.log("Error al recibir una respuesta", err);
            }
        )
    }

    realizarRespuesta(offer) {
        this.peerConn.setRemoteDescription(new RTCSessionDescription(offer))
            .then(() => {
                return this.peerConn.createAnswer();
            })
            .then((answer) => {
                return this.peerConn.setLocalDescription(answer);
            })
            .then((answer) => {
                this.aulasSocketService.enviarRespuesta(this.peerConn.localDescription);
            })
            .catch(this.UserMediaError);
    }

    obtenerStreamingLocal(){
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video: {width:300, height: 300}, audio: true})
                .then(stream => {
                    this.stream = stream;
                    this.localvideo.srcObject = stream;
                    //FIXME: Leer => https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream
                    this.stream.getTracks().forEach(track => {this.peerConn.addTrack(track, this.stream);});
                })
                .catch(this.UserMediaError);
        }else {this.UserMediaError;}
    }

    crearRTCPeerConnection(){
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
        this.peerConn = new RTCPeerConnection(configuration);
    }







    UserMediaError(error) {
        switch(error.name) {
            case "NotFoundError":
                alert("No se encontró la cámara o el micrófono.");
                break;
            case "SecurityError":
                alert("Error de Seguridad" + error.message);
            case "PermissionDeniedError":
                alert("Usuario canceló la llamada" + error.message);
                break;
            default:
                alert("Error de acceso a cámara o micrófono " + error.message);
                break;
        }
        this.closeVideoCall();
    }

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

    ngOnDestroy(){
        if (this.newOfferSubscription) this.newOfferSubscription.unsubscribe();
        if (this.newCandidateSubscription) this.newCandidateSubscription.unsubscribe();
        if (this.newRespuestaSubscription) this.newRespuestaSubscription.unsubscribe();
        this.peerConn.close();
    }
}
