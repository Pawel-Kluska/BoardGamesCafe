import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Game {
  id: number; 
  maxPlayers: number; 
  minPlayers: number; 
  name: string;
}

export interface Table {
  id: number;
  number: string; 
  seats: number;
}

export interface AllGamesAndTablesDto {
  games: Game[];
  tables: Table[];
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly baseUrl = 'http://localhost:8081/admin';

  constructor(private http: HttpClient) {}

  getAllGamesAndTables(): Observable<AllGamesAndTablesDto> {
    return this.http.get<AllGamesAndTablesDto>(`${this.baseUrl}`);
  }

  // Games
  addGame(game: Game): Observable<Game> {
    return this.http.post<Game>(`${this.baseUrl}/games`, game);
  }

  updateGame(game: Game): Observable<Game> {
    return this.http.put<Game>(`${this.baseUrl}/games`, game);
  }

  deleteGame(game: Game): Observable<void> {
    return this.http.request<void>('delete', `${this.baseUrl}/games`, { body: game });
  }

  // Tables
  addTable(table: Table): Observable<Table> {
    return this.http.post<Table>(`${this.baseUrl}/tables`, table);
  }

  updateTable(table: Table): Observable<Table> {
    return this.http.put<Table>(`${this.baseUrl}/tables`, table);
  }

  deleteTable(table: Table): Observable<void> {
    return this.http.request<void>('delete', `${this.baseUrl}/tables`, { body: table });
  }
}
