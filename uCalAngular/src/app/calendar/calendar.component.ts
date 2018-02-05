import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
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
