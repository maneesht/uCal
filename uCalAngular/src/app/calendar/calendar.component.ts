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
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpParams } from '@angular/common/http';

import { switchMap, concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { CalendarEventAction } from 'angular-calendar';
import { CalendarService } from './calendar.service';

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
  activeDayIsOpen: boolean = false;
  eventName: string;
  defaultStartDate: string;
  defaultEndDate: string;
  addEventError: string;
  startTime: string;
  endTime: string;
  calendarIdObservable: Observable<any>;
  events: CalendarEvent[] = [];

  refresh: Subject<any> = new Subject();
  constructor(private modalService: NgbModal, private calendarService: CalendarService) { }
  closeResult: string;

  open(content) {
    this.modalService.open(content).result.then((result) => {
    }, (reason) => {
    });
  }
  actions: CalendarEventAction[] = [
    {
    label: '<button class="btn btn-danger">X</button>',
    onClick: ({event}: {event: CalendarEvent }): void => {
      let index = this.events.indexOf(event);
      this.calendarIdObservable.subscribe(calendars => {
        this.calendarService.deleteEvent(String(event.id), calendars[0]._id).subscribe(() => {
          this.events = this.events.filter(e => e !== event);
        });
      })
      }
    }
  ];

  setUpDates(date: Date) {
    if(!date || date.toDateString() === "Invalid Date") {
      return false;
    }
    let month: string;
    let day: string;
    let m = date.getMonth() + 1;
    let d = date.getDate();
    if (m < 10) {
      month = "0" + m;
    } else {
      month = m + "";
    }
    if (d < 10) {
      day = "0" + d;
    } else {
      day = d + "";
    }
    this.defaultStartDate = date.getFullYear() + "-" + month + "-" + day;
    this.defaultEndDate = date.getFullYear() + "-" + month + "-" + day;
    return true;
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  addEvent() {
    let startHours = this.startTime.split(":");
    let endHours = this.endTime.split(":");
    let start = this.defaultStartDate;
    let end = this.defaultEndDate;
    let eventStartDate = new Date(start);
    let eventEndDate = new Date(end);
    eventStartDate.setHours(+startHours[0], +startHours[1]);
    eventStartDate.setDate(eventStartDate.getDate() + 1);
    eventEndDate.setHours(+endHours[0], +endHours[1]);
    eventEndDate.setDate(eventEndDate.getDate() + 1);
    this.addEventError = '';
    if(eventEndDate.getTime() < eventStartDate.getTime()) {
      this.addEventError = 'Start Date needs to be before End Date';
      return false;
    }
    this.calendarIdObservable.subscribe(calendars => {
      let defaultCalendar = calendars[0]._id;
      let submitEvent = {
        name: this.eventName, 
        date: {day: eventStartDate.getDate(), month: eventStartDate.getMonth(), year: eventStartDate.getFullYear() }, 
        allDay: false,
        startTime: {hour: eventStartDate.getHours(), minute: eventStartDate.getMinutes(), year: eventStartDate.getFullYear(), month: eventStartDate.getMonth(), day: eventStartDate.getDate()},
        endTime: { hour: eventEndDate.getHours(), minute: eventEndDate.getMinutes(), year: eventEndDate.getFullYear(), month: eventEndDate.getMonth(), day: eventEndDate.getDate() },
        location: {name: 'Lawson', activated: true},
        rsvp: { activated: false },
        description: "",
        calendar: defaultCalendar
      };
        this.calendarService.createEvent(submitEvent).subscribe(data => {
        this.events.push({ id: data['_id'], start: eventStartDate, end: eventEndDate, title: this.eventName, color: { primary: "blue", secondary: "lightblue" }, actions: this.actions });
        this.refresh.next();
      }, error => this.addEventError = error);
    });
  }
  
  
  ngOnInit() {
    //this.calendarIdObservable = this.calendarService.getCalendarIDs();
    this.calendarService.getEvents().subscribe(data => {
      let defaultCalendar = data[0];
      let events: any[] = defaultCalendar['events'];
      let modifiedEvents: CalendarEvent[] = events.map(event => {
        return {
          start: new Date(event.startTime.year, event.startTime.month, event.startTime.day, event.startTime.hour, event.startTime.minute),
          id: event._id,
          title: event.name,
          actions: this.actions,
          color: { primary: "blue", secondary: "lightblue" },
          end: new Date(event.endTime.year, event.endTime.month, event.endTime.day, event.endTime.hour, event.endTime.minute)
        }
      });
      this.events = modifiedEvents;
    });
  }
  viewDate: Date = new Date();
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
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
  setView(view) {
    this.view = view;
  }
}
