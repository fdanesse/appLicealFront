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
                    console.log("Nuevo candidato recibido...");
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

        this.realizarLlamada();
    }

    realizarRespuesta(offer) {
        /*
        1. Crear RTCPeerConnection y establecer la oferta recibida como descripción remota (setRemoteDescription).
        2. Obtener streaming de audio y video y agregar sus pistas a la conexión.
        3. Crear Respuesta y establecerla como descripción local (setLocalDescription) y enviarla al servidor de señalización.
        4. Al recibir candidatos, agregarlos a la conexión (addIceCandidate).
        5. Capturar el evento track para agregar el sreaming remoto a la interfaz.
        */

        this.peerConn.onicecandidate = null

        this.peerConn = new RTCPeerConnection();
        console.log('Seteando descripción remota...')
        this.peerConn.setRemoteDescription(new RTCSessionDescription(offer))
            .then(() => {
                return navigator.mediaDevices.getUserMedia({video: {width:200, height: 200}, audio: false});
            })
            .then(stream => {
                this.stream = stream;
                this.localvideo.srcObject = stream;
                this.stream.getTracks().forEach(track => {this.peerConn.addTrack(track, this.stream);});
            })
            .then(() => {
                console.log("Creando Respuesta...")
                return this.peerConn.createAnswer();
            })
            .then((answer) => {
                console.log("Seteando descripción local...")
                return this.peerConn.setLocalDescription(answer);
            })
            .then((answer) => {
                console.log("Enviando Respuesta", this.peerConn.localDescription);
                this.aulasSocketService.enviarRespuesta(this.peerConn.localDescription);
            })
            .catch(this.UserMediaError);

        this.peerConn.addEventListener("track", event => {
            console.log("Stream Agregado.", event);
            this.remoteVideo.srcObject = event.streams[0];
        }, false);

        this.peerConn.addEventListener("removetrack", e => {
            let stream = this.remoteVideo.srcObject
            let trackList = stream.getTracks();
            //if (trackList.length == 0) {this.closeVideoCall();}
            console.log("Remove Track");
        });
    }

    realizarLlamada(){
        /*
        1. Crear RTCPeerConnection pasándole los Servidores STUN – TURN.
        2. Obtener streaming de audio y video y agregar sus pistas a la conexión.
        3. Capturar el evento onnegotiationneeded de la conexión y en él: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling
            1. Crear la oferta SDP (createOffer), establecerla como descripción local (setLocalDescription) y enviarla al servidor de señalización.
        4. Capturar los eventos onicecandidate y enviarlos al servidor de Señalización. https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
        5. Al Recibir Respuesta establecerla como descripción remota (setRemoteDescription).
        6. Capturar el evento track para agregar el sreaming remoto a la interfaz.
        */

        this.crearRTCPeerConnection();
        this.obtenerStreamingLocal();
        
        // SEÑALIZACION: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling

        /*
        Una vez que setLocalDescription() se ha ejecutado, el agente ICE comienza a enviar icecandidate eventos
        al RTCPeerConnection, uno por cada configuración potencial que descubre.
        */
        this.peerConn.onicecandidate = (event) => {
            console.log("Enviando candidato...");
            this.aulasSocketService.enviarCandidato(event.candidate);
        }

        /*
        Una vez que quien llama ha creado su  RTCPeerConnection, un flujo de medios y
        agregado sus pistas a la conexión, el navegador enviará un negotiationneeded evento al
        RTCPeerConnection para indicar que está listo para comenzar la negociación con el otro par.
        Para iniciar el proceso de negociación, debemos crear y enviar una oferta de SDP al par con el
        que queremos conectarnos. Cuando createOffer() tiene éxito (cumpliendo la promesa),
        pasamos la información de la oferta creada a myPeerConnection.setLocalDescription(),
        que configura la conexión.
        */
        this.peerConn.onnegotiationneeded = () => {
            this.peerConn.createOffer()
                .then((offer) => {
                    console.log("Seteando Description local...")
                    return this.peerConn.setLocalDescription(offer);
                })
                .then(() => {
                    console.log("Enviando Description local.")
                    this.aulasSocketService.enviarOferta(this.aula, this.peerConn.localDescription);;
                })
                .catch((reason) => {
                    console.log("onnegotiationneeded Error:", reason);
                });
            };

        this.peerConn.addEventListener("track", event => {
            console.log("Stream Agregado.", event);
            this.remoteVideo.srcObject = event.streams[0];
        }, false);

        this.peerConn.addEventListener("removetrack", e => {
            let stream = this.remoteVideo.srcObject
            let trackList = stream.getTracks();
            //if (trackList.length == 0) {this.closeVideoCall();}
            console.log("Remove Track");
        });
    }

    obtenerStreamingLocal(){
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video: {width:200, height: 200}, audio: false})
                .then(stream => {
                    this.stream = stream;
                    this.localvideo.srcObject = stream;
                    //FIXME: Leer => https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream
                    this.stream.getTracks().forEach(track => {this.peerConn.addTrack(track, this.stream);});
                    console.log("Streaming local agregado.")
                })
                .catch(this.UserMediaError);
        }else {this.UserMediaError;}
    }

    crearRTCPeerConnection(){
        console.log("RTCPeerConnection creada.")
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
    }
}
