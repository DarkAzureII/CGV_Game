import { Game } from './Game.js';

export class Menu {
    constructor() {
        this.container = document.getElementById('game-container');
        this.currentGame = null;
    }

    render() {
        this.container.innerHTML = `
            <h1>Welcome to I am the Tank!!!</h1>
            <button id="start-button">Start Game</button>
            <button id="quit-button">Quit</button>
        `;

        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('quit-button').addEventListener('click', () => {
            this.quitGame();
        });
    }

    startGame() {
        this.popGame();
        this.currentGame = new Game();
        this.currentGame.render();
        this.currentGame.sceneManager.controls.lock(); // Lock pointer here
    }

    quitGame() {
        console.log("Game has been quit.");
        this.popGame();
        this.render(); // Return to menu
    }

    popGame() {
        if (this.currentGame) {
            // Remove event listeners and clean up any resources
            this.currentGame.cleanup();
            this.currentGame = null;
        }
        // Clear the container
        this.container.innerHTML = '';
    }
}