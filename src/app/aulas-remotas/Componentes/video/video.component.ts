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
        this.render2.setStyle(this.btn2.nativeElement, 'display', 'none');
        this.render2.setStyle(this.btn1.nativeElement, 'display', 'none');
    }

    setStreaming(stream) {
        this.stream = stream;
        this.videoWidget.nativeElement.srcObject = this.stream;
        this.videoWidget.nativeElement.muted = true;
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
                else{this.cambioTracks.emit({id: this._id, prop: 'audio', val: true});}
                break;
            case 1:
                if (this._id === 'localVideo'){
                    atracks.forEach(track => track.enabled = false);
                    this.render2.setStyle(this.btn1.nativeElement, 'display', 'none');
                    this.render2.setStyle(this.btn0.nativeElement, 'display', 'block');
                }
                else{this.cambioTracks.emit({id: this._id, prop: 'audio', val: false});}
                break;
            case 2:
                if (this._id === 'localVideo'){
                    vtracks.forEach(track => track.enabled = true);
                    this.render2.setStyle(this.btn3.nativeElement, 'display', 'block');
                    this.render2.setStyle(this.btn2.nativeElement, 'display', 'none');
                }
                else{this.cambioTracks.emit({id: this._id, prop: 'video', val: true});}
                break;
            case 3:
                if (this._id === 'localVideo'){
                    vtracks.forEach(track => track.enabled = false);
                    this.render2.setStyle(this.btn3.nativeElement, 'display', 'none');
                    this.render2.setStyle(this.btn2.nativeElement, 'display', 'block');
                }
                else{this.cambioTracks.emit({id: this._id, prop: 'video', val: false});}
                break;
        }
    }
    
}
