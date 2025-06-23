import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from "./page-header/page-header.component";
import { Game } from './services/admin.service';
import { AdminService } from './services/admin.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'board-game-cafe';
}
