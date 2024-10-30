import { Game } from './Game.js';

export class Menu {
    constructor() {
        this.container = document.getElementById('game-container');
        this.currentGame = null;
    }

    render() {
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        // Menu Overlay
        this.container.innerHTML = `
            <div id="menu-overlay" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            ">
                <h1 style="
                    color: white;
                    text-shadow: 2px 2px 4px rgba(0, 255, 0, 0.7); /* Green shades */
                    font-family: 'Permanent Marker', cursive; /* Funky font */
                ">I am the Tank!!!</h1>
                <button id="start-button" style="
                    margin: 5px;
                    padding: 20px 40px;
                    font-size: 30px;
                    font-family: 'Permanent Marker', cursive;
                    color: rgba(0, 255, 0, 0.8);
                    background-color: transparent;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Start Game</button>
                <button id="quit-button" style="
                    margin: 5px;
                    padding: 20px 40px;
                    font-size: 30px;
                    font-family: 'Permanent Marker', cursive;
                    color: rgba(0, 255, 0, 0.8);
                    background-color: transparent;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Quit</button>
            </div>

            <button id="pause-button" style="
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 10px;
                font-size: 30px;
                font-family: 'Permanent Marker', cursive;
                color: white;
                background-color: rgba(0, 255, 0, 0);
                border: none;
                cursor: pointer;
                display: none; /* Initially hidden */
                transition: all 0.3s ease;
            ">&#10074;&#10074;</button> <!-- Pause icon (two bars) -->
        `;

        if (!this.currentGame) {
            this.currentGame = new Game();
            this.currentGame.render(); // Render the game scene
            this.currentGame.pause();  // Pause the game (since we are on the menu)
        }

        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('quit-button').addEventListener('click', () => {
            this.quitGame();
        });

        document.getElementById('pause-button').addEventListener('click', () => {
            this.togglePauseResume();
        });
    }

    startGame() {
        if (this.currentGame) {
            // Unpause and start the game
            this.currentGame.start();
            document.getElementById('menu-overlay').style.display = 'none';  // Hide menu
            document.getElementById('pause-button').style.display = 'block'; // Show the Pause button only when the game starts
        }
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

    togglePauseResume() {
        console.log("Toggle Pause/Resume called.");
        const pauseButton = document.getElementById('pause-button');
        if (this.currentGame.paused) {
            console.log("Resuming the game...");
            this.currentGame.resume();
            pauseButton.innerHTML = '&#10074;&#10074;'; // Change to Pause icon
        } else {
            console.log("Pausing the game...");
            this.currentGame.pause();
            pauseButton.innerHTML = '&#9654;'; // Change to Resume icon
        }
    }
}
