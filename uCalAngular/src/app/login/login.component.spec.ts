import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TokenHandlerService } from '../token-handler/token-handler.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [TokenHandlerService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should invalidate the form when the email is empty', async(() => {
    let form = component.loginForm;
    let emailCtrl = form.controls.email;
    emailCtrl.setValue('');
    expect(form.valid).toEqual(false);
  }));
  it('should invalidate the form when the password is empty', async(() => {
    let form = component.loginForm;
    let passwordCtrl = form.controls.password;
    passwordCtrl.setValue('');
    expect(form.valid).toEqual(false);
  }));
  it('should invalidate the form when both fields are empty', async(() => {
    let form = component.loginForm;
    let passwordCtrl = form.controls.password;
    let emailCtrl = form.controls.email;
    passwordCtrl.setValue('');
    emailCtrl.setValue('');
    expect(form.valid).toEqual(false);
  }));
  it('should invalidate the form when the email is not an email', async(() => {
    let form = component.loginForm;
    let passwordCtrl = form.controls.password;
    let emailCtrl = form.controls.email;
    passwordCtrl.setValue('testing123...');
    emailCtrl.setValue('testing');
    expect(form.valid).toEqual(false);
  }));
  it('should validate the form when both fields are filled', async(() => {
    let form = component.loginForm;
    let passwordCtrl = form.controls.password;
    let emailCtrl = form.controls.email;
    passwordCtrl.setValue('testing123...');
    emailCtrl.setValue('testing@gmail.com');
    expect(form.valid).toEqual(true);
  }));

});
