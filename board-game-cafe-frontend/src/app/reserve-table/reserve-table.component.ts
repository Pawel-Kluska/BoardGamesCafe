import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService, Reservation } from '../services/reservation.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService, Game, Table } from '../services/admin.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-reserve-table',
  templateUrl: './reserve-table.component.html',
  styleUrls: ['./reserve-table.component.scss'],
  standalone: true,
  imports: [
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatOptionModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  ReactiveFormsModule,
  MatSnackBarModule,
  CommonModule,
  FormsModule,
  MatCardModule,
  MatIconModule,
  MatChipsModule,
  ]
})
export class ReserveTableComponent{
  selectedDate: Date | null = null;
  selectedTableId: number | null = null;
  selectedGameId: number | null = null;

  allReservations: Reservation[] = [];
  availableTables: Table[] = [];
  availableGames: Game[] = [];

  startTimes: string[] = [];
  endTimes: string[] = [];

  selectedStartTime: string | null = null;
  selectedEndTime: string | null = null;

  constructor(
    private reservationService: ReservationService,
    private adminService: AdminService,
    private keycloakService: KeycloakService,
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

  async onSubmit(): Promise<void> {
    if (this.selectedDate && this.selectedTableId && this.selectedGameId && this.selectedStartTime && this.selectedEndTime) {
      const profile = await this.keycloakService.loadUserProfile();
      const formattedDate = formatDate(this.selectedDate, 'yyyy-MM-dd', 'en-US');

      const reservation: Reservation = {
        email: profile.email || '',
        date: formattedDate,
        tableId: this.selectedTableId,
        gameId: this.selectedGameId,
        startTime: this.selectedStartTime,
        endTime: this.selectedEndTime,
        status: 'PENDING'
      };

      this.reservationService.addReservation(reservation).subscribe(() => {
        console.log('Reservation added successfully');
        location.href = '/reservations/user';
      });
    }
  }
}

