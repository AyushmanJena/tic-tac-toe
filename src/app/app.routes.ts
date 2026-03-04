import { Routes } from '@angular/router';
import { BotMatchComponent } from './bot-match/bot-match.component';
import { PlayerMatchComponent } from './player-match/player-match.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: '', component: BotMatchComponent }, 
    { path: 'friend', component: PlayerMatchComponent}
];
