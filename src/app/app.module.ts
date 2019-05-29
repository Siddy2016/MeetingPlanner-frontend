import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {ToastrModule} from 'ngx-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlatpickrModule } from 'angularx-flatpickr';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { NotFoundModule } from './not-found/not-found.module';
import { UserService } from './user.service';
import { MeetingService } from './meeting.service';
//import  { SocketService } from './socket.service';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),
    FormsModule,
    HttpClientModule,
    UserModule,
    AdminModule,
    NotFoundModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FlatpickrModule.forRoot(),
    NgbModule
  ],
  providers: [UserService, MeetingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
