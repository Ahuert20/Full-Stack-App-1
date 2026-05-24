import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Trip } from '../models/trip';
import { AuthenticationService } from '../services/authentication';
import { TripData } from '../services/trip-data';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css'
})
export class TripCard implements OnInit {

  @Input('trip') trip!: Trip;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private tripData: TripData
  ) {}

  ngOnInit(): void {}

  // Check login status
  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  // Admin edit
  public editTrip(trip: Trip) {
    localStorage.removeItem('tripCode');
    localStorage.setItem('tripCode', trip.code);
    this.router.navigate(['edit-trip']);
  }

  // Book Trip
  public bookTrip(tripId: string): void {
    this.tripData.bookTrip(tripId).subscribe({
      next: () => {
        alert('Trip booked successfully!');
      },
      error: (err) => {
        console.error(err);
        alert('Booking failed. Please log in.');
      }
    });
  }

  // Delete Trip (Admin)
  public deleteTrip(trip: Trip): void {
    if (confirm("Are you sure you want to delete this trip?")) {
      this.tripData.deleteTrip(trip.code).subscribe({
        next: () => {
          alert("Trip deleted successfully.");
          window.location.reload();
        },
        error: (err) => {
          console.error(err);
          alert("Delete failed.");
        }
      });
    }
  }
}