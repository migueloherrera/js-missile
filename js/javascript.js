//////// Global variables ////////
var canvasElement = $('#myCanvas')[0];
var canvas = canvasElement.getContext("2d");
var CANVAS_WIDTH = $('#myCanvas').width();
var CANVAS_HEIGHT = $('#myCanvas').height();
var FPS = 25;

//////////// Base ////////////////
function Base(startX, startY) {
  this.x = startX;
  this.y = startY;
  if (startX == 0) {
    this.number = 1;
  } else if (startX == 250) {
    this.number = 2;
  } else {
    this.number = 3;
  }
  this.half = startX + 40;
  this.destroy = false;
}

Base.prototype = {
  constructor: Base,
  place: function() {
    canvas.beginPath();
    canvas.fillStyle = "yellow";
    canvas.moveTo(this.x, this.y);
    canvas.lineTo(this.x + 30, this.y - 30);
    canvas.lineTo(this.x + 35, this.y - 20);
    canvas.lineTo(this.x + 45, this.y - 20);
    canvas.lineTo(this.x + 50, this.y - 30);
    canvas.lineTo(this.x + 80, this.y);
    canvas.closePath();
    canvas.fill();
  }
}

//////////// Landscape ///////////
function drawLandscape() {
  canvas.fillStyle = "yellow";
  canvas.fillRect(0, 450, 580, 480);
}

///////////// Game ///////////////
function Game() {
  drawLandscape();
  this.restart();
}

