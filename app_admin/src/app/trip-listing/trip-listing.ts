import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { Trip } from '../models/trip'; 
import { TripCard } from '../trip-card/trip-card'; 
import { TripData } from '../services/trip-data'; 
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication';

@Component({ 
  selector: 'app-trip-listing', 
  standalone: true, 
  imports: [CommonModule, TripCard], 
  providers: [TripData], 
  templateUrl: './trip-listing.html', 
  styleUrl: './trip-listing.css' 
}) 
export class TripListing implements OnInit { 
  
  trips: Trip[] = []; 
  message: string = '';

  constructor(
    private tripData: TripData,
    private router: Router,
    private authenticationService: AuthenticationService,
    // Inject ChangeDetectorRef to solve the "click to show" issue
    private cd: ChangeDetectorRef
  ) { 
    console.log('trip-listing constructor'); 
  } 

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  private getStuff(): void { 
    this.tripData.getTrips() 
      .subscribe({ 
        next: (value: any) => { 
          this.trips = value; 
          if(value.length > 0) { 
            this.message = 'There are ' + value.length + ' trips available.'; 
          } else { 
            this.message = 'There were no trips retrieved from the database'; 
          }
          // Force Angular to detect the new trip data and update the HTML
          this.cd.detectChanges(); 
        }, 
        error: (error: any) => { 
          console.log('Error: ' + error); 
        } 
      }); 
  } 

  ngOnInit(): void { 
    this.getStuff(); 
  } 
}