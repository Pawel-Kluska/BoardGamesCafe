import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { AdminService, Game, Table } from '../services/admin.service';
import { CreateGameDialogComponent } from '../create-game-dialog/create-game-dialog.component';
import { CreateTableDialogComponent } from '../create-table-dialog/create-table-dialog.component';
import { EditTableDialogComponent } from '../edit-table-dialog/edit-table-dialog.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { EditGameDialogComponent } from '../edit-game-dialog/edit-game-dialog.component';

@Component({
  selector: 'app-games-view',
  imports: [
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,    
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ],
  templateUrl: './games-view.component.html',
  styleUrl: './games-view.component.scss'
})
export class GamesViewComponent implements OnInit {
  displayedColumnsGames: string[] = ['id', 'name', 'minPlayers', 'maxPlayers', 'actions'];
  games: Game[] = [ ];

  displayedColumnsTables: string[] = ['id', 'number', 'seats',  'actions'];
  tables: Table[] = [];
  
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);

  ngOnInit(): void 
  {
    var data = signal(
      this.adminService.getAllGamesAndTables(),
    );
    data().subscribe({
      next: (response) => {
        this.games = response.games;
        this.tables = response.tables;
        console.log('Games and Tables fetched successfully:', response);
      },
      error: (error) => {
        console.error('Error fetching games and tables:', error);
      }
    });
  }

  openCreateGameDialog() {
    const dialogRef = this.dialog.open(CreateGameDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result contains new game data
        this.adminService.addGame(result).subscribe({
          next: newGame => {
            this.games = [...this.games, newGame]; 
          },
          error: err => console.error('Failed to add game', err),
        });
      }
    });
  }

   // Games
  addGame(game: Game) {
    this.adminService.addGame(game).subscribe({
      next: newGame => {
        this.games.push(newGame);
      },
      error: err => console.error('Failed to add game', err),
    });
  }

  openEditGameDialog(game: Game) {
    const dialogRef = this.dialog.open(EditGameDialogComponent, {
      width: '400px',
      data: game,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateGame(result);
      }
    });
  }

  updateGame(game: Game) {
    this.adminService.updateGame(game).subscribe({
      next: updatedGame => {
        const index = this.games.findIndex(g => g.id === updatedGame.id);
        if (index !== -1) this.games[index] = updatedGame;
        this.games = this.games.filter(g => g.id !== updatedGame.id);
        this.games = [...this.games, updatedGame];
      },
      error: err => console.error('Failed to update game', err),
    });
  }

  openDeleteGameDialog(game: Game) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: `Are you sure you want to delete game: ${game.name}?`,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteGame(game).subscribe({
          next: deletedTable => {
            this.games = this.games.filter(g => g !== game);
          },
          error: err => console.error('Failed to delete game', err),
        });
      }
    });
  }

  deleteGame(game: Game) {
    this.adminService.deleteGame(game).subscribe({
      next: () => {
        this.games = this.games.filter(g => g !== game);
      },
      error: err => console.error('Failed to delete game', err),
    });
  }

  // Tables

  
openCreateTableDialog() {
  const dialogRef = this.dialog.open(CreateTableDialogComponent, {
    width: '400px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.adminService.addTable(result).subscribe({
        next: newTable => {
          this.tables = [...this.tables, newTable];
        },
        error: err => console.error('Failed to add table', err),
      });
    }
  });
}

  addTable(table: Table) {
    this.adminService.addTable(table).subscribe({
      next: newTable => {
        this.tables.push(newTable);
      },
      error: err => console.error('Failed to add table', err),
    });
  }

  openEditTableDialog(table: Table) {
    const dialogRef = this.dialog.open(EditTableDialogComponent, {
      width: '400px',
      data: table, // pass the existing table
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateTable(result).subscribe({
          next: updatedTable => {
            this.updateTable(updatedTable);
          },
          error: err => console.error('Failed to update table', err),
        });
      }
    });
  }

  updateTable(table: Table) {
    this.adminService.updateTable(table).subscribe({
      next: updatedTable => {
        const index = this.tables.findIndex(t => t.id === updatedTable.id);
        if (index !== -1){ this.tables[index] = updatedTable;
          this.tables = this.tables.filter(t => t.id !== updatedTable.id);
          this.tables = [...this.tables, updatedTable];
        }
      },
      error: err => console.error('Failed to update table', err),
    });
  }

  deleteTable(table: Table) {
    this.adminService.deleteTable(table).subscribe({
      next: () => {
        this.tables = this.tables.filter(t => t.id !== table.id);
      },
      error: err => console.error('Failed to delete table', err),
    });
  }

    openDeleteTableDialog(table: Table) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: `Are you sure you want to delete table: ${table.number}?`,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteTable(table).subscribe({
          next: deletedTable => {
            this.tables = this.tables.filter(t => t !== table);
          },
          error: err => console.error('Failed to delete table', err),
        });
      }
    });
  }
}
