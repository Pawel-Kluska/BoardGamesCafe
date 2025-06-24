import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-nav-bookmarks',
  templateUrl: './nav-bookmarks.component.html',
  styleUrls: ['./nav-bookmarks.component.scss'],
  standalone: true,
  imports: [
        CommonModule,
    RouterModule,
    MatButtonModule
  ],
})
export class NavBookmarksComponent implements OnInit {
  links: { label: string; path: string }[] = [];

  keycloakService = inject(KeycloakService);
  constructor(private router: Router) {}
  ngOnInit(): void 
  {
    var roles = this.keycloakService.getUserRoles();
    if(roles.includes('admin'))  {
      this.links = [
        { label: 'Sessions', path: '/sessions/admin' },
        { label: 'Reservations', path: '/reservations/admin' },
        { label: 'Games and Tables', path: '/games' },
      ];
    }
    else{
      this.links = [
        { label: 'Sessions', path: '/sessions' },
        { label: 'Reservations', path: '/reservations' },
        { label: 'Games and Tables', path: '/games' },
      ];
    }
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }
}