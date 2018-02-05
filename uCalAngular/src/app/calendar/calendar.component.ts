import { Component, OnInit } from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import { CalendarEvent, CalendarEventTitleFormatter } from 'angular-calendar';
import { CustomEventTitleFormatter } from './custom-event-title-formatter.provider';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [ 
    {
      start: new Date(2018, 1, 14, 13, 30),
      end: new Date(2018, 1, 15, 9, 30),
      title: 'Lunch with Manu',
      color: {primary: "blue", secondary: "lightblue"}
    }];
  constructor() { }

  ngOnInit() {
  }
  activeDayIsOpen: boolean = true;
  viewDate: Date = new Date();
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    console.log("yay");
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }
  title = 'app';
  view = 'month';
  handleDay(day) {
    this.viewDate = day.date;
  }
  setView(view){
    this.view = view;
  }
}
