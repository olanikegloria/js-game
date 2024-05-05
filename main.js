import './style.css';
import Phaser from 'phaser';

const sizes = {
  width: 500,
  height: 450
};
const speedDown = 300;

const gameStartDiv = document.querySelector("#gameStartDiv");
const gameStartBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEndDiv");
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan");
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan");
const gameCanvas = document.querySelector("#gameCanvas");
const gameReStartBtn =document.querySelector("#gameReStartBtn");

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursors;
    this.apples;
    this.beetles;
    this.points = 0;
    this.textScore;
    this.textTime;
    this.timedEvent;
    this.remainingTime;
    this.bgMusic;
    this.coinMusic;
  }

  preload() {
    this.load.image("bg", "/assets/bg.png");
    this.load.image("basket", "/assets/basket.png");
    this.load.image("apple", "/assets/apple.png");
    this.load.image("beetle", "/assets/beetle.png");
    this.load.image("money", "/assets/money.png");
    this.load.audio("coin", "/assets/coin.mp3");
    this.load.audio("bgMusic", "/assets/bgMusic.mp3");
  }
  
  create() {
    this.bgMusic = this.sound.add("bgMusic");
    this.bgMusic.play();

    this.add.image(0, 0, "bg").setOrigin(0, 0);

    this.player = this.physics.add.image(50, sizes.height - 100, "basket");
    this.player.setCollideWorldBounds(true);
    this.player.setImmovable(true);

    this.apples = this.physics.add.group();
    this.beetles = this.physics.add.group();

    this.physics.add.overlap(this.player, this.apples, this.collectApple, null, this);
    this.physics.add.overlap(this.player, this.beetles, this.hitBeetle, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      font: "25px Arial",
      fill: "#000000",
    });

    this.textTime = this.add.text(10, 10, "Remaining Time: 30", {
      font: "25px Arial",
      fill: "#000000",
    });
    
    this.timedEvent = this.time.addEvent({
      delay: 30000,
      callback: this.gameOver,
      callbackScope: this,
      loop: false
    });

    this.appleTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnApple,
      callbackScope: this,
      loop: true
    });

    this.beetleTimer = this.time.addEvent({
      delay: 300,
      callback: this.spawnBeetle,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    this.remainingTime = Math.ceil((this.timedEvent.delay - this.timedEvent.elapsed) / 1000);
    this.textTime.setText(`Remaining Time: ${this.remainingTime}`);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speedDown);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speedDown);
    } else {
      this.player.setVelocityX(0);
    }
  }

  spawnApple() {
    const randomX = Phaser.Math.Between(20, sizes.width - 20);
    const apple = this.apples.create(randomX, 0, "apple");
    apple.setVelocity(0, speedDown);
  }

  spawnBeetle() {
    const randomX = Phaser.Math.Between(10, sizes.width - 20);
    const beetle = this.beetles.create(randomX, 0, "beetle");
    beetle.setVelocity(0, speedDown);
  }

  collectApple(player, apple) {
    apple.destroy();
    this.points++;
    this.textScore.setText(`Score: ${this.points}`);
  
    // Play coin sound
    if (!this.coinMusic) {
      this.coinMusic = this.sound.add("coin");
    }
    this.coinMusic.play();
  
    // Create a particle emitter at the player's position
    this.emitter = this.add.particles(0,0, "money",{
      speed: 100,
      gravityY:speedDown-200,
      scale:0.04,
      duration: 100,
      emitting:false
    })

    this.emitter.startFollow(this.player, this.player.width/2, this.player.height/2, true)
    this.emitter.start()
  }
  
  hitBeetle(player, beetle) {
    beetle.destroy();
    if (this.points > 0) {
      this.points--;
      this.textScore.setText(`Score: ${this.points}`);
    }
  }

  gameOver() {
    this.bgMusic.stop();
    // this.scene.stop("scene-game");
    const win = this.points >= 10;
    gameWinLoseSpan.textContent = win ? "Win!" : "Lose!";
    gameEndScoreSpan.textContent = this.points;
    gameEndDiv.style.display = "flex";
  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: true
    }
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);

gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none";
  gameCanvas.style.display = "flex";
  game.scene.start("scene-game");
});

gameReStartBtn.addEventListener("click", () => {
    
  window.location.reload();
});
