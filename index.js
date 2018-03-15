let surface23 = `2
0 750
6999 750`;

let surface = `6
0 1500
1000 2000
2000 500
3500 500
5000 1500
6999 1000`;

let surface12 = `8
0 1000
500 1500
1000 1000
1500 1500
2000 1000
2500 1500
3000 1000
6999 1500
`;

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
  this.planes = [];
  for(let i = 1, j = this.points.length - 2; i < this.points.length - 1; j = i++) {
    let a = this.points[i];
    let b = this.points[j];
    if (a.y == b.y) planes.push([a, b]);
  }
}

Polygon.prototype.onRangeXofPlane = function(point) {
  for (let i = 0, i < planes.length; i += 1) {
    let a = this.planes[i][0];
    let b = this.planes[i][1];
    if ((point.x >= a.x && point.x <= b.x) || (point.x >= b.x && point.x <= a.x)) {
      return true;
    }
  }
  return false;
}

Polygon.prototype.distanceToPlane = function(point) {
  for (let i = 0, i < planes.length; i += 1) {
    let a = this.planes[i][0];
    let b = this.planes[i][1];
    if ((point.x >= a.x && point.x <= b.x) || (point.x >= b.x && point.x <= a.x)) {
      return true;
    }
  }
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

Lander.prototype.update = function(gene, timer) {
  let newX = this.position.x + this.velocity.x * timer;
  let newY = this.position.y + this.velocity.y * timer;
  let c = new Vector(gene.power, (90 + gene.angle) * Math.PI / 180).toCartesian().add(gravity);
  let newVx = this.velocity.x + c.x * timer;
  let newVy = this.velocity.y + c.y * timer;
  let newFuel = this.fuel;
  let newPower = this.power;
  return new Lander(newX, newY, newVx, newVy, newFuel, newPower);
}

Lander.prototype.draw = function() {
  let p = this.position.translate();
  ellipse(p.x, p.y, 5, 5);
}

Lander.prototype.debug = function() {
  let a = this.position;
  let v = this.velocity;
  let t = `Position: (${int(a.x)}, ${int(a.y)}) | Vel: (${int(v.x)}, ${int(v.y)})`;
  stroke(0);
  fill(255);
  text(t, 10, 20);
}

let points;
let lander;
let gravity = new Vector(0, -3.711);
let t = 0.1;
let timerControl = 0;
let genesIdx = 0;
let genes;
let surfacePolygon;
let hitPlane = false;

function setup() {
  createCanvas(700,300);
  let surfaceIn = surface.split(/\W+/);
  let p = +surfaceIn[0];
  genes = new Array(1200).fill().map(() => new Gene());
  points = new Array(p).fill().map((a, idx) => {
    let offSet = idx * 2 + 1;
    return new Point(+surfaceIn[offSet], +surfaceIn[offSet + 1]);
  });
  surfacePolygon = new Polygon([].concat.apply([], [new Point(0, 0), points, new Point(6999, 0)]));
  lander = new Lander(1650, 2500, 0, 0, 1000, 0);
}


function draw() {
  background(55);
  stroke(0);
  fill(255);
  text(`Gene Idx: ${genesIdx} - ${genes[genesIdx].debug()}`, 10, 40);
  text(`Inside: ${surfacePolygon.inside(lander.position)}`, 10, 60);
  stroke(255);
  for (let i = 0; i < points.length - 1; i += 1) {
    let a = points[i].translate();
    let b = points[i + 1].translate();
    line(a.x, a.y, b.x, b.y);
  }
  lander.draw();
  lander.debug();

  if (timerControl < genes[genesIdx].turns) {
    if (!hitPlane)
      lander = lander.update(genes[genesIdx], t);
    timerControl += t;
  } else {
    timerControl = 0;
    genesIdx += 1;
    if (genesIdx >= genes.length) genesIdx = 0;
  }

  if (surfacePolygon.inside(lander.position)) {
    if (surfacePolygon.onPlaneSegment(lander.position)) {
      hitPlane = true;
    } else {
      lander.position = new Point(2000, 2500);
      lander.velocity = new Vector(0, 0);
    }

  }
}

// GENETIC ALGORITHM
const MUTATION_RATE = 0.06;
const UNIFORM_RATE = 0.5;
const DNA_SIZE = 1200;
const POPULATION_SIZE = 20;

function Gene() {
  this.power = int(random(0, 5));
  this.angle = int(random(-90, 91));
  this.turns = int(random(1, 6));
}

Gene.prototype.mutate = function() {
  return Math.random() < MUTATION_RATE ? new Gene() : this;
}

Gene.prototype.debug = function() {
  return `p: ${this.power}; a: ${this.angle}; t: ${this.turns}`;
}

// Gene

function Dna(size) {
  this.genes = new Array(size).fill().map(() => new Gene());
}

Dna.prototype.crossover = function(partner) {
  return this.genes.map((gene, idx) => Math.random() < UNIFORM_RATE ? gene.mutate() : partner.genes[idx].mutate());
}

function State(lander, dna) {
  this.lander = lander;
  this.dna = dna;
  this.trajectory = []
}

State.prototype.compute = function() {
  let curr = lander;
  for(let i = 0; i < this.dna.genes.length; i += 1) {
    curr = lander.update(this.dna.genes[i], 1);
    this.trajectory.push(curr);
    if (surfacePolygon.inside(curr)) {
      if (surfacePolygon.onPlaneSegment(curr)) {
        curr.state = 'LANDED';
      } else {
        curr.state = 'CRASHED';
      }
      break;
    } else {
      curr.state = 'FLYING';
    }
  }
  switch(curr.state) {
    case 'FLYING':

  this.fitness = 0;
}


