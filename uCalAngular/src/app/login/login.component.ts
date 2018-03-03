import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenHandlerService } from '../token-handler/token-handler.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  err: string;
  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private tokenHandler: TokenHandlerService) {
    this.createForm();
  }
  createForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }
  onSubmit() {
    let email = this.loginForm.get('email').value;
    let password = this.loginForm.get('password').value;
    const headers = new HttpHeaders().set('responseType', 'text');
    const body = new HttpParams()
      .set('email', email)
      .set('password', password);
    this.http.post('/login', body)
      .subscribe((obj: any) => {
        this.tokenHandler.setToken(obj.token);
        this.router.navigate(['/calendar']);
      }, err => this.err = err.error);
  }

  register() {
    let email = this.loginForm.get('email').value;
    let password = this.loginForm.get('password').value;
    const headers = new HttpHeaders().set('responseType', 'text');
    const body = new HttpParams()
      .set('email', email)
      .set('password', password);
    this.http.post('/signup', body)
      .subscribe((obj: any) => {
        this.tokenHandler.setToken(obj.token);
        this.router.navigate(['/calendar']);
      }, err => this.err = err.error);
  }
  ngOnInit() {
  }

}
