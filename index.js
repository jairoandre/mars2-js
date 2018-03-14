let surface = `6
0 1500
1000 2000
2000 500
3500 500
5000 1500
6999 1000`;

function Vector(x, y) {
  this.x = +x;
  this.y = +y;
}

Vector.prototype.toCartesian = function() {
  return new Vector(this.x * Math.cos(this.y), this.x * Math.sin(this.y));
}

Vector.prototype.mag2 = function() {
  return this.x * this.x + this.y * this.y;
}

Vector.prototype.mag = function() {
  return Math.sqrt(this.mag2());
}

Vector.prototype.toPolar = function() {
  return new Vector(this.mag, Math.atan2(this.y, this.x));
}

Vector.prototype.add = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.sub = function(other) {
  return new Vector(this.x - other.x, this.y - other.y);
}

// POINT CLASS

function Point(x, y) {
  this.x = +x;
  this.y = +y;
}

Point.prototype.translate = function() {
  return new Point(this.x / 10, height - this.y / 10);
}

// POLYGON CLASS

function Polygon(points) {
  this.points = points;
}

Polygon.prototype.inside = function(point) {
  let inside = false;
  for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
    let iPoint = this.points[i];
    let jPoint = this.points[j];
    let intersect = ((iPoint.y > point.y) != (jPoint.y > point.y)) &&
      (point.x < (jPoint.x - iPoint.x) * (point.y - iPoint.y) / (jPoint.y - iPoint.y) + iPoint.x);
    if (intersect) inside = !inside;
  }
  return inside;
}

// LINE CLASS (for drawing purposes)

function Line(a, b) {
  this.a = a;
  this.b = b;
}

function Lander(x, y, vx, vy, fuel, rotate, power) {
  this.position = new Point(x, y);
  this.velocity = new Vector(vx, vy);
  this.fuel = fuel;
  this.rotate = rotate;
  this.power = power;
}

Lander.prototype.update = function(gene) {
  let newX = this.position.x + this.velocity.x * t;
  let newY = this.position.y + this.velocity.y * t;
  let composed = new Vector(gene.power, (90 + gene.angle) * Math.PI / 180).add(gravity);
  let c = composed.toCartesian();
  text(`${c.x}, ${c.y}`, 10, 60);
  let newVx = this.velocity.x + c.x * t;
  let newVy = this.velocity.y + c.y * t;
  let newFuel = this.fuel;
  let newPower = this.power;
  return new Lander(newX, newY, newVx, newVy, newFuel, newPower);
}

Lander.prototype.draw = function() {
  let p = this.position.translate();
  ellipse(p.x, p.y, 20, 20);
}

Lander.prototype.debug = function() {
  let a = this.position;
  let v = this.velocity;
  let t = `Position: (${int(a.x)}, ${int(a.y)}) | Vel: (${int(v.x)}, ${int(v.y)})`;
  stroke(0);
  fill(255);
  text(t, 10, 20);
}

////////////////////
let points;
let lander;
let gravity = new Vector(-3.711, Math.PI / 2);
let t = 0.1;
let timerControl = 0;
let genesIdx = 0;
let genes;

function setup() {
  createCanvas(700,300);
  let surfaceIn = surface.split(/\W+/);
  let p = +surfaceIn[0];
  genes = new Array(1200).fill().map(() => new Gene());
  points = new Array(p).fill().map((a, idx) => {
    let offSet = idx * 2 + 1;
    return new Point(+surfaceIn[offSet], +surfaceIn[offSet + 1]);
  });
  lander = new Lander(1650, 2500, 0, 0, 1000, 0);
}


function draw() {
  background(55);
  stroke(0);
  fill(255);
  text(`Gene Idx: ${genesIdx} - ${genes[genesIdx].debug()}`, 10, 40);
  stroke(255);
  for (let i = 0; i < points.length - 1; i += 1) {
    let a = points[i].translate();
    let b = points[i + 1].translate();
    line(a.x, a.y, b.x, b.y);
  }
  lander.draw();
  lander.debug();

  if (timerControl < genes[genesIdx].turns) {
    lander = lander.update(genes[genesIdx]);
    timerControl += t;
  } else {
    timerControl = 0;
    genesIdx += 1;
    if (genesIdx >= genes.length) genesIdx = 0;
  }

  if (lander.position.y < 0) {
    lander.position.y = 1500;
  }
}

// GENETIC ALGORITHM

function Gene() {
  this.power = int(random(5));
  this.angle = int(random(-90, 91));
  this.turns = int(random(1, 6));
}

Gene.prototype.debug = function() {
  return `p: ${this.power}; a: ${this.angle}; t: ${this.turns}`;
}
