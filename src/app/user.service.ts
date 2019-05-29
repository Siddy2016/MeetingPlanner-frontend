import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Cookie } from 'ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://api.meetingplanner.ml/api/v1/users'
  constructor(private http : HttpClient) { }

  public setUserInfoInLocalStorage = (data) =>{
    localStorage.setItem('userInfo',JSON.stringify(data))
  }

  public getUserInfoInLocalStorage = () =>{
    return JSON.parse(localStorage.getItem('userInfo'))
  }

  public signupFunction(data): Observable<any> {
    const params = new HttpParams()
    .set('firstName',data.firstName)
    .set('lastName',data.lastName)
    .set('email',data.email)
    .set('password',data.password)
    .set('userName',data.userName)
    .set('countryCode',data.countryCode)
    .set('mobileNumber',data.mobileNumber);
    return this.http.post(`${this.baseUrl}/signup`,params)
  }

  public activateUser(data): Observable<any> {
    const params = new HttpParams()
    .set('activateToken',data.activateUserToken)
    return this.http.post(`${this.baseUrl}/activate`,params)
  }

  public loginFunction(data): Observable<any> {
    const params = new HttpParams()
    .set('email',data.email)
    .set('password',data.password)
    return this.http.post(`${this.baseUrl}/login`,params)
  }

  public validateUserEmail(data): Observable<any> {
    const params = new HttpParams()
    .set('email',data.email)
    return this.http.post(`${this.baseUrl}/forgot`,params)
  }

  public resetPassword(data): Observable<any> {
    const params = new HttpParams()
    .set('password',data.password)
    .set('resetPasswordToken',data.resetPasswordToken)
    return this.http.post(`${this.baseUrl}/reset`,params)
  }

  public logout(data):Observable<any>{
    const params = new HttpParams()
    .set('userId',data.userId)
    return this.http.post(`${this.baseUrl}/logout?authToken=${Cookie.get('authToken')}`,params)
  }

  public getUser(userId):Observable<any>{
    return this.http.get(`${this.baseUrl}/user/${userId}?authToken=${Cookie.get('authToken')}`)
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  } 
}
