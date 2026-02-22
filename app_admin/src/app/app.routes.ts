import { Routes } from '@angular/router';
import { AddTrip } from './add-trip/add-trip';
import { TripListing } from './trip-listing/trip-listing';
import { EditTrip } from './edit-trip/edit-trip';
import { LoginComponent } from './login/login'

export const routes: Routes = [
  { path: 'add-trip', component: AddTrip },
  { path: '', component: TripListing, pathMatch: 'full' }, // Added comma here
  { path: 'login', component: LoginComponent },
  { path: 'edit-trip', component: EditTrip }
];

