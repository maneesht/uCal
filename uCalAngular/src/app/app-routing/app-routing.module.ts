import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CalendarComponent} from '../calendar/calendar.component';
import {LoginComponent} from '../login/login.component';
import {GroupComponent} from '../group/group.component';
import {EventsComponent} from '../events/events.component';
import { LoginSuccessComponent } from '../login-success/login-success.component';
import { AuthGuardService } from '../auth/auth-guard.service';

const routes: Routes = [
  {path: "events", component: EventsComponent, canActivate: [AuthGuardService]},
  {path: "group", component: GroupComponent, canActivate: [AuthGuardService]},
  {path: "login", component: LoginComponent},
  {path: "calendar", component: CalendarComponent, canActivate: [AuthGuardService]},
  {path: "login-success", component: LoginSuccessComponent},
  {path: "", redirectTo: "calendar", pathMatch: "full"},
  {path: "**", redirectTo: "calendar"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
