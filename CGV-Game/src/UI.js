// src/UI.js
export default class UI {
  constructor(game) {
    this.game = game;
    this.setupUI();
  }

  setupUI() {
    // Spell Buttons
    for (let i = 1; i <= 4; i++) {
      const btn = document.getElementById(`spell${i}`);
      if (btn) {  // Check if the element exists
        btn.addEventListener('click', () => {
          this.game.player.castSpell(i);
        });
      }
    }

    // Restart Button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {  // Check if the element exists
      restartBtn.addEventListener('click', () => {
        this.game.restartGame();
      });
    }

    // Level Selection
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) {  // Check if the element exists
      levelSelect.addEventListener('change', (e) => {
        const level = e.target.value;
        this.game.selectLevel(level);
      });
    }
  }
}
