import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CalendarComponent} from '../calendar/calendar.component';
import {LoginComponent} from '../login/login.component';
import {GroupComponent} from '../group/group.component';
import {EventsComponent} from '../events/events.component';

const routes: Routes = [
  {path: "events", component: EventsComponent},
  {path: "group", component: GroupComponent},
  {path: "login", component: LoginComponent},
  {path: "calendar", component: CalendarComponent},
  {path: "", redirectTo: "calendar", pathMatch: "full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
