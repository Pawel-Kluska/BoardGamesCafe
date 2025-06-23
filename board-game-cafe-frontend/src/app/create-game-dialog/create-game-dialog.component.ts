import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-game-dialog',
  imports: [    
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-game-dialog.component.html',
  styleUrl: './create-game-dialog.component.scss'
})
export class CreateGameDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateGameDialogComponent>
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      minPlayers: [1, [Validators.required, Validators.min(1)]],
      maxPlayers: [1, [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value); // Return form data on close
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
