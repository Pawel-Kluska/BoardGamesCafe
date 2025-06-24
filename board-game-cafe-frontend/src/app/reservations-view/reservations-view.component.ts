import { Component, inject } from '@angular/core';
import { Reservation, ReservationService } from '../services/reservation.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { EditReservationDialogComponent } from '../edit-reservation-dialog/edit-reservation-dialog.component';
import { Table, Game, AdminService } from '../services/admin.service';
@Component({
  selector: 'app-reservations-view',
  imports: [    
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,    
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './reservations-view.component.html',
  styleUrl: './reservations-view.component.scss'
})
export class ReservationsViewComponent {

  displayedColumnsReservations = [
  'id',
  'date',
  'startTime',
  'endTime',
  'tableNumber',
  'gameName',
  'email',
  'status',
  'actions'
];
  filterDate: string = ''; // Format: 'yyyy-MM-dd'
  reservations: Reservation[] = []; 

  reservationsService = inject(ReservationService);
  adminService = inject(AdminService);
  dialog = inject(MatDialog);
  loadReservations(): void {
    if (!this.filterDate) {
      return;
    }
    this.reservationsService.getReservations({date: this.filterDate  }).subscribe(data => {
      this.reservations = data;
    });
  }

  onFilterDateChange(date: Date | null): void {
    if (!date) {
      return;
    }
    const formattedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.filterDate = formattedDate;
    this.applyDateFilter();
  }

  applyDateFilter(): void {
    if (!this.filterDate) {
      return;
    }
    this.loadReservations();
  }

  acceptReservation(reservation: Reservation) {
    reservation.status = 'CONFIRMED';
    this.reservationsService.updateReservation(reservation).subscribe(() => {
      this.loadReservations();
    });
  }
  openEditReservationDialog(reservation: Reservation) {
    var tables: Table[] = [];
    var games: Game[] = [];

    this.reservationsService.getReservations({ date: this.filterDate }).subscribe(reservations => {
      this.adminService.getAllGamesAndTables().subscribe(data => {
        const workingHours = this.generateTimeSlots('10:00', '23:00', 30); 

        // Filter tables with at least 1 free slot
        tables = data.tables.filter(table => {
          const tableReservations = reservations.filter(r => r.tableId === table.id);
          return this.hasFreeSlot(workingHours, tableReservations);
        });

        // Filter games with at least 1 free slot
        games = data.games.filter(game => {
          const gameReservations = reservations.filter(r => r.gameId === game.id);
          return this.hasFreeSlot(workingHours, gameReservations);
        });
      });
    });

    const dialogRef = this.dialog.open(EditReservationDialogComponent, {
      width: '400px',
      data: {reservation: reservation, tables: tables, games: games }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationsService.updateReservation(result).subscribe(() => {
          this.loadReservations();
        });
      }
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

  openDeleteReservationDialog(reservation: Reservation) {
    reservation.status = 'CANCELED';
    this.reservationsService.updateReservation(reservation).subscribe(() => {
      this.loadReservations();
    });
  }
}
