import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from 'angular-calendar';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from './app.component';
import {AppRoutingModule} from './app-routing/app-routing.module';

import { environment } from '../environments/environment';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CalendarComponent } from './calendar/calendar.component';
import { LoginComponent } from './login/login.component';
import { GroupComponent } from './group/group.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TokenHandlerService } from './token-handler/token-handler.service';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { AuthGuardService } from './auth/auth-guard.service';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@auth0/angular-jwt';
import { HttpClientModule } from '@angular/common/http';

import { SettingsComponent } from './settings/settings.component';
import { HoverEventDirective } from './calendar/directives/hover-event.directive';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { GroupService } from './group/group.service';
import { tokenGetter } from './token-handler/token-getter';
import { CalendarComponentStub } from './login-success/calendar.component.stub';
import { CalendarService } from './calendar/calendar.service';
import { ProfileService } from './settings/profile.service';
import { GroupInvitesComponent } from './group-invites/group-invites.component';


@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    CalendarComponent,
    CalendarComponentStub,
    LoginComponent,
    GroupComponent,
    LoginSuccessComponent,
    SettingsComponent,
    HoverEventDirective,
    GroupDetailComponent,
    GroupInvitesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    CalendarModule.forRoot(),
    NgbModule.forRoot(),
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        headerName: 'x-access-token',
        whitelistedDomains: ['localhost:3000', 'localhost:4200', 'https://ucal-purdue.herokuapp.com']
      }
    }),
    AppRoutingModule
  ],
  providers: [TokenHandlerService, AuthGuardService, AuthService, GroupService, CalendarService, ProfileService],
  bootstrap: [AppComponent]
})
export class AppModule { }
