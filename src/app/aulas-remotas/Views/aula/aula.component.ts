import { Component, OnInit } from '@angular/core';
import { AulasRemotasSocket } from '../../services/AulasRemotasSocket.service';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-aula',
    templateUrl: './aula.component.html',
    styleUrls: ['./aula.component.css']
})
export class AulaComponent implements OnInit {

    private localvideo = undefined;
    private stream = undefined;
    public aula: string;
    private peerConn: RTCPeerConnection;

    constructor(private aulasSocketService: AulasRemotasSocket, private _route: ActivatedRoute) {
        this.aula = this._route.snapshot.paramMap.get('aula');
    }

    ngOnInit() {
        // 1- Obtener streaming de audio y video
        // 2- Crear RTCPeerConnection
        // 3- Establecer RTCSessionDescription
        // 4- Crear Oferta de conexión              https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer

        this.obtenerStreamingLocal();        
    }

    obtenerStreamingLocal(){
        this.localvideo = document.getElementById('localVideo');
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.getUserMedia({video: {width:200, height: 200}, audio: false},
                stream => {
                    this.stream = stream;
                    this.localvideo.srcObject = stream;
                    this.crearRTCPeerConnection();
                    this.crearEnviarOferta();
                }, err => {
                    console.log("Video Error:", err)
                    window.alert("Se necesita una cámara para tomar la fotografía");
                })
        }else {window.alert("Se necesita una cámara para tomar la fotografía");}
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

        this.peerConn = new webkitRTCPeerConnection(configuration);
        console.log(this.peerConn);
        console.log(this.stream);
        //FIXME: Leer => https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream
        this.stream.getTracks().forEach(track => {
            this.peerConn.addTrack(track, this.stream);
        });
    }

    crearEnviarOferta() {
        this.peerConn.createOffer()
            .then((offer) => {
                console.log(offer);
                return this.peerConn.setLocalDescription(offer);
            })
            .then(() => {
                this.aulasSocketService.sendToServer('anfitrionOffer', {
                    aula: this.aula,
                    sdp: this.peerConn.localDescription});
            })
            .catch((reason) => {
                console.log("ERROR:", reason);
            });
    }

}
