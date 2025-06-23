import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-page-header',
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent implements OnInit {
  username: string | undefined;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    this.loadUser();
  }

  async loadUser() {
    const profile = await this.keycloakService.loadUserProfile();
    this.username = profile.username;
  }
}
