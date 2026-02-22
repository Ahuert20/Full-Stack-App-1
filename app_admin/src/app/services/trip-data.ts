import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Trip } from '../models/trip';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { BROWSER_STORAGE } from '../storage';

@Injectable({
  providedIn: 'root'
})
export class TripData {

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) { }

  private baseUrl = 'http://localhost:3000/api';

  // --- Trip Management Methods ---

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.baseUrl}/trips`);
  }

  addTrip(formData: Trip): Observable<Trip> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.storage.getItem('travlr-token')}`
      })
    };
    return this.http.post<Trip>(`${this.baseUrl}/trips`, formData, httpOptions);
  }

  getTrip(tripCode: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.baseUrl}/trips/${tripCode}`);
  }

  updateTrip(formData: Trip): Observable<Trip> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.storage.getItem('travlr-token')}`
      })
    };
    return this.http.put<Trip>(`${this.baseUrl}/trips/${formData.code}`, formData, httpOptions);
  }

  // --- Authentication Methods ---

  // Call to our /login endpoint, returns JWT 
  public login(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('login', user, passwd);
  }

  // Call to our /register endpoint, creates user and returns JWT 
  public register(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('register', user, passwd);
  }

  // Helper method to process both login and register methods 
  private handleAuthAPICall(endpoint: string, user: User, passwd: string): Observable<AuthResponse> {
    const formData = {
      name: user.name,
      email: user.email,
      password: passwd
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/${endpoint}`, formData);
  }
}


