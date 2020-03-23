var MyGame = {};

MyGame.Boot = function() {};

MyGame.Boot.prototype.constructor = MyGame.Boot;
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
            reticle: null,
            playerBullets: null,

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
        this.speed = 3;
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
        //this.speed += .1;
        //   console.log(this.speed)
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
var score = 0;
var scoreText;
var endScore = score;
var endScoreText;
var life = 100;
var lifeText;
var shield = 100;
var shieldText;


function preload() {

    // Load in images and sprites
    this.load.image('player', 'assets/images/tank.png', { frameWidth: 66, frameHeight: 60 });
    this.load.image('bullet', 'assets/images/bullet6.png');
    this.load.image('asteroid', 'assets/images/asteroid.png');
    this.load.image('city', 'assets/images/city.png');
    this.load.image('city75', 'assets/images/city75.png');
    this.load.image('city50', 'assets/images/city50.png');
    this.load.image('city25', 'assets/images/city25.png');
    this.load.image('city0', 'assets/images/city0.png');



    this.load.image('target', 'assets/images/ball.png');

    this.load.image('background', 'assets/images/bg.png');
    this.load.image('bg25', 'assets/images/bg25.png');
    this.load.image('bg50', 'assets/images/bg50.png');
    this.load.image('bg75', 'assets/images/bg75.png');
    this.load.image('bg100', 'assets/images/bg100.png');




    this.load.image('topBar', 'assets/images/topBar.png');

    this.load.image('blueBar', 'assets/images/blueBar.png');

    this.load.image('redBar', 'assets/images/redBar.png');

    this.load.image('platform', 'assets/images/platform.png');

    this.load.spritesheet('shieldRecharge', 'assets/images/shield.png', { frameWidth: 66, frameHeight: 60 });

    this.load.image('title', 'assets/images/title.png');

    this.load.image('gameOver', 'assets/images/gameOver.png');

    this.load.audio('bgm', [
        'assets/music/soundtrack.ogg'
    ]);

    this.load.audio('shoot', [
        'assets/music/shoot.ogg'
    ]);

    this.load.audio('explosion', [
        'assets/music/explosion.ogg'
    ]);
}

