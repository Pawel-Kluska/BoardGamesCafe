import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { SessionService, Session } from '../services/session.service';
import { AdminService, Table, Game } from '../services/admin.service';
import { KeycloakService } from 'keycloak-angular';
import { formatDate } from '@angular/common';
import { Reservation, ReservationService } from '../services/reservation.service';

@Component({
  selector: 'app-create-session',
  templateUrl: './session-create.component.html',
  styleUrls: ['./session-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule
  ]
})
export class SessionCreateComponent {
  selectedDate: Date | null = null;
  selectedTableId: number | null = null;
  selectedGameId: number | null = null;
  selectedStartTime: string | null = null;
  selectedEndTime: string | null = null;

  allSessions: Session[] = [];
  allReservations: Reservation[] = [];
  availableTables: Table[] = [];
  availableGames: Game[] = [];

  startTimes: string[] = [];
  endTimes: string[] = [];

  reservationService = inject(ReservationService);
  constructor(
    private sessionService: SessionService,
    private adminService: AdminService,
    private keycloakService: KeycloakService
  ) {}

  onDateChange(date: Date): void {
      this.selectedDate = date;
      const formattedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
  
      this.reservationService.getReservations({ date: formattedDate }).subscribe(reservations => {
        this.allReservations = reservations;
  
        this.adminService.getAllGamesAndTables().subscribe(data => {
          const workingHours = this.generateTimeSlots('10:00', '22:00', 30); // helper below
  
          // Filter tables with at least 1 free slot
          this.availableTables = data.tables.filter(table => {
            const tableReservations = reservations.filter(r => r.tableId === table.id);
            return this.hasFreeSlot(workingHours, tableReservations);
          });
  
          // Filter games with at least 1 free slot
          this.availableGames = data.games.filter(game => {
            const gameReservations = reservations.filter(r => r.gameId === game.id);
            return this.hasFreeSlot(workingHours, gameReservations);
          });
        });
      });
    }
    generateTimeSlots(start: string, end: string, interval: number): string[] {
      const slots: string[] = [];
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
  
      let current = new Date();
      current.setHours(startHour, startMin, 0, 0);
      const endTime = new Date();
      endTime.setHours(endHour, endMin, 0, 0);
  
      while (current < endTime) {
        slots.push(current.toTimeString().slice(0, 5));
        current.setMinutes(current.getMinutes() + interval);
      }
  
      return slots;
    }
    hasFreeSlot(slots: string[], reservations: Reservation[]): boolean {
      for (let i = 0; i < slots.length - 1; i++) {
        const slotStart = slots[i];
        const slotEnd = slots[i + 1];
  
        const isOverlapping = reservations.some(res =>
          !(res.endTime <= slotStart || res.startTime >= slotEnd)
        );
  
        if (!isOverlapping) {
          return true; // Found a free 30-min window
        }
      }
      return false;
    }
  
    onSelectionChange(): void {
      if (this.selectedTableId && this.selectedGameId && this.selectedDate) {
        const dateStr = formatDate(this.selectedDate, 'yyyy-MM-dd', 'en-US');
  
        const relevant = this.allReservations.filter(r =>
          r.date === dateStr &&
          r.tableId === this.selectedTableId &&
          r.gameId === this.selectedGameId
        );
  
        this.startTimes = this.generateAvailableTimeSlots(relevant);
        this.endTimes = [];
        this.selectedStartTime = null;
        this.selectedEndTime = null;
      }
    }
  
    onStartTimeChange(): void {
      if (this.selectedStartTime) {
        const startIdx = this.startTimes.indexOf(this.selectedStartTime);
        this.endTimes = this.startTimes.slice(startIdx + 1, startIdx + 5); // Next 4 slots after selected start time
      }
    }
  
    generateAvailableTimeSlots(reservations: Reservation[]): string[] {
      const slots: string[] = [];
      const startHour = 10;
      const endHour = 23;
  
      for (let hour = startHour; hour < endHour; hour++) {
        ['00', '30'].forEach(min => {
          slots.push(`${hour.toString().padStart(2, '0')}:${min}`);
        });
      }
  
      const reservedPairs = reservations.map(r => ({
        start: r.startTime,
        end: r.endTime,
      }));
  
      return slots.filter(time => {
        const timeDate = this.parseTime(time);
        return !reservedPairs.some(res =>
          timeDate >= this.parseTime(res.start) && timeDate < this.parseTime(res.end)
        );
      });
    }
  
