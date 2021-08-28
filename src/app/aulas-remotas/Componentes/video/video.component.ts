import { Component, OnInit, Input, ViewChild,
    AfterViewInit, ElementRef, Renderer2,
    Output, EventEmitter } from '@angular/core';

import { faMicrophoneAlt, faMicrophoneAltSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, AfterViewInit {

    faVideo = faVideo;
    faVideoSlash = faVideoSlash;
    faMicrophoneAlt = faMicrophoneAlt;
    faMicrophoneAltSlash = faMicrophoneAltSlash;

    @ViewChild('video', {static: true}) private videoWidget: ElementRef;
    @ViewChild('btn0', {static: true}) private btn0: ElementRef;
    @ViewChild('btn1', {static: true}) private btn1: ElementRef;
    @ViewChild('btn2', {static: true}) private btn2: ElementRef;
    @ViewChild('btn3', {static: true}) private btn3: ElementRef;
    @Input() public _id;
    @Input() public usuario;
    @Output() cambioTracks = new EventEmitter<any>();
    private stream: MediaStream;

    constructor(private render2: Renderer2) {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.render2.setStyle(this.btn3.nativeElement, 'display', 'none');
        this.render2.setStyle(this.btn1.nativeElement, 'display', 'none');
    }

    setStreaming(stream) {
        // Se inicia con audio y video deshabilitado
        this.stream = stream;
        let vtracks = this.stream.getVideoTracks();
        let atracks = this.stream.getAudioTracks();
        if (this._id === 'localVideo'){
            vtracks.forEach(track => track.enabled = false);
            atracks.forEach(track => track.enabled = false);
            this.videoWidget.nativeElement.muted = true;
        } else {
            this.videoWidget.nativeElement.muted = false;
            this.btn0.nativeElement.disabled = true;
            this.btn1.nativeElement.disabled = true;
            this.btn2.nativeElement.disabled = true;
            this.btn3.nativeElement.disabled = true;
        }
        this.videoWidget.nativeElement.srcObject = this.stream;
    }

    command(n){
        let vtracks = this.stream.getVideoTracks();
        let atracks = this.stream.getAudioTracks();
        switch (n){
            case 0:
                if (this._id === 'localVideo'){
                    atracks.forEach(track => track.enabled = true);
                    this.render2.setStyle(this.btn1.nativeElement, 'display', 'block');
                    this.render2.setStyle(this.btn0.nativeElement, 'display', 'none');
                }
                this.cambioTracks.emit({id: this._id, prop: 'audio', val: true});
                break;
            case 1:
                if (this._id === 'localVideo'){
                    atracks.forEach(track => track.enabled = false);
                    this.render2.setStyle(this.btn1.nativeElement, 'display', 'none');
                    this.render2.setStyle(this.btn0.nativeElement, 'display', 'block');
                }
                this.cambioTracks.emit({id: this._id, prop: 'audio', val: false});
                break;
            case 2:
                if (this._id === 'localVideo'){
                    vtracks.forEach(track => track.enabled = true);
                    this.render2.setStyle(this.btn3.nativeElement, 'display', 'block');
                    this.render2.setStyle(this.btn2.nativeElement, 'display', 'none');
                }
                this.cambioTracks.emit({id: this._id, prop: 'video', val: true});
                break;
            case 3:
                if (this._id === 'localVideo'){
                    vtracks.forEach(track => track.enabled = false);
                    this.render2.setStyle(this.btn3.nativeElement, 'display', 'none');
                    this.render2.setStyle(this.btn2.nativeElement, 'display', 'block');
                }
                this.cambioTracks.emit({id: this._id, prop: 'video', val: false});
                break;
        }
    }
    
}
