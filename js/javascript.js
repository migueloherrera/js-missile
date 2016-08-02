//////// Global variables ////////

var canvasElement = $('#myCanvas')[0];
var canvas = canvasElement.getContext("2d");
var CANVAS_WIDTH = $('#myCanvas').width();
var CANVAS_HEIGHT = $('#myCanvas').height();
var FPS = 25;

//////////// Base ////////////////
function drawBase(startX, startY) {
  canvas.beginPath();
  canvas.moveTo(startX, startY);
  canvas.lineTo(startX + 30, startY - 30);
  canvas.lineTo(startX + 35, startY - 20);
  canvas.lineTo(startX + 45, startY - 20);
  canvas.lineTo(startX + 50, startY - 30);
  canvas.lineTo(startX + 80, startY);
  canvas.fillStyle = "yellow";
  canvas.fill();
}

//////////// Landscape ///////////
function drawLandscape() {
  drawBase(0, 450);
  drawBase(250, 450);
  drawBase(500, 450);
  canvas.fillRect(0, 450, 580, 480);
}

///////////// Game ///////////////
function Game() {
  drawLandscape();
  this.cities = [new City(100), new City(150), new City(200), new City(350), new City(400), new City(450)];
  this.missiles = [];
  this.bombs = [];
}

Game.prototype = {
  constructor: Game,
  update: function() {
    // updates all values
    this.missiles.forEach(function(m) { m.update(); });
    this.missiles = this.missiles.filter(function(m){ return m.speed !== 0 });
    this.bombs.forEach(function(b) { b.update(); });
    this.bombs = this.bombs.filter(function(b){ return b.speed !== 0 });
  },
  draw: function() {
    // draw all objects
    canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawLandscape();
    this.cities.forEach(function(c) { c.place(); });
    this.missiles.forEach(function(m) { m.place(); });
    this.bombs.forEach(function(b) { b.place(); });
  }
}
///////////// City ///////////////
function City(cityX) {
  this.cityX = cityX;
}

City.prototype = {
  constructor: City,
  place: function() {
    //console.log("X: " +  this.cityX);
    canvas.fillStyle = "#3535FF";
    canvas.fillRect(this.cityX, 455, 20, 10);
  }
}

/////////// Missile //////////////
function Missile(toX, toY) {
  this.toX = toX;
  this.toY = toY;
  if (toX < 180) { this.fromX = 40; }
  else if (toX >= 180 && toX <= 400) { this.fromX = 290; }
  else if (toX > 400) { this.fromX = 550; }
  this.fromY = 450;
  
  var x = this.toX - this.fromX;
  var y = this.toY - this.fromY;
  
  this.angle = Math.atan(x / y);
  this.speed = 6;
  this.distance = 0;
  console.log("Angle: " + this.angle);
}

Missile.prototype = {
  constructor: Missile,
  update: function() {
    this.distance -= this.speed;
    this.posX = Math.sin(this.angle) * this.distance + this.fromX;
    this.posY = Math.cos(this.angle) * this.distance + this.fromY;
    if (this.posY <= this.toY) { 
      this.speed = 0; 
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
function Bomb() {
  this.toX = Math.floor(Math.random() * CANVAS_WIDTH);
  this.toY = 450;
  this.fromX = Math.floor(Math.random() * CANVAS_WIDTH);
  this.fromY = 0;
  
  var x = this.toX - this.fromX;
  var y = this.toY - this.fromY;
  
  this.angle = Math.atan(x / y);
  this.speed = 4;
  this.distance = 0;
  console.log("Bomb angle: " + this.angle);
}

Bomb.prototype = {
  constructor: Bomb,
  update: function() {
    this.distance += this.speed;
    this.posX = Math.sin(this.angle) * this.distance + this.fromX;
    this.posY = Math.cos(this.angle) * this.distance + this.fromY;
    if (this.posY >= this.toY) { // or it gets into the missile blast
      this.speed = 0; 
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

  // game loop
  setInterval(function() {
    game.update();
    game.draw();
  }, 1000/FPS);
  
  $('#container').on('click', function(event) {
    var toX = event.pageX - this.offsetLeft;
    var toY = event.pageY - this.offsetTop;
    if (toY < 400) {
      game.missiles.push(new Missile(toX, toY));
    }
    console.log(toX, toY);
    game.bombs.push(new Bomb());
  });
});

/* 
var startX = 150;
var startY = 50;
var endX = 100;
var endY = 189;
var amount = 0;
setInterval(function() {
    amount += 0.005; // change to alter duration
    if (amount > 1) amount = 1;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.strokeStyle = "black";
    c.moveTo(startX, startY);
    // lerp : a  + (b - a) * f
    c.lineTo(startX + (endX - startX) * amount, startY + (endY - startY) * amount);
    c.stroke();
}, 30);
*/
