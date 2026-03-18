import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  activeTab: string = 'doctors';

  doctors: any[] = [];
  patients: any[] = [];
  appointments: any[] = [];

  successMessage: string = '';
  errorMessage: string = '';

  // ✅ Add Doctor form object
  newDoctor = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    specialization: '',
    phone: '',
    role: 'Doctor'
  };

  // ✅ Separate messages for doctor form
  doctorSuccessMessage: string = '';
  doctorErrorMessage: string = '';

  private apiUrl = 'https://localhost:7035/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDoctors();
    this.loadPatients();
    this.loadAppointments();
  }

  // Get auth headers
  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Load all doctors
  loadDoctors() {
    this.http.get<any[]>(`${this.apiUrl}/doctors`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.doctors = data,
        error: (err) => console.error('Error loading doctors', err)
      });
  }

  // Load all patients
  loadPatients() {
    this.http.get<any[]>(`${this.apiUrl}/patients`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.patients = data,
        error: (err) => console.error('Error loading patients', err)
      });
  }

  // Load all appointments
  loadAppointments() {
    this.http.get<any[]>(`${this.apiUrl}/appointments`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.appointments = data,
        error: (err) => console.error('Error loading appointments', err)
      });
  }

  // ✅ Add new doctor
  addDoctor() {
    // Validate fields
    if (!this.newDoctor.username || !this.newDoctor.email ||
        !this.newDoctor.password || !this.newDoctor.fullName ||
        !this.newDoctor.specialization) {
      this.doctorErrorMessage = 'Please fill in all required fields.';
      return;
    }

    this.http.post(`${this.apiUrl}/auth/register`, this.newDoctor, {
      headers: this.getHeaders(),
      responseType: 'text'
    })
      .subscribe({
        next: (response) => {
          this.doctorSuccessMessage = 'Doctor added successfully!';
          this.doctorErrorMessage = '';

          // ✅ Reset form
          this.newDoctor = {
            username: '',
            email: '',
            password: '',
            fullName: '',
            specialization: '',
            phone: '',
            role: 'Doctor'
          };

          // ✅ Refresh doctors list
          this.loadDoctors();
        },
        error: (err) => {
          if (typeof err.error === 'string') {
            this.doctorErrorMessage = err.error;
          } else {
            this.doctorErrorMessage = 'Failed to add doctor. Please try again.';
          }
          this.doctorSuccessMessage = '';
        }
      });
  }

  // Update appointment status
  updateStatus(id: number, status: string) {
    const body = { status: status };

    this.http.put(`${this.apiUrl}/appointments/${id}`, body, {
      headers: this.getHeaders(),
      responseType: 'text'
    })
      .subscribe({
        next: (response) => {
          this.successMessage = response;
          this.errorMessage = '';
          this.loadAppointments();
        },
        error: (err) => {
          this.errorMessage = 'Failed to update status.';
          this.successMessage = '';
        }
      });
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
