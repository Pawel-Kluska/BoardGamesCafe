import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SessionService, Session } from '../services/session.service';
import { AdminService, Game, Table } from '../services/admin.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule, formatDate } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-session-join',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatButtonModule, 
    MatIconModule,    
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './session-join.component.html',
  styleUrl: './session-join.component.scss'
})
export class SessionJoinComponent {
  sessions: Session[] = [];
  games: Game[] = [];
  tables: Table[] = [];
  filterDate: string = ''; 

  sessionService = inject(SessionService);
  adminService = inject(AdminService);
  keycloakService = inject(KeycloakService);
  dialog = inject(MatDialog);

  async ngOnInit(): Promise<void> {
    this.loadSessions();
    this.adminService.getAllGamesAndTables().subscribe(data => {
      this.games = data.games;
      this.tables = data.tables;
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
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.getSessions({ date: this.filterDate }).subscribe((res) => {
      this.sessions = res;
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
      case 'CONFIRMED': return 'chip-confirmed';
      case 'PENDING': return 'chip-pending';
      case 'CANCELED': return 'chip-canceled';
      default: return 'chip-default';
    }
  }

  redirectToGames() {
    window.location.href = '/sessions/create';
  }

  getRandomColor(seed: number): string {
    const colors = ['#ffc7f8', '#ffc7ee', '#ffc7e6', '#ffc7dc', '#ffc7d4'];
    return colors[seed % colors.length];
  }

  async joinSession(session: Session | null): Promise<void> {
    if (!session) {
      throw new Error('Invalid session');
    }
    const profile = await this.keycloakService.loadUserProfile();
    session.userSessionEmails = [profile.email || ''];
    // Implement the join session logic here
    this.sessionService.addSession(session).subscribe(() => {
      window.location.href = '/sessions';
    });
  }
}
