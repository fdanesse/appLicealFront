import { Component, OnInit, Input, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

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
    @Input() public _id;

    constructor() {}

    ngOnInit() {}

    setStreaming(stream: MediaStream) {
        this.videoWidget.nativeElement.srcObject = stream;
        this.videoWidget.nativeElement.muted = true;        
    }

    ngAfterViewInit() { }
}
