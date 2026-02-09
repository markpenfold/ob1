export default function ob1Sketch(p) {
  // ---- State ----
  let brush;
  let settings = {
    brushSize: 70,
    spring: 0.4,
    friction: 0.45,
    splitNum: 18,
    diff: 8,
    numBristles: 24,
    brushType: 'noise', // 'grid' or 'noise'
  };

  let paths = []; // each entry: { points: [...], pressures: [...] }
  let currentPathIndex = 0;
  let pathIndex = 0;
  let numGestures = 1;
  let rez = 24;

  // ---- p5 lifecycle ----

  p.setup = () => {
    p.createCanvas(700, 700);
    p.background(245);
    settings.bristles = settings.brushType === 'noise'
      ? generateNoiseBristleConfig(settings.numBristles)
      : generateBristleConfig(settings.numBristles);
    brush = new Brush(settings);
    drawPerfectO(350, 350, 250);
    generateSymbols(numGestures);
  };

  p.draw = () => {
    if (currentPathIndex >= paths.length) {
      p.noLoop();
      return;
    }

    if (!brush.active && currentPathIndex < paths.length) {
      let cur = paths[currentPathIndex];
      let pt = cur.points[0];
      brush.begin(pt.x, pt.y);
      pathIndex = 0;
    }

    if (brush.active && pathIndex < paths[currentPathIndex].points.length) {
      for (let i = 0; i < 3; i++) {
        let pt = paths[currentPathIndex].points[pathIndex];
        brush.step(pt.x, pt.y);
        pathIndex++;
        if (pathIndex >= paths[currentPathIndex].points.length) break;
      }
    } else if (brush.active) {
      brush.end();
      currentPathIndex++;
      pathIndex = 0;
    }
  };

  p.keyPressed = () => {
    p.background(245);
    drawPerfectO(350, 350, 250);
    generateSymbols(numGestures);
    currentPathIndex = 0;
    pathIndex = 0;
    p.loop();
  };

  // ---- Circle ----

  function drawPerfectO(cx, cy, radius) {
    p.noFill();
    p.stroke(30, 30, 30);
    p.strokeWeight(38);
    p.strokeCap(p.ROUND);
    p.circle(cx, cy, radius * 2);
  }

  // ---- Brush ----

  class Brush {
    constructor(s) {
      this.s = s;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.velocity = 0;
      this.r = 0;
      this.active = false;
      this.speed = 0;
      this.pressure  = 0;
      this.bristles = s.bristles || generateBristleConfig(3);
    }

    begin(x, y) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.velocity = 0;
      this.active = true;
      this.speed = 0;
      this.pressure = 0.1;
      for (let bristle of this.bristles) {
        bristle.bx = x;
        bristle.by = y;
      }
    }

    end() {
      this.vx = 0;
      this.vy = 0;
      this.active = false;
    }

    getSpeed() {
      return this.speed;
    }

    step(targetX, targetY) {


      let pr = 0.6;

      if (!this.active) return;
      const s = this.s;

      this.vx += (targetX - this.x) * s.spring;
      this.vy += (targetY - this.y) * s.spring;
      this.vx *= s.friction;
      this.vy *= s.friction;

      this.speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.velocity += this.speed - this.velocity;
      this.velocity *= 2.1;

      if (this.speed < 0.5) return;

      let oldR = this.r;
      this.r = s.brushSize - this.velocity;

      for (let i = 0; i < s.splitNum; i++) {
        let prevX = this.x;
        let prevY = this.y;

        this.x += this.vx / s.splitNum;
        this.y += this.vy / s.splitNum;

        oldR += (this.r - oldR) / s.splitNum;
        oldR = p.max(oldR, 0.1);

        let angle = p.atan2(this.y - prevY, this.x - prevX);
        let nx = p.cos(angle + p.HALF_PI);
        let ny = p.sin(angle + p.HALF_PI);
        let dx = p.cos(angle);
        let dy = p.sin(angle);

        p.noStroke();
        p.fill(30, 30, 30, 1.0);

        // 1. PULL TOGETHER: Reduce spacing as speed increases
        let speedFactor = p.constrain(this.speed / 100, 0, 1); // Normalize speed 0-1
        let spacingCollapse = p.map(speedFactor, 0, 1, 1.0, 0.9); // High speed = 30% spacing
        
        let spacingScale = (s.brushSize / 60) * 5.0 * spacingCollapse * pr;
        

        for (let bristle of this.bristles) {
          // Per-bristle lag: each bristle follows the brush center with its own spring
          bristle.bx += (this.x - bristle.bx) * bristle.lagFactor;
          bristle.by += (this.y - bristle.by) * bristle.lagFactor;

          // Outer bristles fade at high speed
          let outerFade = 1.0;
          if (bristle.distFromCenter > 0.3) {
            outerFade = p.map(speedFactor, 0, 1, 1.0, 0.0);
            outerFade = p.pow(outerFade, 2);
          }

          // Position: perpendicular (cross) + along stroke from lagged center
          let bristleX = bristle.bx + nx * s.diff * bristle.crossOffset * spacingScale;
          let bristleY = bristle.by + ny * s.diff * bristle.crossOffset * spacingScale;

          // Offset along the stroke direction
          bristleX += dx * bristle.alongOffset * pr;
          bristleY += dy * bristle.alongOffset * pr;

          let bristleSize = oldR * bristle.sizeMultiplier * outerFade * pr;

          drawBristle(bristleX, bristleY, angle, bristleSize, this.speed);
        }
      }
    }
  }

  function drawBristle(x, y, angle, size, speed) {
    let speedNormalized = p.constrain(speed / 30, 0, 1);
    // Skip ~3% of dots at max speed, letting underlying strokes show through
    if (p.random() < speedNormalized * 0.23) return;
    let col = 30;
    p.push();
    p.translate(x, y);
    p.rotate(angle);
    let w = size;
    let eased = p.pow(speedNormalized, 0.3);
    let h = p.map(eased, 0, 1, size, size * 0.65);
    p.fill(col, col, col);
    p.ellipse(0, 0, w, h);
    p.pop();
  }

  // ---- Bristle config ----

  function generateBristleConfig(numBristles) {
    let bristles = [];
    // Elliptical brush head: wider along stroke direction than across it
    let rows = Math.ceil(Math.sqrt(numBristles * 1.8)); // along stroke (more)
    let cols = Math.ceil(numBristles / rows);            // across stroke (fewer)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // crossOffset (perpendicular): narrow range ±0.6
        let crossOffset = cols === 1 ? 0 : p.map(col, 0, cols - 1, -0.6, 0.6);
        // alongOffset (direction of movement): full range ±1.0
        let alongOffset = rows === 1 ? 0 : p.map(row, 0, rows - 1, -1, 1);

        // Ellipse test: wider along stroke (1.0) than across (0.6)
        let ellipseTest = crossOffset * crossOffset / 0.36 + alongOffset * alongOffset;
        if (ellipseTest > 1) continue;

        let distFromCenter = p.sqrt(crossOffset * crossOffset + alongOffset * alongOffset);

        // Edge bristles are smaller
        let sizeMultiplier = p.map(distFromCenter, 0, 1, 1.0, p.random(0.5, 0.8));

        // Organic scatter
        let jitterCross = p.random(-0.06, 0.06);
        let jitterAlong = p.random(-0.06, 0.06);

        // Per-bristle lag: edge bristles lag more
        let lagFactor = p.map(distFromCenter, 0, 1, 0.95, p.random(0.75, 0.88));

        bristles.push({
          crossOffset: crossOffset + jitterCross,
          alongOffset: (alongOffset + jitterAlong) * 20,
          sizeMultiplier,
          distFromCenter,
          lagFactor,
          bx: 0,
          by: 0,
        });
      }
    }
    return bristles;
  }

  // Noise-based bristle config: bristles placed via Perlin noise within a mathematical oval.
  // Bristle sizes vary smoothly with noise, so pressure scaling produces natural width variation.
  function generateNoiseBristleConfig(numBristles, seed) {
    let bristles = [];
    let noiseSeed = seed || p.random(10000);
    p.noiseSeed(noiseSeed);

    // Oval semi-axes: a = along stroke (longer), b = across stroke (shorter)
    let a = 1.0;  // along movement
    let b = 0.5;  // across movement

    // Oversample candidates, accept those inside the oval
    let attempts = 0;
    let maxAttempts = numBristles * 20;

    while (bristles.length < numBristles && attempts < maxAttempts) {
      attempts++;

      // Candidate position in normalized space
      let cx = p.random(-a, a);  // along
      let cy = p.random(-b, b);  // across

      // Oval test: (cx/a)^2 + (cy/b)^2 <= 1
      let ovalTest = (cx * cx) / (a * a) + (cy * cy) / (b * b);
      if (ovalTest > 1) continue;

      // Noise-based size: sample 2D Perlin noise at this position
      let noiseVal = p.noise(cx * 3 + 5, cy * 3 + 5);
      // Map noise to bristle size — center-biased: noise + proximity to center
      let distFromCenter = p.sqrt(ovalTest); // 0 at center, 1 at edge
      let sizeMultiplier = noiseVal * p.map(distFromCenter, 0, 1, 1.0, 0.4);

      // Skip very small bristles (natural gaps in the brush)
      if (sizeMultiplier < 0.15) continue;

      // Per-bristle lag from noise (smooth variation, not random)
      let lagNoise = p.noise(cx * 2 + 50, cy * 2 + 50);
      let lagFactor = p.map(lagNoise * (1 - distFromCenter), 0, 1, 0.75, 0.97);

      bristles.push({
        crossOffset: cy + p.random(-0.03, 0.03),
        alongOffset: cx * 20 + p.random(-0.5, 0.5),
        sizeMultiplier,
        distFromCenter,
        lagFactor,
        bx: 0,
        by: 0,
      });
    }
    return bristles;
  }

  // ---- Symbol generation ----

  function generateSymbols(count) {
    paths = [];
    currentPathIndex = 0;

    for (let n = 0; n < count; n++) {
      let cx = p.width / 2;
      let cy = p.height / 2;
      let R = 370;

      let pts = [];
      let pressureAnchors = [];
      let angle = p.random(p.TWO_PI);
      let pointCount = p.int(p.random(2, 12));

      for (let i = 0; i < pointCount; i++) {
        angle += p.random(0.1, 9);
        let r = R * p.random(0.1, 0.9);
        pts.push(p.createVector(
          cx + p.cos(angle) * r,
          cy + p.sin(angle) * r
        ));
        pressureAnchors.push(p.random(0.1, 1.0));
      }

      let smoothed = smoothPath(pts, rez);
      let pressures = interpolatePressure(pressureAnchors, 12);

      paths.push({ points: smoothed, pressures: pressures });
    }
  }

  function interpolatePressure(anchors, resolution) {
    let result = [];
    for (let i = 0; i < anchors.length - 1; i++) {
      for (let j = 0; j < resolution; j++) {
        let t = j / resolution;
        result.push(p.lerp(anchors[i], anchors[i + 1], t));
      }
    }
    return result;
  }

  // ---- Path smoothing ----

  function smoothPath(pts, resolution) {
    let result = [];
    for (let i = 0; i < pts.length - 1; i++) {
      let p0 = pts[p.max(i - 1, 0)];
      let p1 = pts[i];
      let p2 = pts[i + 1];
      let p3 = pts[p.min(i + 2, pts.length - 1)];

      for (let j = 0; j < resolution; j++) {
        let t = j / resolution;
        let x = p.splinePoint(p0.x, p1.x, p2.x, p3.x, t);
        let y = p.splinePoint(p0.y, p1.y, p2.y, p3.y, t);
        result.push(p.createVector(x, y));
      }
    }
    return result;
  }
}
