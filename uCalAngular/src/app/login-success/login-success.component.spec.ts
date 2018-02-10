import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarComponentStub } from './calendar.component.stub';
import { LoginSuccessComponent } from './login-success.component';
import { TokenHandlerService } from '../token-handler/token-handler.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginSuccessComponent', () => {
  let component: LoginSuccessComponent;
  let fixture: ComponentFixture<LoginSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginSuccessComponent, CalendarComponentStub ],
      providers: [ TokenHandlerService ],
      imports: [ RouterTestingModule.withRoutes([
        {path: 'calendar', component: CalendarComponentStub }
      ]) ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
