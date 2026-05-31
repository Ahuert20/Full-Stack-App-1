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

  // Book a trip
  bookTrip(tripId: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.storage.getItem('travlr-token')}`
      })
    };

    return this.http.post(
      `${this.baseUrl}/trips/${tripId}/book`,
      {},
      httpOptions
    );
  }

  // Delete trip (Admin)
  deleteTrip(tripCode: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.storage.getItem('travlr-token')}`
      })
    };

    return this.http.delete(
      `${this.baseUrl}/trips/${tripCode}`,
      httpOptions
    );
  }

  // Get logged-in user's trips (Itinerary)
  getMyTrips(): Observable<Trip[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.storage.getItem('travlr-token')}`
      })
    };

    return this.http.get<Trip[]>(
      `${this.baseUrl}/my-trips`,
      httpOptions
    );
  }

  // Search trips
  searchTrips(location?: string, minPrice?: number, maxPrice?: number): Observable<Trip[]> {

    let queryParams: string[] = [];

    if (location) queryParams.push(`location=${location}`);
    if (minPrice !== undefined) queryParams.push(`minPrice=${minPrice}`);
    if (maxPrice !== undefined) queryParams.push(`maxPrice=${maxPrice}`);

    const queryString = queryParams.length > 0
      ? '?' + queryParams.join('&')
      : '';

    return this.http.get<Trip[]>(
      `${this.baseUrl}/trips${queryString}`
    );
  }

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.baseUrl}/trips`);
  }

  addTrip(formData: Trip): Observable<Trip> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.storage.getItem('travlr-token')}`
      })
    };

    return this.http.post<Trip>(
      `${this.baseUrl}/trips`,
      formData,
      httpOptions
    );
  }

  getTrip(tripCode: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(
      `${this.baseUrl}/trips/${tripCode}`
    );
  }

  updateTrip(formData: Trip): Observable<Trip> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.storage.getItem('travlr-token')}`
      })
    };

    return this.http.put<Trip>(
      `${this.baseUrl}/trips/${formData.code}`,
      formData,
      httpOptions
    );
  }

  public login(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('login', user, passwd);
  }

  public register(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('register', user, passwd);
  }

  private handleAuthAPICall(endpoint: string, user: User, passwd: string): Observable<AuthResponse> {
    const formData = {
      name: user.name,
      email: user.email,
      password: passwd
    };

    return this.http.post<AuthResponse>(
      `${this.baseUrl}/${endpoint}`,
      formData
    );
  }
}


