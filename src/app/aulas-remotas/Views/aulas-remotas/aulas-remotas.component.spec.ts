import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AulasRemotasComponent } from './aulas-remotas.component';

describe('AulasRemotasComponent', () => {
  let component: AulasRemotasComponent;
  let fixture: ComponentFixture<AulasRemotasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AulasRemotasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AulasRemotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
