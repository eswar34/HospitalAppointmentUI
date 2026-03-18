import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    // Validate fields
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const body = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('https://localhost:7035/api/auth/login', body)
      .subscribe({
        next: (response) => {
          // Save token to localStorage
          localStorage.setItem('token', response.token);

          // Decode token to get role
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

          // Navigate based on role
          if (role === 'Admin') this.router.navigate(['/admin-dashboard']);
          else if (role === 'Doctor') this.router.navigate(['/doctor-dashboard']);
          else if (role === 'Patient') this.router.navigate(['/patient-dashboard']);
        },
        error: (err) => {
          this.errorMessage = 'Invalid email or password.';
        }
      });
  }
}