Game.prototype = {
  constructor: Game,
  restart: function() {
    drawLandscape();
    this.bases = [new Base(0, 450), new Base(250, 450), new Base(500, 450)];
    this.cities = [new City(100), new City(150), new City(200), new City(350), new City(400), new City(450)];
    this.missiles = [];
    this.bombs = [];
    this.explosions = []; 
    this.score = 0;
    this.level = 1;
    this.theEnd = false;
    this.started = false;
    this.playing = false;
    this.bombing = null;
    this.missileCount = 15;
  },
  reset: function() {
    this.bases = [new Base(0, 450), new Base(250, 450), new Base(500, 450)];
    this.cities = [new City(100), new City(150), new City(200), new City(350), new City(400), new City(450)];
    this.missiles = [];
    this.bombs = [];
    this.explosions = [];
  },
  next: function() {
    if (this.level == 1) {
      canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawLandscape();
    }
    canvas.font="22px arial";
    canvas.fillStyle = "#0229BF";
    canvas.fillText("Level: ", 200, 200);
    if (this.level > 1) {
      canvas.fillText("Cities saved: ", 200, 250);
      canvas.fillText("Bonus: ", 200, 300);
    }
    canvas.fillText("Click to continue...", 200, 350);
    canvas.fillStyle = "red";
    canvas.fillText(this.level, 270, 200);
    if (this.level > 1) {
      canvas.fillText(this.cities.length, 340, 250);
      canvas.fillText(this.cities.length * 100, 280, 300);
    }
  },
  createBombs: function() {
    var self1 = this;
    var times = 0;
    for (var i = 1; i <= 4; i++) { this.bombs.push(new Bomb(this.level)); }
    this.bombing = setInterval(function() {
      for (var i = 1; i <= 4; i++) { self1.bombs.push(new Bomb(self1.level)); }
      times++;
      if (times == (self1.level + 1)) { 
        clearInterval(self1.bombing); 
      }
    }, 5000);
  },
  update: function() {
    // updates all values
    if (this.cities.length == 0) { // game over
      this.theEnd = true;
    }
    
    if (this.bombs.length == 0 && this.explosions.length == 0) {
      this.playing = false;
      this.missileCount = 15 + (this.level * 2);
      this.level += 1;
      console.log(missileCount);
    }
    
    var self = this; // my head is spinning with bind, call and apply
    
    this.missiles.forEach(function(m) { 
      m.update();
      if (m.destroy) {
        self.explosions.push(new Explosion(m.toX, m.toY));
      }
    });
    this.missiles = this.missiles.filter(function(m){ return !m.destroy });
    this.bombs.forEach(function(b) { 
      b.update();
      // check if there are any explosions going on
      if (self.explosions.length > 0) { 
        self.explosions.forEach(function(e) {
          // define limits for the explosion
          var limitX1 = e.x - e.radius;
          var limitX2 = e.x + e.radius;
          var limitY1 = e.y - e.radius;
          var limitY2 = e.y + e.radius;
          // the bomb touches the explosion
          if (b.posX >= limitX1 && b.posX <= limitX2 && b.posY >= limitY1 && b.posY <= limitY2) { 
            b.destroy = true;
            self.score += 10;
          }
        });
      } 
      
      if (b.destroy) {
        self.explosions.push(new Explosion(b.posX, b.posY)); // create explosion at current coordinates
      }
    });
    this.bombs = this.bombs.filter(function(b) { return !b.destroy });
    this.explosions.forEach(function(e) { 
      e.update(); 
      
      var limitX1 = e.x - e.radius;
      var limitX2 = e.x + e.radius;
      var limitY1 = e.y - e.radius;
      var limitY2 = e.y + e.radius;
      
      // check if the explosion touches a city
      if (self.cities.length > 0) { 
        self.cities.forEach(function(c) {
          if (((c.cityX + 5) >= limitX1 && (c.cityX + 5) <= limitX2 && (c.cityY - 5) <= limitY2) ||
              ((c.cityX + 15) >= limitX1 && (c.cityX + 15) <= limitX2 && (c.cityY - 5) <= limitY2)) { 
            c.destroy = true;
          }
        });
      }
      // check if the explosion touches a base
      if (self.bases.length > 0) { 
        self.bases.forEach(function(ba) {
          if (ba.half >= limitX1 && ba.half <= limitX2 && ba.y <= limitY2) { 
            ba.destroy = true;
          }
        });
      } else {
        self.missileCount = 0;
      }
      
    });
    this.explosions = this.explosions.filter(function(e) { return !e.destroy });
    this.cities = this.cities.filter(function(c) { return !c.destroy });
    this.bases = this.bases.filter(function(ba) { return !ba.destroy });
  },
  draw: function() {
    // draw all objects
    canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawLandscape();
    
    canvas.font = "bold 22px arial";
    canvas.fillStyle = "#0229BF";
    canvas.fillText("Score: ", 10, 30);
    canvas.fillText("Level: ", 250, 30);
    canvas.fillText("Missiles left: ", 400, 30);
    canvas.fillStyle = "red";
    canvas.fillText(this.score, 85, 30);
    canvas.fillText(this.level, 320, 30);
    canvas.fillText(this.missileCount, 540, 30);    
    
    this.cities.forEach(function(c) { c.place(); });
    this.bases.forEach(function(ba) { ba.place(); });
    this.missiles.forEach(function(m) { m.place(); });
    this.bombs.forEach(function(b) { b.place(); });
    this.explosions.forEach(function(e) { e.place(); });
  },
  shootMissile: function(x, y) {
    this.toX = x;
    this.toY = y;
    var fromBase = 2;
    var baseNumbers = [];
    this.bases.forEach(function(b) { baseNumbers.push(b.number); });
    if (this.toY < 400) {
      if (baseNumbers.length > 0) {
        if (this.toX < 180) {
          fromBase = baseNumbers[0];
        } else if (this.toX >= 180 && this.toX <= 400) {
          if (baseNumbers.includes(2)) { fromBase = 2; }
          else if (baseNumbers.includes(1)){ 
            if (this.toX <= 290) { fromBase = 1; }
            else { 
              if (baseNumbers.includes(3)) { 
                fromBase = 3;            
              } else {
                fromBase = 1;
              } 
            }
          }
          else { fromBase = 3; }
        } else {
          if (baseNumbers.includes(3)) { fromBase = 3; }
          else if (baseNumbers.includes(2)) { fromBase = 2;}
          else { fromBase = 1; }
        }
        this.missileCount--;
        if (this.missileCount > 0) {
          this.missiles.push(new Missile(this.toX, this.toY, fromBase));
        }
      }
    }
  },
  over: function() {
    canvas.font = "bold 44px arial";
    canvas.fillStyle = "#0229BF";
    canvas.fillText("The end!!", 200, 200);
  }
}

///////////// Explosion //////////
function Explosion(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 1;
  this.up = true;
  this.destroy = false;
}

