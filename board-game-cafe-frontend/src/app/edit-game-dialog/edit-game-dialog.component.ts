import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Game } from '../services/admin.service';

@Component({
  selector: 'app-edit-game-dialog',
  imports: [    
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,],
  templateUrl: './edit-game-dialog.component.html',
  styleUrl: './edit-game-dialog.component.scss'
})
export class EditGameDialogComponent {
  gameForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditGameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Game
  ) {
    this.gameForm = this.fb.group({
      id: [data.id, Validators.required],
      name: [data.name, Validators.required],
      minPlayers: [data.minPlayers, [Validators.required, Validators.min(1)]],
      maxPlayers: [data.maxPlayers, [Validators.required, Validators.min(1)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.gameForm.valid) {
      this.dialogRef.close(this.gameForm.value);
    }
  }
}