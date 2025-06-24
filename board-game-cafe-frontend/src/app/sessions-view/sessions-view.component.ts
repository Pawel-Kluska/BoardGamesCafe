import { Component, OnInit } from '@angular/core';
import { SessionService, Session } from '../services/session.service';
import { AdminService, Game, Table } from '../services/admin.service';
import { formatDate } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-sessions-view',
  standalone: true,
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
  templateUrl: './sessions-view.component.html',
  styleUrl: './sessions-view.component.scss'
})
export class SessionViewComponent implements OnInit {
  sessions: Session[] = [];
  games: Game[] = [];
  tables: Table[] = [];
  displayedColumnsSessions: string[] = ['id', 'date', 'startTime', 'endTime', 'table', 'game', 'users'];

  constructor(
    private sessionService: SessionService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.adminService.getAllGamesAndTables().subscribe(data => {
      this.games = data.games;
      this.tables = data.tables;
    });
  }

  onFilterDateChange(date: Date): void {
    const formattedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.sessionService.getSessions({ date: formattedDate }).subscribe(data => {
      this.sessions = data;
    });
  }

  deleteSession(session: Session): void {
    if (!session.id) return;
    // this.sessionService.deleteSession(session.id).subscribe(() => {
    //   this.sessions = this.sessions.filter(s => s.id !== session.id);
    // });
  }

  getGameName(gameId: number): string {
    return this.games.find(g => g.id === gameId)?.name || 'Unknown Game';
  }

  getTableLabel(tableId: number): string {
    const table = this.tables.find(t => t.id === tableId);
    return table ? `Table ${table.number} (${table.seats} seats)` : 'Unknown Table';
  }
}