Explosion.prototype = {
  constructor: Explosion,
  update: function() {
    if (this.up) {
      if (this.radius < 25) { this.radius += 0.6; }
      else { this.up = false; }
    } else {
      if (this.radius > 5) { this.radius -= 0.6; }
      else { this.destroy = true; }
    }
  },
  place: function() {
    canvas.fillStyle = 'red';
    canvas.beginPath();
    canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    canvas.fill();
    canvas.closePath();
  }
}

///////////// City ///////////////
function City(cityX) {
  this.cityX = cityX;
  this.cityY = 455;
  this.destroy = false;
}

City.prototype = {
  constructor: City,
  place: function() {
    canvas.fillStyle = "#3535FF";
    canvas.fillRect(this.cityX, this.cityY, 20, 10);
  }
}

/////////// Missile //////////////
function Missile(toX, toY, base) {
  this.toX = toX;
  this.toY = toY;
  this.destroy = false;
  this.base = base;
  if (this.base == 1) { this.fromX = 40; }
  else if (this.base == 2) { this.fromX = 290; }
  else if (this.base == 3) { this.fromX = 540; }
  this.fromY = 450;
  
  var x = this.toX - this.fromX;
  var y = this.toY - this.fromY;
  
  this.angle = Math.atan(x / y);
  this.speed = 6;
  this.distance = 0;
}

Missile.prototype = {
  constructor: Missile,
  update: function() {
    this.distance -= this.speed;
    this.posX = Math.sin(this.angle) * this.distance + this.fromX;
    this.posY = Math.cos(this.angle) * this.distance + this.fromY;
    if (this.posY <= this.toY) { 
      this.destroy = true;
    }
  },
  place: function() {
    canvas.strokeStyle = "blue";
    canvas.beginPath();
    canvas.moveTo(this.fromX, this.fromY);
    canvas.lineTo(this.posX, this.posY);
    canvas.lineWidth = 2;
    canvas.closePath();
    canvas.stroke();
  }
}

/////////// Bomb //////////////
function Bomb(sp) {
  this.destroy = false;
  this.toX = Math.floor(Math.random() * CANVAS_WIDTH);
  this.toY = 450;
  this.fromX = Math.floor(Math.random() * CANVAS_WIDTH);
  this.fromY = 0;
  
  var x = this.toX - this.fromX;
  var y = this.toY - this.fromY;
  
  this.angle = Math.atan(x / y);
  this.speed = (sp * 0.2) + 1;
  this.distance = 0;
}

Bomb.prototype = {
  constructor: Bomb,
  update: function() {
    this.distance += this.speed;
    this.posX = Math.sin(this.angle) * this.distance + this.fromX;
    this.posY = Math.cos(this.angle) * this.distance + this.fromY;
    if (this.posY >= this.toY) { // if it has reached the ground
      this.destroy = true; 
    }
  },
  place: function() {
    canvas.strokeStyle = "red";
    canvas.beginPath();
    canvas.moveTo(this.fromX, this.fromY);
    canvas.lineTo(this.posX, this.posY);
    canvas.lineWidth = 2;
    canvas.closePath();
    canvas.stroke();
  }
}

///////////// main ///////////////
$(document).ready(function() {
  var game = new Game();
  var startGame = null;
    
  $('#container').on('click', function(event) {
    if (game.started && game.playing) {
      var toX = event.pageX - this.offsetLeft;
      var toY = event.pageY - this.offsetTop;
      game.shootMissile(toX, toY);
      console.log("Missiles left: ", game.missileCount);
    } else if (game.started && !game.playing) {
      game.playing = true;
      if (game.level > 1) {
        game.score += (game.cities.length * 100);
        game.reset();
      }
      game.createBombs();
    }
  });
  
  $('#play').on('click', function() {
    game.restart();
    game.started = true;
    $('#play').fadeOut();
    // game loop
    startGame = setInterval(function() {
      if (game.started && game.playing) {
        game.update();
        game.draw();
      } else if (game.started && !game.playing) {
        game.next();
      }
      if (game.theEnd) {
        game.over();
        clearInterval(startGame);
        $('#play').fadeIn();
      }
    }, 1000/FPS);
  });
  
});
