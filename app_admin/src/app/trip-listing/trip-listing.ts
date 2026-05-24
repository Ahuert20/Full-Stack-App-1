import { Component, OnInit } from '@angular/core';
import { TripData } from '../services/trip-data';
import { Trip } from '../models/trip';
import { AuthenticationService } from '../services/authentication';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TripCard } from '../trip-card/trip-card';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TripCard],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css'
})
export class TripList implements OnInit {

  trips: Trip[] = [];

  location: string = '';
  minPrice?: number;
  maxPrice?: number;

  constructor(
    private tripData: TripData,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.loadTrips();
  }

 loadTrips() {
  this.tripData.getTrips().subscribe({
    next: (trips) => {
      console.log("Trips loaded:", trips);
      this.trips = trips;
    },
    error: (err) => {
      console.error("Initial load failed:", err);
    }
  });
}

  search() {
    this.tripData
      .searchTrips(this.location, this.minPrice, this.maxPrice)
      .subscribe(trips => {
        this.trips = trips;
      });
  }

  clearSearch() {
    this.location = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.loadTrips();
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  addTrip() {
    // your existing logic
  }
}