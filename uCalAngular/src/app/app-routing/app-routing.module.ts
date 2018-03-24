import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarComponent } from '../calendar/calendar.component';
import { LoginComponent } from '../login/login.component';
import { GroupComponent } from '../group/group.component';
import { LoginSuccessComponent } from '../login-success/login-success.component';
import { AuthGuardService } from '../auth/auth-guard.service';
import { SettingsComponent } from '../settings/settings.component';
import { GroupDetailComponent } from '../group-detail/group-detail.component';

const routes: Routes = [
  { path: "settings", component: SettingsComponent },
  { path: "group", component: GroupComponent, canActivate: [AuthGuardService],
  children: [
    { path: 'detail/:id', component: GroupDetailComponent }
  ] },
  { path: "login", component: LoginComponent },
  { path: "calendar", component: CalendarComponent, canActivate: [AuthGuardService] },
  { path: "login-success", component: LoginSuccessComponent },
  { path: "", redirectTo: "calendar", pathMatch: "full" },
  { path: "**", redirectTo: "calendar" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
