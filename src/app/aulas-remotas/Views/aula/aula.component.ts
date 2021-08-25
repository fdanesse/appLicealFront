import { Component, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { AulasRemotasSocket } from '../../services/AulasRemotasSocket.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { VideoComponent } from '../../Componentes/video/video.component';

/*
class Conexion{
    constructor(socketId, userId, tiempo){
        this.socketId = socketId
        this.userId = userId
        this.tiempo = tiempo

        this.peerconn: RTCPeerConnection
        this.src: MediaStream
    }
}
*/


@Component({
    selector: 'app-aula',
    templateUrl: './aula.component.html',
    styleUrls: ['./aula.component.css']
})
export class AulaComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChildren(VideoComponent) private videos: QueryList<VideoComponent>;
    private localVideoWidget: VideoComponent;
    private stream = undefined;
    public aula: Object = {};

    // https://webrtc.github.io/samples/src/content/peerconnection/multiple/
    // https://github.com/webrtc/samples/blob/gh-pages/src/content/peerconnection/multiple/js/main.js
    public conexiones = [];

    private newOfferSubscription: Subscription = null;
    private newCandidateSubscription: Subscription = null;
    private newRespuestaSubscription: Subscription = null;
    private newHelloSubscription: Subscription = null;
    private newDesconectadoSubscription: Subscription = null;
    private newVideoSubscription: Subscription = null;

    constructor(private aulasSocketService: AulasRemotasSocket, private _route: ActivatedRoute) {
        this.aula['nombre'] = this._route.snapshot.paramMap.get('aula');
        this.aula['id'] = this._route.snapshot.paramMap.get('id');
    }

    ngAfterViewInit () {
        this.newVideoSubscription = this.videos.changes.subscribe(
            (videos: Array<VideoComponent>) => {console.log("nuevo video:", this.videos)});
        this.localVideoWidget = this.videos.find(video => video._id === 'localVideo');
        this.obtenerStreamingLocal();
    }
    
    ngOnInit() {
    }

    configurarObservers(){
        this.newDesconectadoSubscription = this.aulasSocketService.Desconectado.subscribe(
            socketId => {
                if (socketId){
                    let conexion = this.conexiones.find(elemento => elemento.socketId === socketId);
                    conexion.peerconn.ontrack = null;
                    //conexion.peerconn.onremovetrack = null;
                    //conexion.peerconn.onremovestream = null;
                    conexion.peerconn.onicecandidate = null;
                    conexion.peerconn.oniceconnectionstatechange = null;
                    conexion.peerconn.onsignalingstatechange = null;
                    conexion.peerconn.onicegatheringstatechange = null;
                    conexion.peerconn.onnegotiationneeded = null;
                    conexion.peerconn.close();
                    let pos = this.conexiones.indexOf(conexion);
                    let eliminado = this.conexiones.splice(pos, 1);
                    //console.log("Usuario desconectado:", socketId);
                }
            },
            err => {
                console.log("Error al recibir hello", err);
            }
        )

        // Cuando alguien nos envía un saludo, le enviamos una oferta de conexión webRTC.
        this.newHelloSubscription = this.aulasSocketService.newHello.subscribe(
            conexionRemitente => {
                if (conexionRemitente){
                    let peerConn = this.newRTCPeerConnection();
                    this.negociarConexion(peerConn, conexionRemitente)
                    conexionRemitente['peerconn'] = peerConn as RTCPeerConnection;
                    this.conexiones.push(conexionRemitente);
                    //console.log("Dice Hello:", conexionRemitente);
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
                    conexionRemitente['peerconn'] = peerConn as RTCPeerConnection;
                    this.conexiones.push(conexionRemitente);
                    //console.log("Nueva oferta recibida de:", conexionRemitente.socketId);
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
                    //console.log("Nuevo candidato recibido de:", remitente, candidato);
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
                    //console.log("Nueva respuesta recibida:", remitente);
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
                //console.log("Enviando Respuesta a:", conexionRemitente.socketId);
                this.aulasSocketService.enviarRespuesta(conexionRemitente.socketId, conexionRemitente.peerconn.localDescription);
            })
            .catch(this.UserMediaError);
    }
   
    negociarConexion(peerConn, conexionRemitente){
        peerConn.ontrack = ({track, streams}) => {
            track.onunmute = () => {
                //console.log("Pista Remota Recibida de:", conexionRemitente.socketId);
                let conexion = this.conexiones.find(elemento => elemento.socketId === conexionRemitente.socketId);
                conexion['src'] = streams[0] as MediaStream;
                let remoteVideo = this.videos.find(video => video._id === conexion.socketId);
                remoteVideo.setStreaming(streams[0] as MediaStream);
            };
        };
        peerConn.onnegotiationneeded = () => {
            peerConn.createOffer()
                .then((offer) => {
                    return peerConn.setLocalDescription(offer);
                })
                .then(() => {
                    //console.log("Enviando Oferta a:", conexionRemitente.socketId)
                    this.aulasSocketService.enviarOferta(conexionRemitente.socketId, peerConn.localDescription);
                })
                .catch((reason) => {
                    console.log("onnegotiationneeded Error:", reason);
                });
        };
        peerConn.onicecandidate = (event) => {
            //console.log("Enviando Candidato a:", conexionRemitente.socketId)
            this.aulasSocketService.enviarCandidato(conexionRemitente.socketId, event.candidate);
        }
    }

    obtenerStreamingLocal(){
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
            navigator.mediaDevices.getUserMedia({video: {width:300, height: 300}, audio: true})
                .then(stream => {
                    this.stream = stream;
                    this.localVideoWidget.setStreaming(stream as MediaStream);
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
    }
    
    ngOnDestroy(){
        if (this.newOfferSubscription) this.newOfferSubscription.unsubscribe();
        if (this.newCandidateSubscription) this.newCandidateSubscription.unsubscribe();
        if (this.newRespuestaSubscription) this.newRespuestaSubscription.unsubscribe();
        if (this.newHelloSubscription) this.newHelloSubscription.unsubscribe();
        if (this.newDesconectadoSubscription) this.newDesconectadoSubscription.unsubscribe();
        if (this.newVideoSubscription) this.newVideoSubscription.unsubscribe();
        this.conexiones.forEach(conexion => {
            conexion.peerconn.ontrack = null;
            //conexion.peerconn.onremovetrack = null;
            //conexion.peerconn.onremovestream = null;
            conexion.peerconn.onicecandidate = null;
            conexion.peerconn.oniceconnectionstatechange = null;
            conexion.peerconn.onsignalingstatechange = null;
            conexion.peerconn.onicegatheringstatechange = null;
            conexion.peerconn.onnegotiationneeded = null;
            conexion.peerconn.close();
        })
        this.conexiones = [];
    }
}