    private parseTime(t: string): number {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    }
    
  // onDateChange(date: Date): void {
  //   this.selectedDate = date;
  //   const formattedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');

  //   this.sessionService.getSessions({ date: formattedDate }).subscribe(sessions => {
  //     this.allSessions = sessions;

  //     this.adminService.getAllGamesAndTables().subscribe(data => {
  //       const timeSlots = this.generateTimeSlots('10:00', '22:00', 30);

  //       this.availableTables = data.tables.filter(table => {
  //         const tableSessions = sessions.filter(s => s.tableId === table.id);
  //         return this.hasFreeSlot(timeSlots, tableSessions);
  //       });

  //       this.availableGames = data.games.filter(game => {
  //         const gameSessions = sessions.filter(s => s.gameId === game.id);
  //         return this.hasFreeSlot(timeSlots, gameSessions);
  //       });
  //     });
  //   });
  // }

  // generateTimeSlots(start: string, end: string, interval: number): string[] {
  //   const slots: string[] = [];
  //   const [startHour, startMin] = start.split(':').map(Number);
  //   const [endHour, endMin] = end.split(':').map(Number);

  //   let current = new Date();
  //   current.setHours(startHour, startMin, 0, 0);
  //   const endTime = new Date();
  //   endTime.setHours(endHour, endMin, 0, 0);

  //   while (current < endTime) {
  //     slots.push(current.toTimeString().slice(0, 5));
  //     current.setMinutes(current.getMinutes() + interval);
  //   }

  //   return slots;
  // }

  // hasFreeSlot(slots: string[], sessions: Session[]): boolean {
  //   for (let i = 0; i < slots.length - 1; i++) {
  //     const slotStart = slots[i];
  //     const slotEnd = slots[i + 1];

  //     const isOverlapping = sessions.some(s =>
  //       !(s.endTime <= slotStart || s.startTime >= slotEnd)
  //     );

  //     if (!isOverlapping) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // onSelectionChange(): void {
  //   if (this.selectedDate && this.selectedTableId && this.selectedGameId) {
  //     const dateStr = formatDate(this.selectedDate, 'yyyy-MM-dd', 'en-US');

  //     const relevant = this.allSessions.filter(s =>
  //       s.date === dateStr &&
  //       s.tableId === this.selectedTableId &&
  //       s.gameId === this.selectedGameId
  //     );

  //     this.startTimes = this.generateAvailableTimeSlots(relevant);
  //     this.endTimes = [];
  //     this.selectedStartTime = null;
  //     this.selectedEndTime = null;
  //   }
  // }

  // onStartTimeChange(): void {
  //   if (this.selectedStartTime) {
  //     const startIdx = this.startTimes.indexOf(this.selectedStartTime);
  //     this.endTimes = this.startTimes.slice(startIdx + 1, startIdx + 5);
  //   }
  // }

  // generateAvailableTimeSlots(sessions: Session[]): string[] {
  //   const slots: string[] = [];
  //   for (let hour = 10; hour < 23; hour++) {
  //     ['00', '30'].forEach(min => {
  //       slots.push(`${hour.toString().padStart(2, '0')}:${min}`);
  //     });
  //   }

  //   const blocked = sessions.map(s => ({
  //     start: this.parseTime(s.startTime),
  //     end: this.parseTime(s.endTime),
  //   }));

  //   return slots.filter(time => {
  //     const t = this.parseTime(time);
  //     return !blocked.some(b => t >= b.start && t < b.end);
  //   });
  // }

  // private parseTime(t: string): number {
  //   const [h, m] = t.split(':').map(Number);
  //   return h * 60 + m;
  // }

  async onSubmit(): Promise<void> {
    if (
      this.selectedDate &&
      this.selectedTableId &&
      this.selectedGameId &&
      this.selectedStartTime &&
      this.selectedEndTime
    ) {
      const profile = await this.keycloakService.loadUserProfile();
      const email = profile.email;
      const formattedDate = formatDate(this.selectedDate, 'yyyy-MM-dd', 'en-US');

      const session: Session = {
        gameId: this.selectedGameId,
        tableId: this.selectedTableId,
        date: formattedDate,
        startTime: this.selectedStartTime,
        endTime: this.selectedEndTime,
        sessionUsers: [{
          id: undefined,
          email: email || ""
        }]
      };

      this.sessionService.addSession(session).subscribe(() => {
        console.log('Session created successfully');
        location.href = '/sessions';
      });
    }
  }
}