function create() {

    this.shoot = this.sound.add("shoot");

    this.bgm = this.sound.add("bgm");
    this.bgm.play();
    this.bgm.loop = true;

    // Set world bounds
    this.physics.world.setBounds(0, 0, 1080, 600);

    // Add 2 groups for Bullet objects
    playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    // Add background player, enemy, reticle, healthpoint sprites
    background = this.add.image(config.width / 2, config.height / 2, 'background');
    city = this.add.image(config.width / 2, 560, 'city');
    player = this.physics.add.sprite(540, 580, 'player').setScale(1.5);
    platform = this.physics.add.sprite(540, 595, 'platform').setScale(1.5);

    title = this.physics.add.sprite(config.width / 2, -200, 'title');
    gameOver = this.physics.add.sprite(config.width / 2, 800, 'gameOver');

    endScoreText = this.add.text(config.width / 2 + 10, 935, score, {
        fontSize: '30px',
        fill: '#ffffff'
    });

    shieldRecharge = this.physics.add.sprite(-3500, 100, 'shieldRecharge').setScale(2);

    enemy = this.physics.add.sprite(100, -3000, 'asteroid').setScale(.2);
    enemy2 = this.physics.add.sprite(200, -3200, 'asteroid').setScale(.2);
    enemy3 = this.physics.add.sprite(500, -3300, 'asteroid').setScale(.2);
    enemy4 = this.physics.add.sprite(900, -3400, 'asteroid').setScale(.2);
    enemy5 = this.physics.add.sprite(600, -3500, 'asteroid').setScale(.2);

    tBar = this.physics.add.sprite(540, 15, 'topBar');

    bBar1 = this.physics.add.sprite(180, 15, 'blueBar');
    bBar2 = this.physics.add.sprite(220, 15, 'blueBar');
    bBar3 = this.physics.add.sprite(260, 15, 'blueBar');
    bBar4 = this.physics.add.sprite(300, 15, 'blueBar');

    rBar1 = this.physics.add.sprite(665, 15, 'redBar');
    rBar2 = this.physics.add.sprite(705, 15, 'redBar');
    rBar3 = this.physics.add.sprite(745, 15, 'redBar');
    rBar4 = this.physics.add.sprite(785, 15, 'redBar');

    reticle = this.physics.add.sprite(540, 300, 'target');

    this.fallingAsteroid = this.physics.add.group();
    this.fallingAsteroid.add(enemy);
    this.fallingAsteroid.add(enemy2);
    this.fallingAsteroid.add(enemy3);
    this.fallingAsteroid.add(enemy4);
    this.fallingAsteroid.add(enemy5);

    // Set image/sprite properties
    background.setDisplaySize(1080, 600);
    reticle.setOrigin(0.5, 0.5).setDisplaySize(10, 10).setCollideWorldBounds(true);


    // Set sprite variables
    player.health = 3;

    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.input.keyboard.on('keydown_SPACE', function(pointer, time, lastFired) {
        var bullet = playerBullets.get().setActive(true).setVisible(true);

        if (bullet) {
            bullet.fire(player, reticle);
            this.shoot.play();

            this.physics.add.collider(this.fallingAsteroid, bullet, hitEnemy);
            this.physics.add.collider(shieldRecharge, bullet, hitRecharger);
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


    scoreText = this.add.text(990, 7, score, {
        fontSize: '20px',
        fill: '#ffffff'
    });


    lifeText = this.add.text(585, 7, life + '%', {
        fontSize: '20px',
        fill: '#ffffff'
    });

    shieldText = this.add.text(100, 7, shield + '%', {
        fontSize: '20px',
        fill: '#ffffff'
    });
}


function update(time, delta, stars) {
    enemy.angle += 1;
    enemy2.angle += 1.2;
    enemy3.angle += 1.4;
    enemy4.angle += 1.6;
    enemy5.angle += 1.8;

    title.y += 1;
    if (shield < 75 && shield > 50) {
        bBar4.setVisible(false);
        city.setTexture('city75');
    } else
    if (shield > 75) {
        bBar4.setVisible(true);
    }

    if (shield < 50 && shield > 25) {
        bBar3.setVisible(false);
        city.setTexture('city50');
    } else if (shield > 50) {
        bBar3.setVisible(true);
    }

    if (shield < 25 && shield > 0) {
        bBar2.setVisible(false);
        city.setTexture('city25');
    } else if (shield > 25) {
        bBar2.setVisible(true);
    }

    if (shield == 0) {
        bBar1.setVisible(false);
        city.setTexture('city0');
    } else if (shield > 0) {
        bBar1.setVisible(true);
    }


    if (life < 75 && life > 50) {
        rBar4.setVisible(false);
        background.setTexture('bg25');
    } else if (shield > 75) {
        rBar4.setVisible(true);
    }

    if (life < 50 && life > 25) {
        rBar3.setVisible(false);
        background.setTexture('bg50');
    } else if (shield > 50) {
        rBar3.setVisible(true);
    }

    if (life < 25 && life > 0) {
        rBar2.setVisible(false);
        background.setTexture('bg75');
    } else if (shield > 25) {
        rBar2.setVisible(true);
    }

    if (life == 0) {
        rBar1.setVisible(false);
        background.setTexture('bg100');
    } else if (shield > 0) {
        rBar1.setVisible(true);
    }







    if (life <= 0) {
        life = 0;
        shield = 0;

        enemy.y = -1000000;
        enemy2.y = -100000;
        enemy3.y = -100000;
        enemy4.y = -100000;
        enemy5.y = -100000;

        // shieldRecharge.setActive(false);
        shieldRecharge.x = -1000000;

        shieldRecharge.y = -1000000;

        endScoreText.y -= 1;
        gameOver.y -= 1;
        if (gameOver.y == config.height / 2) {
            //  this.bgm.stop();
            endScoreText.y += 2;
            gameOver.y += 2;
            //   this.scene.stop();
        }

        //alert('Game Over')
    }
    speeder = 1 + (1 * (1 * (time / 1000 / 30)));
    //console.log(speeder)
    // Rotates player to face towards reticle
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);
    moveShip(enemy, speeder);
    moveShip(enemy2, speeder);
    moveShip(enemy3, speeder);
    moveShip(enemy4, speeder);
    moveShip(enemy5, 0);

    moveRecharger(shieldRecharge, 1.5);

    //moveShip(enemy, 2);

    //Make reticle move with player
    reticle.body.velocity.x = player.body.velocity.x;
    reticle.body.velocity.y = player.body.velocity.y;

    // Constrain velocity of player
    constrainVelocity(player, 500);

    // Constrain position of constrainReticle
    constrainReticle(reticle);

}



///////
function moveShip(ship, speed) {
    ship.y += speed;
    if (ship.y > config.height - 40) {
        if (shield > 0) {
            shield -= 2;
        } else if (shield <= 0) {
            life -= 2;
        }
        lifeText.setText(life + '%');
        shieldText.setText(shield + '%');
        this.resetAsterPos(ship);
    }
}

function resetAsterPos(ship) {
    // console.log('new');
    var randomY = Phaser.Math.Between(0, config.height - 700);
    ship.y = randomY;
    var randomX = Phaser.Math.Between(50, config.width - 50);
    ship.x = randomX;
}


function hitEnemy(bulletHit, enemy) {
    // if (bulletHit.y > 1080 || bulletHit.y < 0 || bulletHit.x > 800 || bulletHit.x < 0) {
    //     console.log('destroy')
    //     bulletHit.destroy();
    // }
    bulletHit.destroy();
    score += 1;
    scoreText.setText(score);
    endScoreText.setText(score);
    resetAsterPos(enemy);
}

//////////////////////////

function moveRecharger(recharger, speed, sound) {
    recharger.x += speed;
    if (recharger.x > config.width - 40) {
        resetRechargerPos(recharger);
    }
}


function resetRechargerPos(recharger) {
    console.log('new recharge')

    recharger.x = -500;
    var randomY = Phaser.Math.Between(100, 200);
    recharger.y = randomY;
}


function hitRecharger(charger, bulletHit) {
    // if (bulletHit.y > 1080 || bulletHit.y < 0 || bulletHit.x > 800 || bulletHit.x < 0) {
    //     console.log('destroy')
    //     bulletHit.destroy();
    // }

    bulletHit.destroy()

    if (shield < 100)(
        shield += 10
    )

    if (shield > 100) {
        shield = 100;
    }
    shieldText.setText(shield + '%');
    console.log('hit');
    resetRechargerPos(charger);
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