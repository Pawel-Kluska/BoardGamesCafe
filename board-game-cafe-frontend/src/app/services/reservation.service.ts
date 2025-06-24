import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id?: number;
  email: string;
  tableId: number;
  gameId: number;
  date: string;        // Format: 'yyyy-MM-dd'
  startTime: string;   // Format: 'HH:mm:ss'
  endTime: string;     // Format: 'HH:mm:ss'
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED'; // adjust if more
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private readonly baseUrl = 'http://localhost:8083/reservation';

  constructor(private http: HttpClient) {}
  
  getReservations(params: { email?: string; date?: string }): Observable<Reservation[]> {
    let httpParams = new HttpParams();
    if (params.email) {
      httpParams = httpParams.set('email', params.email);
    } else if (params.date) {
      httpParams = httpParams.set('date', params.date);
    }
    return this.http.get<Reservation[]>(this.baseUrl, { params: httpParams });
  }

  addReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.baseUrl, reservation);
  }

  updateReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(this.baseUrl, reservation);
  }

  deleteReservation(reservation: Reservation): Observable<void> {
    return this.http.request<void>('delete', this.baseUrl, { body: reservation });
  }
}