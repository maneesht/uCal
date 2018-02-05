import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarComponent } from './calendar.component';
import { By } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'angular-calendar';

describe('CalendarComponent', () => {
  let comp: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarComponent ],
      imports: [NgbModule, CalendarModule.forRoot()]
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
    // query selects month button by looking for parent div with mx-auto class and gets the button at index 1.
    // eventually should be changed since it's somewhat hardcoded
    const weekButton = fixture.debugElement.queryAll(By.css('div.mx-auto > button'))[1];
    weekButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(comp.view).toEqual('week');
  }));
  it('should update view when clicking on day', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // query selects month button by looking for parent div with mx-auto class and gets the button at index 1.
    // eventually should be changed since it's somewhat hardcoded
    const dayButton = fixture.debugElement.queryAll(By.css('div.mx-auto > button'))[2];
    dayButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(comp.view).toEqual('day');
  }));
  it('should update view when clicking on month', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    // query selects month button by looking for parent div with mx-auto class and gets the button at index 1.
    // eventually should be changed since it's somewhat hardcoded
    const monthButton = fixture.debugElement.queryAll(By.css('div.mx-auto > button'))[0];
    monthButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(comp.view).toEqual('month');
  }));
});
