import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = 'http://api.meetingplanner.ml'
  private socket;

  constructor() {
    this.socket = io(this.url)
  }


  // verify user on page load whether admin or user page
  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      });
    });
  }
  // gets emitted right after verify user (for user only)
  public setUser = (authToken) => {
    this.socket.emit("set-user", authToken);
  }

  // gets emitted right after verify admin only
  public setAdmin = (authToken) => {
    this.socket.emit("set-admin", authToken);
  }

  public createMeeting = (meeting) => {
    this.socket.emit("create-meeting", meeting)
  }

  public startRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('start-room', (data) => {
        observer.next(data);
      });
    });
  }

  public joinRoom = (userId) => {
    this.socket.emit('join-room', userId)
  }

  public updateMeetingDashboard = () => {
    return Observable.create((observer) => {
      this.socket.on('update-meeting', (data) => {
        data['data'].start = new Date(data['data'].start)
        data['data'].end = new Date(data['data'].end)
        observer.next(data);
      });
    });
  }

  public meetingReminder = (userId) =>{
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {
        observer.next(data);
      });
    });
  }

  public updateMeeting = (meeting) => {
    this.socket.emit('edit-meeting', meeting)
  }

  public deleteMeeting = (meeting) => {
    this.socket.emit('delete-meeting', meeting)
  }

  public deleteMeetingDashboard = () => {
    return Observable.create((observer) => {
      this.socket.on('delete-meeting', (data) => {
        observer.next(data);
      });
    });
  }

  public disconnect = () => {
    this.socket.disconnect()
  }

  // listening to auth error if authToken is incorrect
  public authError = () => {
    return Observable.create((observer) => {
      this.socket.on('auth-error', (data) => {
        observer.next(data);
      });
    });
  }
}
