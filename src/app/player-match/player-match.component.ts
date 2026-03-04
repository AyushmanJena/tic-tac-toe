import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player-match',
  imports: [
    NgClass,
    CommonModule,
    FormsModule
  ],
  templateUrl: './player-match.component.html',
  styleUrl: './player-match.component.css'
})
export class PlayerMatchComponent {

  constructor(private router: Router){}

  grid!: number[];
  difficultyLevel!: string;
  showGameOverModal: boolean = false;
  gameOverMessage: string = "";
  userTurn: boolean = true;
  tempPosition?: number; // position that will be grayed out and will be removed in the next round
  queue = new Queue<number>();

  ngOnInit(): void {
    this.grid = new Array(9).fill(0);
    this.difficultyLevel = "friend";
  }

  userTurnChange(selectedTurn: boolean){     // on changing if player 1 starts or player 2 starts
    this.userTurn = selectedTurn;
    this.resetGrid();
  }

  resetGrid(){  // basically restarts the game
    if(this.difficultyLevel !== 'friend'){
      this.router.navigate(['/']);
    }
    this.grid = new Array(9).fill(0);
    this.queue = new Queue<number>();
    this.tempPosition = undefined;
  }

  userInput(pos: number) {
    if (this.grid[pos] !== 0) return;

    this.removeOldestMove();

    this.queue.enqueue(pos);

    if(this.userTurn){
      this.grid[pos] = 1;
    }
    else{
      this.grid[pos] = 2;
    }

    this.markTempPosition();

    if (this.gameOver()) return;

    this.userTurn = !this.userTurn;
  }

  markTempPosition() {
    if (!this.queue.isFull()) return;

    const pos = this.queue.peek();
    if (pos === undefined || pos === this.tempPosition) return;

    this.tempPosition = pos;

    if (this.grid[pos] === 1) {
      this.grid[pos] = 3;
    } else if (this.grid[pos] === 2) {
      this.grid[pos] = 4;
    }
  }

  removeOldestMove() {
    if (this.tempPosition === undefined) return;

    const removed = this.queue.dequeue();

    if (removed === this.tempPosition) {
      this.grid[removed] = 0;
      this.tempPosition = undefined;
    }
  }

  getCellClass(index: number) { // helps change cell colors
    if (this.grid[index] === 1) {
      return 'player-primary';
    }
    else if (this.grid[index] === 2) {
      return 'bot-primary';
    }
    else if(this.grid[index] === 3){
      return 'player-secondary';
    }
    else if(this.grid[index] === 4){
      return 'bot-secondary';
    }

    return 'default';
  }

  winner!: string;

  gameOverBg(){
    if(this.winner === 'player1'){
      return 'player-won-bg';
    }else if(this.winner === 'player2'){
      return 'bot-won-bg';
    }
    return 'default-bg';
  }

  gameOver(){
    const winCases: number[][] = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6],[1, 4, 7],[2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for(let arr of winCases){
      if(this.grid[arr[0]] != 0 && this.grid[arr[0]] == this.grid[arr[1]] && this.grid[arr[1]]  == this.grid[arr[2]]){
        // console.log(this.grid[arr[0]] + " "  + this.grid[arr[1]] + " " + this.grid[arr[2]]);
        if(this.grid[arr[0]] == 1){
          this.winner = 'player1';
          this.gameOverMessage = "Player 1 Won";
          // console.log("User Won");
        }else if(this.grid[arr[0]] == 2){
          this.winner = 'player2';
          this.gameOverMessage = "Player 2 Won";
          // console.log("Bot Won");
        }
        this.showGameOverModal = true;
        return true;
      }
    }

    for(let i = 0; i < 9; i++) {
      if(this.grid[i] === 0) return false;
    }

    this.gameOverMessage = "It's a Tie";
    this.showGameOverModal = true;
    // console.log("TIE");
    return true;
  }

  closeGameOverModal(){
    this.winner = '';
    this.showGameOverModal = false;
    this.resetGrid();
  }
}

class Queue<T> {
  private items: T[] = [];
  maxSize: number = 6;

  enqueue(item: T){
    this.items.push(item);
  }
  dequeue(){
    return this.items.shift();
  }

  peek(){
    return this.items[0];
  }

  isEmpty(){
    return this.items.length === 0;
  }

  isFull(){
    return this.items.length >= this.maxSize;
  }
}
