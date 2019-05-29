import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private url = 'http://api.meetingplanner.ml'
  private socket;
  constructor() {
    this.socket = io(this.url)
   }
   
   public sendWelcomeEmail = (data) => {
    this.socket.emit('activate-email', data)
  }

  public sendPasswordResetEmail = (data) => {
    this.socket.emit('forgot-password', data)
  }
}
