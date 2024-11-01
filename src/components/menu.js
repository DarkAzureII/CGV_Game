import { Game } from './Game.js';

export class Menu {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.container = document.getElementById('game-container');
    this.currentGame = null;
  }

  render() {
    if (!this.currentGame) {
      this.currentGame = new Game(this.canvas); // Pass the canvas to the Game class
      this.currentGame.render();
      this.currentGame.pause();
    }

    this.startGame();
  }

  startGame() {
    if (this.currentGame) {
      this.currentGame.start();
      document.getElementById('pause-button').style.display = 'block'; // Show the pause button
    }
  }

  quitGame() {
    if (this.currentGame) {
      this.currentGame.cleanup(); // Clean up resources
      this.currentGame = null;
      this.container.innerHTML = ''; // Clear the game container
    }
    window.location.href = 'index.html'; // Redirect to index.html
  }
}
