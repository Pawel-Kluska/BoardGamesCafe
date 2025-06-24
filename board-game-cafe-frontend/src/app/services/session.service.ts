import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SessionUser {
  id?: number;
  email: string;
}

export interface Session {
  id?: number;
  gameId: number;
  tableId: number;
  date: string; // format: 'YYYY-MM-DD'
  startTime: string; // format: 'HH:mm'
  endTime: string;   // format: 'HH:mm'
  sessionUsers?: SessionUser[];
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly baseUrl = 'http://localhost:8084/sessions';

  constructor(private http: HttpClient) {}

  /**
   * Get sessions by email or date.
   */
  getSessions(params: { email?: string; date?: string }): Observable<Session[]> {
    let httpParams = new HttpParams();
    if (params.email) {
      httpParams = httpParams.set('email', params.email);
    } else if (params.date) {
      httpParams = httpParams.set('date', params.date);
    }
    return this.http.get<Session[]>(this.baseUrl, { params: httpParams });
  }

  /**
   * Add a new session (POST).
   */
  addSession(session: Session): Observable<Session> {
      const sessionTemp: Session = {
        id: session.id,
        gameId: session.gameId,
        tableId: session.tableId,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        sessionUsers: session.sessionUsers
      };
    return this.http.post<Session>(this.baseUrl,  sessionTemp , {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Delete a session (DELETE with path and email param).
   */
  deleteSession(sessionId: number, email: string): Observable<void> {
    const params = new HttpParams().set('email', email);
    return this.http.delete<void>(`${this.baseUrl}/${sessionId}`, { params });
  }
}