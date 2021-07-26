import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AulasRemotasComponent } from './Views/aulas-remotas/aulas-remotas.component';
import { AulasRemotasRoutingModule } from './aulas-remotas-routing.module';


@NgModule({
  declarations: [
    AulasRemotasComponent],
  imports: [
    CommonModule,
    AulasRemotasRoutingModule,
  ]
})
export class AulasRemotasModule { }
