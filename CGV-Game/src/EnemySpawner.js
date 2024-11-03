// src/EnemySpawner.js

import Enemy from './Enemy.js';
import Boss from './Boss.js';
import * as THREE from 'three';

export default class EnemySpawner {
    constructor(scene, levelConfig, onLevelWon) {
        this.scene = scene;
        this.levelConfig = levelConfig;
        this.baseSpawnRate = levelConfig.spawnRate; // Initial spawn rate from level config
        this.bossAfter = levelConfig.bossAfter;
        this.minSpawnInterval = 0.5; // Minimum spawn interval in seconds
        this.maxSpawnInterval = 3;   // Maximum spawn interval in seconds
        this.elapsedTime = 0;
        this.totalGameTime = 0;      // Track total game time
        this.enemiesSpawned = 0;
        this.isBossSpawned = false;
        this.boss = null;
        this.levelWon = false;

        this.onLevelWon = onLevelWon;
        this.activeEnemies = [];
        this.meshToEnemyMap = new Map();
    }

    update(delta, playerPosition, onAttackPlayer) {
        if (!playerPosition) return;

        // Update elapsed and total game time
        this.elapsedTime += delta;
        this.totalGameTime += delta;

        // Dynamically adjust spawn interval based on active enemies and game time
        const activeEnemyCount = this.activeEnemies.length;

        // Scale the spawn rate faster as time progresses, up to a 3-minute limit
        let timeFactor = Math.min(this.totalGameTime / 180, 1); // Caps at 1 after 3 minutes
        let spawnInterval;

        if (timeFactor < 1) {
            // Scale spawn interval based on active enemies and time factor (before 3 mins)
            const scalingFactor = Math.max(0, (20 - activeEnemyCount) / 20);
            spawnInterval = THREE.MathUtils.lerp(this.minSpawnInterval, this.maxSpawnInterval, scalingFactor * (1 - timeFactor));
        } else {
            // After 3 minutes, ignore enemy count and set minimum spawn interval
            spawnInterval = this.minSpawnInterval;
        }

        // Spawn enemies based on the dynamic interval
        while (this.elapsedTime >= spawnInterval) {
            this.spawnEnemy();
            this.elapsedTime -= spawnInterval;
        }

        // Spawn boss if criteria met
        if (!this.isBossSpawned && this.enemiesSpawned >= this.bossAfter) {
            this.spawnBoss();
            this.isBossSpawned = true;
        }

        // Update active enemies
        this.activeEnemies.forEach(enemy => enemy.update(delta, playerPosition, onAttackPlayer));

        if (this.boss) {
            this.boss.update(delta, playerPosition);
            if (this.boss.isDefeated()) {
                this.levelWon = true;
                if (this.onLevelWon) this.onLevelWon();
            }
        }

        // Remove defeated enemies
        this.activeEnemies = this.activeEnemies.filter(enemy => enemy.health > 0);
    }

    spawnEnemy() {
        const enemy = new Enemy(this.scene, this.levelConfig.enemyType);
        this.activeEnemies.push(enemy);
        this.meshToEnemyMap.set(enemy.mesh, enemy);
        this.enemiesSpawned++;
    }

    getEnemyFromMesh(mesh) {
        return this.meshToEnemyMap.get(mesh);
    }

    spawnBoss() {
        this.boss = new Boss(this.scene, this.levelConfig.bossType || 'boss');
        this.boss.onDefeated = () => {
            this.levelWon = true;
            if (this.onLevelWon) this.onLevelWon();
        };
        console.log('Boss spawned!');
    }

    isLevelWon() {
        return this.levelWon;
    }

    getActiveEnemies() {
        return this.activeEnemies.map(enemy => enemy.mesh);
    }

    removeAllEnemies() {
        this.activeEnemies.forEach(enemy => enemy.remove());
        this.activeEnemies = [];
        if (this.boss) {
            this.boss.remove();
            this.boss = null;
        }
    }
}
