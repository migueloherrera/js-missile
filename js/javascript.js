// Global variables

var canvasElement = $('#myCanvas')[0];
var canvas = canvasElement.getContext("2d");
var CANVAS_WIDTH = $('#myCanvas').width();
var CANVAS_HEIGHT = $('#myCanvas').height();
var FPS = 25;

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

function drawLandscape() {
  drawBase(0, 450);
  drawBase(250, 450);
  drawBase(500, 450);
  canvas.fillRect(0, 450, 580, 480);
}
  
function Game() {
  drawLandscape();
  this.cities = [new City(100), new City(150), new City(200), new City(350), new City(400), new City(450)];
}

Game.prototype = {
  constructor: Game,
  update: function() {
    // updates all values
  },
  draw: function() {
    // draw all objects
    this.cities.forEach(function(c) { c.place(); });
  }
}

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

$(document).ready(function() {
  var game = new Game();

  // game loop
  setInterval(function() {
    game.update();
    game.draw();
  }, 1000/FPS);
  
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
