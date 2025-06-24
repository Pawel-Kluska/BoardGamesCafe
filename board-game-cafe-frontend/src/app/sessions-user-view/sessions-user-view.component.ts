import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SessionService, Session } from '../services/session.service';
import { AdminService, Game, Table } from '../services/admin.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-user-sessions-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './sessions-user-view.component.html',
  styleUrls: ['./sessions-user-view.component.scss']
})
export class UserSessionsViewComponent implements OnInit {

  sessions: Session[] = [];
  games: Game[] = [];
  tables: Table[] = [];
  userEmail: string = 'user@example.com';

  sessionService = inject(SessionService);
  adminService = inject(AdminService);
  keycloakService = inject(KeycloakService);
  dialog = inject(MatDialog);

  async ngOnInit(): Promise<void> {
    this.userEmail = (await this.keycloakService.loadUserProfile()).email || '';
    this.loadSessions();
    this.adminService.getAllGamesAndTables().subscribe(data => {
      this.games = data.games;
      this.tables = data.tables;
    });
  }

  loadSessions(): void {
    this.sessionService.getSessions({ email: this.userEmail }).subscribe((res) => {
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

  deleteSession(session: Session): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: `Are you sure you want to disconnect from session?`,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sessionService.deleteSession(session.id!, this.userEmail).subscribe(() => {
          this.loadSessions();
        });
      }
    });
  }

  redirectToGames() {
    window.location.href = '/sessions/create';
  }

  getRandomColor(seed: number): string {
    const colors = ['#ffc7f8', '#ffc7ee', '#ffc7e6', '#ffc7dc', '#ffc7d4'];
    return colors[seed % colors.length];
  }
}