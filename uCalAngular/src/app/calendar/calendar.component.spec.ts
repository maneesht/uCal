import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarComponent } from './calendar.component';
import { By } from '@angular/platform-browser';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'angular-calendar';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CalendarService } from './calendar.service';

describe('CalendarComponent', () => {
  let comp: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarComponent ],
      imports: [NgbModule, CalendarModule.forRoot(), FormsModule, BrowserAnimationsModule, HttpClientTestingModule, RouterTestingModule,
        NgbModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [CalendarService, NgbActiveModal]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });
  it('should render month/year in a h2 tag', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    let date = new Date();
    let month = date.toLocaleString('en-us', {month: 'long'});
    let year = date.getFullYear();
    expect(compiled.querySelector('h2').textContent).toContain(`${month} ${year}`);
  }));
  it('should update view when clicking on week', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // query selects week button by looking for input with the value of week
    const weekButton = fixture.debugElement.query(By.css('input[value="week"]'));
    weekButton.nativeElement.click();
    fixture.detectChanges();
    expect(comp.view).toEqual('week');
  }));
  it('should update view when clicking on day', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // query selects day button by looking for input with the value of day
    const dayButton = fixture.debugElement.query(By.css('input[value="day"]'));
    dayButton.nativeElement.click();
    fixture.detectChanges();
    expect(comp.view).toEqual('day');
  }));
  it('should update view when clicking on month', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // query selects month button by looking for input with the value of month
    const monthButton = fixture.debugElement.query(By.css('input[value="month"]'));
    monthButton.nativeElement.click();
    fixture.detectChanges();
    expect(comp.view).toEqual('month');
  }));
  it('should update the defaultStart date and end date', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    let today = new Date("January 11, 2018 13:31:00");
    let result = comp.setUpDates(today, today);
    expect(result).toBe(true);
    expect(comp.defaultStartDate).toEqual("2018-01-11");
  }));
  it('should not update the defaultStart date when undefined', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    let today = new Date("January 11, 2018 1:31:00PM");
    let result = comp.setUpDates(today, today);
    expect(result).toBe(false);
    expect(comp.defaultStartDate).toEqual(undefined);
  }));
  it('should not update the defaultStart date when undefined', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    let today;
    let result = comp.setUpDates(today, today);
    expect(result).toBe(false);
    expect(comp.defaultStartDate).toEqual(undefined);
  }));
  it('should give an error when start date is after end date', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    comp.startTime = "19:30";
    comp.endTime = "18:30";
    let date = "2018-02-18";
    comp.defaultStartDate = date;
    comp.defaultEndDate = date;
    comp.addEvent();
    expect(comp.addEventError).toEqual("Start Date needs to be before End Date");
  }));
});
