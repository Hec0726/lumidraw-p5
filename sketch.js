let video, handpose, predictions = [];
let paintLayer;                // buffer donde se “pinta”
let prev = null;
const THRESH = 40;             // distancia para pinza
const SMOOTH = 0.3;            // suavizado

function setup() {
  createCanvas(windowWidth, windowHeight);
  paintLayer = createGraphics(width, height);   // capa persistente
  paintLayer.clear();

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => console.log('model ready'));
  handpose.on('predict', res => predictions = res);

  noCursor();                  // (opcional) oculta cursor
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  paintLayer.resizeCanvas(width, height);
  video.size(width, height);
}

function draw() {
  // --- mostrar video ---
  translate(width, 0); scale(-1, 1);   // espejo
  image(video, 0, 0, width, height);

  // --- mostrar capa de pintura encima ---
  image(paintLayer, 0, 0);

  // --- tracking mano ---
  if (predictions.length === 0) { prev = null; return; }
  const pts = predictions[0].landmarks;
  let [ix, iy] = pts[8];   // índice
  let [px, py] = pts[4];   // pulgar
  // escalado de coords a canvas
  ix = map(ix, 0, video.width, 0, width);
  iy = map(iy, 0, video.height, 0, height);
  px = map(px, 0, video.width, 0, width);
  py = map(py, 0, video.height, 0, height);

  const d = dist(ix, iy, px, py);

  // suavizado
  if (prev) {
    ix = lerp(prev.x, ix, SMOOTH);
    iy = lerp(prev.y, iy, SMOOTH);
  }

  // --- dibujar en buffer si pinza cerrada ---
  if (d < THRESH) {
    paintLayer.stroke(0, 255, 255);
    paintLayer.strokeWeight(4);
    if (prev) paintLayer.line(prev.x, prev.y, ix, iy);
    prev = { x: ix, y: iy };
  } else {
    prev = null;
  }

  // (opcional) circulitos guía
  noStroke(); fill(255, 0, 0);
  circle(ix, iy, 8);
  circle(px, py, 8);
}

// limpiar pantalla con tecla “c”
function keyPressed() {
  if (key === 'c' || key === 'C') paintLayer.clear();
}

