let points = [];
let voronoiCells = [];
let spikeTips = [];
let numPoints = 100;
let randomDistanceSlider;
let numPointsSlider;

function setup() {
  let cnv = createCanvas(550, 550, WEBGL);
  cnv.parent('sketch');
  cnv.position();
  generateRandomPoints(numPoints);
  calculateVoronoiDiagram(points);

  // Create the sliders.
  randomDistanceSlider = createSlider(0, 300, 100, 1);
  randomDistanceSlider.position(cnv.position().x, cnv.position().y);
  randomDistanceSlider.addClass("sliders");
  randomDistanceSlider.parent('sketch');

  numPointsSlider = createSlider(0, 100, 20, 1);
  numPointsSlider.position(cnv.position().x, cnv.position().y + 30);
  numPointsSlider.addClass("sliders");
  randomDistanceSlider.parent('sketch');

}

function draw() {
  background(255);
  let locX = mouseX - width / 2;
  let locY = mouseY - height / 2;
  pointLight(250, 250, 250, locX, locY, 50);
  orbitControl(1, 1, 0.1);
  //normalMaterial();
  translate(0, 0, -600);
  rotateX(radians(240));
  rotateY(radians(0));
  rotateZ(radians(-30));

  ambientLight(255);
  //ambientMaterial(70, 130, 230);
  stroke(0, 100, 100);
  //pointLight(255, 255, 255, 200, 200, 400);
  
  // Update the randomDistance variable based on the slider value.
  let randomDistance = randomDistanceSlider.value();

  // Check if the numPointsSlider value has changed and regenerate points if necessary.
  if (numPointsSlider.value() != numPoints) {
    numPoints = numPointsSlider.value();
    points = [];
    generateRandomPoints(numPoints);
    calculateVoronoiDiagram(points);
  }

  for (let i = 0; i < voronoiCells.length; i++) {
    let cell = voronoiCells[i];
    let spikeTip = spikeTips[i];

    // Update the spikeTip based on the new randomDistance value.
    const centroid = p5.Vector.add(cell.a, p5.Vector.add(cell.b, cell.c)).div(3);
    const normal = computeTriangleNormal(cell.a, cell.b, cell.c);
    spikeTip = p5.Vector.add(centroid, p5.Vector.mult(normal, randomDistance));

    drawVoronoiSpike(cell, spikeTip);
  }
}


function generateRandomPoints(num) {
  for (let i = 0; i < num; i++) {
    points.push(createVector(random(-500, 500), random(-500, 500)));
  }
  
}

function calculateVoronoiDiagram(points) {
  
  voronoiCells = [];
  spikeTips = [];
  
  const delaunator = new Delaunator(points.flatMap(p => [p.x, p.y]));
  //console.log(delaunator.triangles);
  const triangles = delaunator.triangles;

  for (let i = 0; i < triangles.length; i += 3) {
    const a = points[triangles[i]];
    const b = points[triangles[i + 1]];
    const c = points[triangles[i + 2]];

    const center = circumcenter(a, b, c);
    console.log(center);

    const centroid = p5.Vector.add(a, p5.Vector.add(b, c)).div(3);

    const normal = computeTriangleNormal(a, b, c);
    const randomDistance = random(50, 150);
    const spikeTip = p5.Vector.add(centroid, p5.Vector.mult(normal, randomDistance));

    voronoiCells.push({ a, b, c, center, index: i });
    spikeTips.push(spikeTip);
  }
}

function computeTriangleNormal(a, b, c) {
  const u = p5.Vector.sub(b, a);
  const v = p5.Vector.sub(c, a);
  const normal = u.cross(v);
  normal.normalize();
  return normal;
}


function nextHalfedge(e, delaunator) {
  return (e % 3 === 2) ? e - 2 : e + 1;
}

function drawVoronoiSpike(cell, spikeTip) {
beginShape(TRIANGLES);
vertex(cell.a.x, cell.a.y, 0);
vertex(cell.b.x, cell.b.y, 0);
vertex(spikeTip.x, spikeTip.y, spikeTip.z);

vertex(cell.b.x, cell.b.y, 0);
vertex(cell.c.x, cell.c.y, 0);
vertex(spikeTip.x, spikeTip.y, spikeTip.z);

vertex(cell.c.x, cell.c.y, 0);
vertex(cell.a.x, cell.a.y, 0);
vertex(spikeTip.x, spikeTip.y, spikeTip.z);
endShape();

}

function circumcenter(a, b, c) {
  const D = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  const Ux = ((a.x * a.x + a.y * a.y) * (b.y - c.y) + (b.x * b.x + b.y * b.y) * (c.y - a.y) + (c.x * c.x + c.y * c.y) * (a.y - b.y)) / D;
  const Uy = ((a.x * a.x + a.y * a.y) * (c.x - b.x) + (b.x * b.x + b.y * b.y) * (a.x - c.x) + (c.x * c.x + c.y * c.y) * (b.x - a.x)) / D;
  return createVector(Ux, Uy);
}

function windowResized() {
  randomDistanceSlider.position(cnv.position().x, cnv.position().y);
  numPointsSlider.position(cnv.position().x, cnv.position().y + 30);
}





