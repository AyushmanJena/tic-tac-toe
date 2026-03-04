import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-bot-match',
  imports: [
    NgClass,
    CommonModule,
    FormsModule
  ],
  templateUrl: './bot-match.component.html',
  styleUrl: './bot-match.component.css'
})
export class BotMatchComponent {

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
    this.difficultyLevel = "easy";
    if(!this.userTurn){
      this.botInput();
    }
  }

  userTurnChange(selectedTurn: boolean){     // on changing if user starts or bot starts
    this.userTurn = selectedTurn;
    this.resetGrid();
  }

  resetGrid(){  // basically restarts the game
    if(this.difficultyLevel === 'friend'){
      this.router.navigate(['/friend']);
    }
    this.grid = new Array(9).fill(0);
    this.queue = new Queue<number>();
    this.tempPosition = undefined;
    if(!this.userTurn){
      this.botInput();
    }
  }

  userInput(pos: number) {
    if (!this.userTurn || this.grid[pos] !== 0) return;

    this.removeOldestMove();

    this.queue.enqueue(pos);
    this.grid[pos] = 1;

    this.markTempPosition();

    if (this.gameOver()) return;

    this.userTurn = false;
    setTimeout(() => this.botInput(), 800);
  }


  botInput() {
    let pos : number = -1;

    if(this.difficultyLevel === 'easy'){
      pos = this.easyMode();
    }
    else if(this.difficultyLevel === 'medium'){
      pos = this.mediumMode();
    }else{
      pos = this.friendMode();
    }

    this.removeOldestMove();

    this.queue.enqueue(pos);
    this.grid[pos] = 2;

    this.markTempPosition();

    this.userTurn = true;
    this.gameOver();
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
    if(this.winner === 'player'){
      return 'player-won-bg';
    }else if(this.winner === 'bot'){
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
          this.winner = 'player';
          this.gameOverMessage = "Player Won";
          // console.log("User Won");
        }else if(this.grid[arr[0]] == 2){
          this.winner = 'bot';
          this.gameOverMessage = "Bot Won";
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

  easyMode(): number{
    const emptyCells = this.grid
      .map((v, i) => v === 0 ? i : -1)
      .filter(i => i !== -1);

    if(emptyCells.length === 0){
      return -1;
    }

    const randomValue : number = Math.floor(Math.random() * emptyCells.length);
    const cellIndex = emptyCells[randomValue];
    return cellIndex;
  }

  mediumMode(): number{

    // prefer win
    let win = this.mediumHelper(2);

    // if no wins then block opponent
    if(win === -1){
      win = this.mediumHelper(1);
    }
    if(win !== -1){
      return win;
    }

    // if no wins or no blocks go easy
    return this.easyMode();
  }

  mediumHelper(val: number){
    const winCases: number[][] = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6],[1, 4, 7],[2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for(let arr of winCases){

      // make sure no direct wins and also take if bot has the chance
      if(this.grid[arr[0]] == this.grid[arr[1]] && this.grid[arr[0]] == val && this.grid[arr[2]] === 0){ // check that index not already filled and all 0 case too
        return arr[2];
      }else if(this.grid[arr[1]] == this.grid[arr[2]] && this.grid[arr[1]] == val  && this.grid[arr[0]] === 0){
        return arr[0];
      }else if(this.grid[arr[0]] == this.grid[arr[2]] && this.grid[arr[0]] == val  && this.grid[arr[1]] === 0){
        return arr[1];
      }

    }
    return -1;

  }

  hardMode(): number{
    // add hard / impossible mode logic
    // logic -> it reads the whole grid and figures out where the user would place the next move
    return 0;
  }

  friendMode(): number{
    return this.mediumMode();

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
