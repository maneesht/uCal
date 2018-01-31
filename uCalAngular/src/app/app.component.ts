import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  viewDate = Date.now();
  view = 'month';
  handleDay(day) {
    this.viewDate = day.date;
  }
  setView(view){
    this.view = view;
  }
}
