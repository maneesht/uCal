import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSuccessComponent } from './login-success.component';
import { TokenHandlerService } from '../token-handler/token-handler.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginSuccessComponent', () => {
  let component: LoginSuccessComponent;
  let fixture: ComponentFixture<LoginSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginSuccessComponent ],
      providers: [ TokenHandlerService ],
      imports: [ RouterTestingModule ]
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
