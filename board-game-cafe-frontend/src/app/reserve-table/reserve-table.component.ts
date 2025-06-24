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
export class ReserveTableComponent implements OnInit {
  reservationForm: FormGroup;
  availableTables: Table[] = [];
  availableGames: Game[] = [];
  selectedDate: Date | null = null;
  selectedTableId: number | null = null;
  selectedGameId: number | null = null;
  allReservations: Reservation[] = [];
  availableHours: string[] = [];

  private adminService = inject(AdminService);
  private reservationService = inject(ReservationService);
  
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.reservationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      date: [null, Validators.required],
      tableId: [null, Validators.required],
      gameId: [null, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.reservationForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        const formattedDate = date.toISOString().split('T')[0];
        this.loadAvailability(formattedDate);
      }
    });
  }

  loadAvailability(date: string) {
    var data = signal(
      this.adminService.getAllGamesAndTables(),
    );
    data().subscribe({
      next: (response) => {
        this.availableGames = response.games;
        this.availableTables = response.tables;
        console.log('Games and Tables fetched successfully:', response);
      },
      error: (error) => {
        console.error('Error fetching games and tables:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      const formValue = this.reservationForm.value;
      const reservation: Reservation = {
        email: formValue.email,
        tableId: formValue.tableId,
        gameId: formValue.gameId,
        date: formValue.date.toISOString().split('T')[0],
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        status: 'PENDING'
      };

      this.reservationService.addReservation(reservation).subscribe({
        next: () => {
          this.snackBar.open('Reservation created!', 'Close', { duration: 3000 });
          this.reservationForm.reset();
          this.availableTables = [];
          this.availableGames = [];
        },
        error: () => {
          this.snackBar.open('Error creating reservation', 'Close', { duration: 3000 });
        }
      });
    }
  }

  selectTable(table: Table) {
  this.reservationForm.patchValue({ tableId: table.id });
}

selectGame(game: Game) {
  this.reservationForm.patchValue({ gameId: game.id });
}

onDateChange(date: Date): void {
  this.selectedDate = date;
  const formattedDate = date.toISOString().split('T')[0];

  this.reservationService.getReservations({ date: formattedDate }).subscribe(reservations => {
    this.allReservations = reservations;

    // Filter available tables
    this.adminService.getAllGamesAndTables().subscribe(data => {
      const reservedTableIds = reservations.map(r => r.tableId);
      this.availableTables = data.tables.filter(t => !reservedTableIds.includes(t.id));

      const reservedGameIds = reservations.map(r => r.gameId);
      this.availableGames = data.games.filter(g => !reservedGameIds.includes(g.id));
    });
  });
}

onTableOrGameChange(): void {
  if (!this.selectedTableId || !this.selectedGameId || !this.selectedDate) return;

  // Filter reservations that match current table and game
  const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
  const relevantReservations = this.allReservations.filter(r =>
    r.date === selectedDateStr &&
    r.tableId === this.selectedTableId &&
    r.gameId === this.selectedGameId
  );

  this.availableHours = this.getAvailableHours(relevantReservations);
}

getAvailableHours(reservations: Reservation[]): string[] {
  const allHours = Array.from({ length: 12 }, (_, i) => 12 + i) // 12 to 23
    .map(h => `${h.toString().padStart(2, '0')}:00`);

  const reserved = new Set(reservations.map(r => r.startTime));

  return allHours.filter(h => !reserved.has(h));
}

}