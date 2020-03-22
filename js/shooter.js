var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1080,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            player: null,
            healthpoints: null,
            reticle: null,
            moveKeys: null,
            playerBullets: null,
            enemyBullets: null,
            time: 0,
        }
    }
};


var game = new Phaser.Game(config);

var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    // Bullet Constructor
        function Bullet(scene) {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    },

    // Fires a bullet from the player to the reticle
    fire: function(shooter, target) {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y) {
            this.xSpeed = this.speed * Math.sin(this.direction);
            this.ySpeed = this.speed * Math.cos(this.direction);
        } else {
            this.xSpeed = -this.speed * Math.sin(this.direction);
            this.ySpeed = -this.speed * Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },

    // Updates the position of the bullet each cycle
    update: function(time, delta) {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

var fallingAsteroid;
var stars;

function preload() {
    // Load in images and sprites
    this.load.spritesheet('player', 'assets/images/tank.png', { frameWidth: 66, frameHeight: 60 }); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
    this.load.image('bullet', 'assets/images/bullet6.png');
    this.load.image('asteroid', 'assets/images/asteroid.png');
    //  this.load.image('asteroid2', 'assets/images/asteroid2.png');
    this.load.image('target', 'assets/images/ball.png');
    this.load.image('background', 'assets/images/underwater1.png');
    this.load.spritesheet('enemy', 'assets/images/tank.png', { frameWidth: 66, frameHeight: 60 }); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
}

function create() {
    // Set world bounds
    this.physics.world.setBounds(0, 0, 1080, 600);

    // Add 2 groups for Bullet objects
    playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    // Add background player, enemy, reticle, healthpoint sprites
    var background = this.add.image(config.width / 2, config.height / 2, 'background');
    player = this.physics.add.sprite(540, 570, 'player').setScale(2);

    enemy = this.physics.add.sprite(540, 300, 'asteroid').setScale(.2);
    enemy2 = this.physics.add.sprite(540, 300, 'asteroid').setScale(.2);
    enemy3 = this.physics.add.sprite(540, 300, 'asteroid').setScale(.2);
    enemy4 = this.physics.add.sprite(540, 300, 'asteroid').setScale(.2);
    enemy5 = this.physics.add.sprite(540, 300, 'asteroid').setScale(.2);

    reticle = this.physics.add.sprite(540, 300, 'target');
    hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5);
    hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5);
    hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5);

    // asteroid = this.physics.add.sprite(config.width / 2 - 50, config.height / 2, "asteroid").setScale(.2);
    // asteroid2 = this.physics.add.sprite(config.width / 2 - 50, config.height / 2, "asteroid2").setScale(.2);

    this.fallingAsteroid = this.physics.add.group();
    this.fallingAsteroid.add(enemy);
    this.fallingAsteroid.add(enemy2);
    this.fallingAsteroid.add(enemy3);
    this.fallingAsteroid.add(enemy4);
    this.fallingAsteroid.add(enemy5);
    //  fallingAsteroid.add(enemy);
    // fallingAsteroid.add(asteroid);


    // Set image/sprite properties
    background.setDisplaySize(1080, 600);
    reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);
    hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

    // Set sprite variables
    player.health = 3;



    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.input.keyboard.on('keydown_SPACE', function(pointer, time, lastFired) {
        var bullet = playerBullets.get().setActive(true).setVisible(true);
        bullet.fire(player, reticle);

        if (bullet) {
            bullet.fire(player, reticle);
            //  this.physics.add.collider(fallingAsteroid, bullet, enemyHitCallback);
            this.physics.add.collider(this.fallingAsteroid, bullet, hitEnemy);
        }
    }, this);


    // Pointer lock will only work after mousedown
    game.canvas.addEventListener('mousedown', function() {
        game.input.mouse.requestPointerLock();
    });

    // Exit pointer lock when Q or escape (by default) is pressed.
    this.input.keyboard.on('keydown_Q', function(event) {
        if (game.input.mouse.locked)
            game.input.mouse.releasePointerLock();
    }, 0, this);

    // Move reticle upon locked pointer move
    this.input.on('pointermove', function(pointer) {
        if (this.input.mouse.locked) {
            reticle.x += pointer.movementX;
            reticle.y += pointer.movementY;
        }
    }, this);

}


function update(time, delta, stars) {


    // Rotates player to face towards reticle
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);
    moveShip(enemy, 1);
    moveShip(enemy2, 2);
    moveShip(enemy3, 3);
    moveShip(enemy4, 2);
    moveShip(enemy5, 2.5);


    //moveShip(enemy, 2);

    //Make reticle move with player
    reticle.body.velocity.x = player.body.velocity.x;
    reticle.body.velocity.y = player.body.velocity.y;

    // Constrain velocity of player
    constrainVelocity(player, 500);

    // Constrain position of constrainReticle
    constrainReticle(reticle);

}

function moveShip(ship, speed) {
    ship.y += speed;
    if (ship.y > config.height) {
        this.resetShipPos(ship);
    }
}

function resetShipPos(ship) {
    console.log('new');

    ship.y = 0;
    var randomX = Phaser.Math.Between(0, config.width);
    ship.x = randomX;
}

function enemyHitCallback(enemyHit, bulletHit, ship) {

    bulletHit.destroy();
    //fallingAsteroid.setActive(false).setVisible(false);
    console.log('hit')
    enableEnemy();

}

function enableEnemy() {
    console.log('active');
    var randomY = Phaser.Math.Between(0, config.height - 700);
    enemy.y = randomY;
    var randomX = Phaser.Math.Between(0, config.width);
    enemy.x = randomX;
    enemy.setActive(true).setVisible(true);

}


function hitEnemy(bulletHit, enemy) {

    //var explosion = new Explosion(this, enemy.x, enemy.y);
    bulletHit.destroy()
        //  projectile.destroy();
    resetShipPos(enemy);
    // this.score += 15;

    // var scoreFormated = this.zeroPad(this.score, 6);
    // this.scoreLabel.text = "SCORE " + scoreFormated;

    // // 1.4 play sounds
    // this.explosionSound.play();
}
































// Ensures sprite speed doesnt exceed maxVelocity while update is called
function constrainVelocity(sprite, maxVelocity) {
    if (!sprite || !sprite.body)
        return;

    var angle, currVelocitySqr, vx, vy;
    vx = sprite.body.velocity.x;
    vy = sprite.body.velocity.y;
    currVelocitySqr = vx * vx + vy * vy;

    if (currVelocitySqr > maxVelocity * maxVelocity) {
        angle = Math.atan2(vy, vx);
        vx = Math.cos(angle) * maxVelocity;
        vy = Math.sin(angle) * maxVelocity;
        sprite.body.velocity.x = vx;
        sprite.body.velocity.y = vy;
    }
}



// Ensures reticle does not move offscreen
function constrainReticle(reticle) {
    var distX = reticle.x - player.x; // X distance between player & reticle
    var distY = reticle.y - player.y; // Y distance between player & reticle

    // Ensures reticle cannot be moved offscreen (player follow)
    if (distX > 800)
        reticle.x = player.x + 800;
    else if (distX < -800)
        reticle.x = player.x - 800;

    if (distY > 600)
        reticle.y = player.y + 600;
    else if (distY < -600)
        reticle.y = player.y - 600;
}