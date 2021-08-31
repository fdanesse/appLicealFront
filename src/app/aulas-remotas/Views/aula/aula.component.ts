import { Component, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { AulasRemotasSocket } from '../../services/AulasRemotasSocket.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { VideoComponent } from '../../Componentes/video/video.component';

/*
class Conexion{
    constructor(socketId, tiempo, userId, usuario, nombre, apellido){
        this.socketId = socketId
        this.userId = userId
        this.tiempo = tiempo
        this.usuario = usuario
        this.nombre = nombre
        this.apellido = apellido

        this.peerconn: RTCPeerConnection
        this.src: MediaStream
        this.MediaControl: RTCDataChannel
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
            (videos: Array<VideoComponent>) => {});
        this.localVideoWidget = this.videos.find(video => video._id === 'localVideo');
        this.obtenerStreamingLocal();
    }
    
    ngOnInit() {
    }

    onCambioTracks(data){
        const {id, prop, val} = data;
        if (id === 'localVideo'){
            // Avisar a todos mi estado en audio y video para que actualicen los botones
            this.conexiones.forEach(conexion => {
                conexion.MediaControl.send(JSON.stringify({msg: "aviso", prop, val}));
            })
        }else {
            // Solicitamos activar o desactivar audio o video a una terminal remota
            let conexion = this.conexiones.find(elemento => elemento.socketId === id);
            if (conexion) {
                conexion.MediaControl.send(JSON.stringify({msg: "solicitud", prop, val}));
            }
        }
    }

    controlMedia(event, conexionRemitente){
        let mensaje = JSON.parse(event.data);
        // Cuando activamos o desactivamos el audio o el video, enviamos un mensaje para que
        // las terminales remotas actualicen los botones.
        if (mensaje.msg === "aviso"){
            let video = this.videos.find(video => video._id === conexionRemitente.socketId);
            video.setControles(mensaje);
        }else if(mensaje.msg === "solicitud"){
            // Terminal remota solicita cambios en las pistas de audio o video
            // FIXME: No cualquiera debiera poder hacer esto.
            console.log("Recibiendo:", mensaje, conexionRemitente);
        }
    }

    configurarObservers(){
        this.newDesconectadoSubscription = this.aulasSocketService.Desconectado.subscribe(
            socketId => {
                if (socketId){
                    let conexion = this.conexiones.find(elemento => elemento.socketId === socketId);
                    if (conexion){
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
                    }
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
                    this.newDataChannel(conexionRemitente, peerConn, "MediaControl");
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
                    peerConn.ondatachannel = (event) => {this.handleDataChannelCreated(event, conexionRemitente)};
                    this.conexiones.push(conexionRemitente);
                    this.responder(conexionRemitente, sdp);
                    //console.log("Nueva oferta recibida de:", conexionRemitente.socketId);
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
                    conexion.peerconn.addIceCandidate(ice);
                    //console.log("Nuevo candidato recibido de:", remitente, candidato);
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
                    conexion.peerconn.setRemoteDescription(sdp);
                    //console.log("Nueva respuesta recibida:", remitente);
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

    newDataChannel(conexionRemitente, peerConn, labelName){
        let dataChannel = peerConn.createDataChannel(labelName);
        conexionRemitente[dataChannel.label] = dataChannel as RTCDataChannel;
        dataChannel.onmessage = (event) => {this.controlMedia(event, conexionRemitente);}
        //dataChannel.onopen = this.handleDataChannelStatusChange;
        //dataChannel.onclose = this.handleDataChannelStatusChange;
        //console.log("Canal Creado", dataChannel);
        return dataChannel;
    }

    handleDataChannelCreated(event, conexionRemitente) {
        let dataChannel = event.channel;
        conexionRemitente[dataChannel.label] = dataChannel as RTCDataChannel;
        dataChannel.onmessage = (event) => {this.controlMedia(event, conexionRemitente);}
        //dataChannel.onopen = this.handleDataChannelStatusChange;
        //dataChannel.onclose = this.handleDataChannelStatusChange;
        //console.log('Canal abierto', dataChannel);
    }

    /*
    handleDataChannelStatusChange(event) {
        console.log(event);
    }
    */

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
            // dataChannel.close();
        })
        this.conexiones = [];
    }
}
