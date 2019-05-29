import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { UserMeetingComponent } from './user-meeting/user-meeting.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild([
      {path : 'admin/home', component : AdminHomeComponent},
      {path:'admin/meeting/:userId',component : UserMeetingComponent}
    ]),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FlatpickrModule.forRoot(),
    NgbModule
  ],
  declarations: [AdminHomeComponent, UserMeetingComponent]
})
export class AdminModule { }
