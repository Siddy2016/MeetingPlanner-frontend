import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ResetComponent } from './reset/reset.component';
import { ActivateComponent } from './activate/activate.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild([
      {path:'', redirectTo:'login',pathMatch:'full'},
      {path:'login',component:LoginComponent},
      {path:'signup',component:SignupComponent},
      {path:'activate',component:ActivateComponent},
      {path:'home',component:HomeComponent},
      {path:'forgot',component:ForgotComponent},
      {path:'reset',component:ResetComponent}
    ]),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot()

  ],
  declarations: [SignupComponent, LoginComponent, ForgotComponent, ResetComponent, ActivateComponent, HomeComponent]
})
export class UserModule { }
