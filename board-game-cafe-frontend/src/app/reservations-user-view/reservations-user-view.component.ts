import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Reservation, ReservationService } from '../services/reservation.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { AdminService, Game, Table } from '../services/admin.service';
import { MatChip } from '@angular/material/chips';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-reservations-user-view',
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatChip
  ],
  templateUrl: './reservations-user-view.component.html',
  styleUrls: ['./reservations-user-view.component.scss']
})
export class ReservationsUserViewComponent implements OnInit {

  reservations: Reservation[] = [];
  tables: Table[] = [];
  games: Game[] = [];
  userEmail = 'user@example.com'; // get this dynamically

  adminService = inject(AdminService);
  constructor(
    private reservationService: ReservationService,
    private dialog: MatDialog,
    private keycloakService: KeycloakService,
  ) {}

  ngOnInit(): void {
    this.loadReservations();
    this.adminService.getAllGamesAndTables().subscribe(data => {
    this.games = data.games;
    this.tables = data.tables;
  });
  }

  async loadReservations(): Promise<void> {
    this.userEmail = (await this.keycloakService.loadUserProfile()).email || '';
    this.reservationService.getReservations({ email: this.userEmail }).subscribe((res) => {
      this.reservations = res;
    });
  }

  filterByDate(event: any): void {
    const dateStr = event.value.toISOString().split('T')[0];
    this.reservationService.getReservations({ date: dateStr }).subscribe((res) => {
      this.reservations = res;
    });
  }

  getGameName(gameId: number): string {
  return this.games.find(g => g.id === gameId)?.name || 'Unknown Game';
  }

  getTableLabel(tableId: number): string {
    const table = this.tables.find(t => t.id === tableId);
    return table ? `${table.number} (${table.seats} seats)` : 'Unknown Table';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'chip-confirmed';
      case 'PENDING':
        return 'chip-pending';
      case 'CANCELED':
        return 'chip-canceled';
      default:
        return 'chip-default';
    }
  }

  deleteReservation(reservation: Reservation): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: `Are you sure you want to cancel reservation?`,
    });

    dialogRef.afterClosed().subscribe(result => {
      reservation.status = 'CANCELED';
      if (result) {
        this.reservationService.updateReservation(reservation).subscribe(() => this.loadReservations());
      }
    });
  }

  redirectToCreateReservationView() {
    window.location.href = 'reservations/reserve';
  }

  getRandomColor(seed: number): string {
    const colors = ['#fdbae9', '#f7bafa', '#e9bafa', '#efccff', '#dba0f2', '#efbafa'];
    return colors[seed % colors.length];
  }
}