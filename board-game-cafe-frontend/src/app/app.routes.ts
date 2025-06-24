import { Routes } from '@angular/router';
import { GamesViewComponent } from './games-view/games-view.component';
import { ReservationsUserViewComponent } from './reservations-user-view/reservations-user-view.component';
import { ReserveTableComponent } from './reserve-table/reserve-table.component';
import { ReservationsViewComponent } from './reservations-view/reservations-view.component';
import { SessionViewComponent } from './sessions-view/sessions-view.component';
import { UserSessionsViewComponent } from './sessions-user-view/sessions-user-view.component';
import { SessionCreateComponent } from './session-create/session-create.component';

export const routes: Routes = [
    {path: 'games', component: GamesViewComponent},
    {path: 'reservations/admin', component: ReservationsViewComponent},
    {path: 'reservations', component: ReservationsUserViewComponent},
    {path: 'reservations/reserve', component: ReserveTableComponent},
    {path: 'sessions/admin', component: SessionViewComponent},
    {path: 'sessions', component: UserSessionsViewComponent},
    {path: 'sessions/create', component: SessionCreateComponent}
];
