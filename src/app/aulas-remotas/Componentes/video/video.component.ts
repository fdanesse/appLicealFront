import { Component, OnInit, Input } from '@angular/core';


@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

    @Input() public conexion;

    constructor() { }

    ngOnInit() {}

}