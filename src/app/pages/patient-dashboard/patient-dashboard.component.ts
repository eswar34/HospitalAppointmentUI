import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit {

  // Active tab
  activeTab: string = 'doctors';

  // User info
  username: string = '';

  // Doctors list
  doctors: any[] = [];

  // Appointments list
  appointments: any[] = [];

  // Book appointment fields
  selectedDoctorId: number | string = '';
  appointmentDate: string = '';
  notes: string = '';

  successMessage: string = '';
  errorMessage: string = '';

  private apiUrl = 'https://localhost:7035/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Get username from token
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Decode token to get username
    const payload = JSON.parse(atob(token.split('.')[1]));
    this.username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    // Load doctors
    this.loadDoctors();
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

  // Load my appointments
 loadAppointments() {
  this.http.get<any[]>(`${this.apiUrl}/appointments/my-appointments`,
    { headers: this.getHeaders() })
    .subscribe({
      next: (data) => this.appointments = data,
      error: (err) => console.error('Error loading appointments', err)
    });
}

  // Select doctor from card and go to book tab
  selectDoctor(doctor: any) {
    this.selectedDoctorId = doctor.id;
    this.activeTab = 'book';
  }

  // Book appointment
  bookAppointment() {
  if (!this.selectedDoctorId || !this.appointmentDate) {
    this.errorMessage = 'Please select a doctor and date.';
    return;
  }

  const body = {
    doctorId: this.selectedDoctorId,
    appointmentDate: new Date(this.appointmentDate).toISOString(),
    notes: this.notes
  };

  this.http.post(`${this.apiUrl}/appointments`, body, {
    headers: this.getHeaders(),
    responseType: 'text' // ✅ Expect plain text response
  })
    .subscribe({
      next: (response) => {
        this.successMessage = response; // ✅ "Appointment booked successfully!"
        this.errorMessage = '';
        this.selectedDoctorId = '';
        this.appointmentDate = '';
        this.notes = '';
        this.loadAppointments();
      },
      error: (err) => {
        this.errorMessage = 'Booking failed. Please try again.';
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