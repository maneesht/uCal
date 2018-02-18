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

interface ServerEvent {

  name: {
    type: String,
    required: true
  },
  date: {
    day: Number,
    month: Number,
    year: Number
  },
  allDay: Boolean,
  startTime: {
    day: Number,
    month: Number,
    year: Number,
    hour: Number,
    minute: Number
  },
  endTime: {
    day: Number,
    month: Number,
    year: Number,
    hour: Number,
    minute: Number
  },
  location: {
    name: String,
    longitude: Number,
    latitude: Number
  },
  description: String,
  owner: string,
  calendar: string,
  invites: string,
  rsvp: {
    required: false,
    accepted: string,
    declined: string,
    noResponse: string,
  }
}

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
  start: string;
  end: string;
  defaultStartDate: string;
  defaultEndDate: string;
  addEventError: string;
  eventStartDate: Date;
  eventEndDate: Date;
  startTime: string;
  endTime: string;
  calendarIdObservable: Observable<any>;
  events: CalendarEvent[] = [];

  refresh: Subject<any> = new Subject();
  constructor(private modalService: NgbModal, private http: HttpClient) { }
  closeResult: string;

  open(content) {
    this.modalService.open(content).result.then((result) => {
    }, (reason) => {
    });
  }
  addDates(date: Date) {
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
    this.start = this.defaultStartDate;
    this.end = this.defaultEndDate;
    this.eventStartDate = new Date(this.start);
    this.eventEndDate = new Date(this.end);
    this.eventStartDate.setHours(+startHours[0], +startHours[1]);
    this.eventStartDate.setDate(this.eventStartDate.getDate() + 1);
    this.eventEndDate.setHours(+endHours[0], +endHours[1]);
    this.eventEndDate.setDate(this.eventEndDate.getDate() + 1);
    let test = new Date(this.start);
    this.events.push({ start: this.eventStartDate, end: this.eventEndDate, title: this.eventName, color: { primary: "blue", secondary: "lightblue" } });
    let params = new HttpParams();
    this.addEventError = '';
    if(this.eventEndDate.getTime() < this.eventStartDate.getTime()) {
      this.addEventError = 'Start Date needs to be after End Date';
      return false;
    }
    this.calendarIdObservable.subscribe(calendars => {
      let defaultCalendar = calendars[0]._id;
      params = params
        .set('name', this.eventName)
        .set('date', JSON.stringify({ day: this.eventStartDate.getDate(), month: this.eventStartDate.getMonth(), year: this.eventStartDate.getFullYear() }))
        .set('allDay', 'false')
        .set('startTime', JSON.stringify({ hour: this.eventStartDate.getHours(), minute: this.eventStartDate.getMinutes(), year: this.eventStartDate.getFullYear(), month: this.eventStartDate.getMonth(), day: this.eventStartDate.getDate() }))
        .set('endTime', JSON.stringify({ hour: this.eventEndDate.getHours(), minute: this.eventEndDate.getMinutes(), year: this.eventEndDate.getFullYear(), month: this.eventEndDate.getMonth(), day: this.eventEndDate.getDate() }))
        .set('location', JSON.stringify({ location: 'Lawson' }))
        .set('description', 'I hate the backend team')
        .set('calendar', defaultCalendar);
      this.http.post(`/events/create`, params).subscribe(data => console.log(data));
      this.refresh.next();
    });
  }
  createHTTP(id) {
    return this.http.get(`/calendars/${id}`);
  }
  
  ngOnInit() {
    this.calendarIdObservable = this.http.get('/users/calendars/get');
    this.calendarIdObservable.mergeMap((calendar: any[]) => {
      let observable$ = calendar.map(calendar => this.createHTTP(calendar._id));
      return Observable.forkJoin(observable$);
    }).subscribe(data => {
      let defaultCalendar = data[0];
      let events: any[] = defaultCalendar['events'];
      let modifiedEvents: CalendarEvent[] = events.map(event => {
        return {
          start: new Date(event.startTime.year, event.startTime.month, event.startTime.day, event.startTime.hour, event.startTime.minute),
          title: event.name,
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
