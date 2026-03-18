import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  // Common fields
  username: string = '';
  email: string = '';
  password: string = '';
  role: string = 'Patient';

  // Patient & Doctor fields
  fullName: string = '';
  phone: string = '';
  age: number = 0;
  specialization: string = '';

  successMessage: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Reset extra fields when role changes
  onRoleChange() {
    this.fullName = '';
    this.phone = '';
    this.age = 0;
    this.specialization = '';
  }

  register() {
  if (!this.username || !this.email || !this.password) {
    this.errorMessage = 'Please fill in all fields.';
    return;
  }

  const body: any = {
    username: this.username,
    email: this.email,
    password: this.password,
    role: this.role,
    fullName: this.fullName,
    phone: this.phone
  };

  if (this.role === 'Patient') body.age = this.age;
  if (this.role === 'Doctor') body.specialization = this.specialization;

  this.http.post(`https://localhost:7035/api/auth/register`, body, {
    responseType: 'text' // ✅ Expect plain text response
  })
    .subscribe({
      next: (response) => {
        this.successMessage = 'Registered successfully! Redirecting to login...';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        // ✅ Handle different error formats
        if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        this.successMessage = '';
      }
    });
}
  }
