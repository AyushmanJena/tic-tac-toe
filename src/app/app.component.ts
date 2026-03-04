import {Component, OnInit} from '@angular/core';
import { BotMatchComponent } from "./bot-match/bot-match.component";
import { PlayerMatchComponent } from './player-match/player-match.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    BotMatchComponent,
    RouterOutlet
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tic-tac-toe';

  
}
