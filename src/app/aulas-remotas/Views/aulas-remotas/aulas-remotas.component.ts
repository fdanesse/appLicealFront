import { Component } from '@angular/core';
import { SocketService } from '../../services/Socket.service';

@Component({
    selector: 'app-aulas-remotas',
    templateUrl: './aulas-remotas.component.html',
    styleUrls: ['./aulas-remotas.component.css']
})
export class AulasRemotasComponent {
  
    constructor(private socketService: SocketService) { 
    }
}
