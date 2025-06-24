import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Reservation } from '../services/reservation.service';
import { Game, Table } from '../services/admin.service';
import { formatDate } from '@angular/common';
@Component({
  selector: 'edit-reservation-dialog',
    imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './edit-reservation-dialog.component.html',
  styleUrl: './edit-reservation-dialog.component.scss',
})
export class EditReservationDialogComponent {
  reservationForm: FormGroup;
  tables: Table[] = []; 
  games: Game[] = []; 
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reservation: Reservation, tables: any[], games: any[] }
  ) {
    this.reservationForm = this.fb.group({
      email: [data.reservation.email, [Validators.required, Validators.email]],
      tableId: [data.reservation.tableId, Validators.required],
      gameId: [data.reservation.gameId, Validators.required],
      date: [new Date(data.reservation.date), Validators.required],
      startTime: [data.reservation.startTime.slice(0, 5), Validators.required], // 'HH:mm'
      endTime: [data.reservation.endTime.slice(0, 5), Validators.required],
      status: [data.reservation.status, Validators.required]
    });
    this.tables = data.tables;
    this.games = data.games;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.reservationForm.valid) {
      const formValue = this.reservationForm.value;
      const updatedReservation: Reservation = {
        ...this.data.reservation,
        email: formValue.email,
        tableId: formValue.tableId,
        gameId: formValue.gameId,
        date: formatDate(formValue.date, 'yyyy-MM-dd', 'en-US'),
        startTime: formValue.startTime + ':00',
        endTime: formValue.endTime + ':00',
        status: formValue.status
      };
      this.dialogRef.close(updatedReservation);
    }
  }
}