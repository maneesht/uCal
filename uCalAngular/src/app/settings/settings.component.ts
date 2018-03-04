import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.interface';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: Observable<User>;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.user = this.http.get<User>('/current-user');
  }

}
