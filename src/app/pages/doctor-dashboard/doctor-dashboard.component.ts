import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit {

  activeTab: string = 'profile';
  username: string = '';
  profile: any = null;
  appointments: any[] = [];

  private apiUrl = 'https://localhost:7035/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Check token
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Decode token to get username
    const payload = JSON.parse(atob(token.split('.')[1]));
    this.username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    // Load data
    this.loadProfile();
    this.loadAppointments();
  }

  // Get auth headers
  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Load doctor profile
  loadProfile() {
    this.http.get<any>(`${this.apiUrl}/doctors/my-profile`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.profile = data,
        error: (err) => console.error('Error loading profile', err)
      });
  }

  // Load doctor appointments
  loadAppointments() {
    this.http.get<any[]>(`${this.apiUrl}/appointments/doctor-appointments`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.appointments = data,
        error: (err) => console.error('Error loading appointments', err)
      });
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}