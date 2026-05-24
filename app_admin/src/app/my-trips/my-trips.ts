import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripData } from '../services/trip-data';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-trips.html',
  styleUrls: ['./my-trips.css']
})
export class MyTrips implements OnInit {

  trips: any[] = [];

  constructor(private tripService: TripData) {}

  ngOnInit(): void {
    this.tripService.getTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
      },
      error: (err) => {
        console.error('Error loading trips', err);
      }
    });
  }
}
