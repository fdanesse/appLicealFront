import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-aulas-remotas',
    templateUrl: './aulas-remotas.component.html',
    styleUrls: ['./aulas-remotas.component.css']
})
export class AulasRemotasComponent {
  
    constructor(private chatservice: ChatService) { 
        //this.chatservice.sendMessage("OK");
    }
}
