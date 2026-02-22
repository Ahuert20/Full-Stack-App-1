import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripData } from './trip-data';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  // Variable to handle Authentication Responses 
  authResp: AuthResponse = new AuthResponse();

  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripData
  ) { }

  // Get our token from our Storage provider. 
  public getToken(): string {
    let out: any;
    out = this.storage.getItem('travlr-token');

    if (!out) {
      return '';
    }
    return out;
  }

  // Save our token to our Storage provider. 
  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
  }

  // Logout of our application and remove the JWT from Storage 
  public logout(): void {
    this.storage.removeItem('travlr-token');
  }

  // Boolean to determine if we are logged in and the token is still valid. 
  public isLoggedIn(): boolean {
    const token: string = this.getToken();
    if (token) {
      // Decode the payload from the JWT (the middle part)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > (Date.now() / 1000);
    } else {
      return false;
    }
  }

  // Retrieve the current user from the token payload. 
  public getCurrentUser(): User {
    if (this.isLoggedIn()) {
      const token: string = this.getToken();
      const { email, name } = JSON.parse(atob(token.split('.')[1]));
      return { email, name } as User;
    }
    return new User(); 
  }

  // Login method that leverages tripDataService
  public login(user: User, passwd: string): void {
    this.tripDataService.login(user, passwd)
      .subscribe({
        next: (value: AuthResponse) => {
          if (value && value.token) {
            this.saveToken(value.token);
          }
        },
        error: (error: any) => {
          console.log('Login Error: ' + error);
        }
      });
  }

  // Register method that leverages tripDataService
  public register(user: User, passwd: string): void {
    this.tripDataService.register(user, passwd)
      .subscribe({
        next: (value: AuthResponse) => {
          if (value && value.token) {
            this.saveToken(value.token);
          }
        },
        error: (error: any) => {
          console.log('Registration Error: ' + error);
        }
      });
  }
}
