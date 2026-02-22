import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from "@angular/forms"; 
import { Router } from '@angular/router'; 
import { AuthenticationService } from '../services/authentication'; 
import { User } from '../models/user'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {

  // Variables to manage form state and data
  public formError: string = ''; 
  public submitted = false; 

  public credentials = { 
    name: '', 
    email: '', 
    password: '' 
  };

  // Inject Router and AuthenticationService
  constructor( 
    private router: Router, 
    private authenticationService: AuthenticationService 
  ) { } 

  ngOnInit(): void { 
  } 

  /**
   * Validates form data before attempting login.
   * Ensures email, password, and name are present.
   */
  public onLoginSubmit(): void { 
    this.formError = ''; 
    if (!this.credentials.email || !this.credentials.password || !this.credentials.name) { 
      this.formError = 'All fields are required, please try again'; 
      this.router.navigateByUrl('#'); // Return to login page
    } else { 
      this.doLogin(); 
    } 
  } 

  /**
   * Processes the login via the AuthenticationService.
   * Handles asynchronous redirection after verification.
   */
  private doLogin(): void { 
    let newUser = { 
      name: this.credentials.name, 
      email: this.credentials.email 
    } as User; 

    // Delegate authentication to the service
    this.authenticationService.login(newUser, this.credentials.password); 

    // Check if logged in immediately
    if (this.authenticationService.isLoggedIn()) { 
      this.router.navigate(['']); // Redirect to trip list
    } else { 
      // Pause for 3 seconds to allow for asynchronous communication
      setTimeout(() => { 
        if (this.authenticationService.isLoggedIn()) { 
          this.router.navigate(['']); 
        }
      }, 3000); 
    } 
  }
}
