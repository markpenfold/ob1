export default function ob1Sketch(p) {
  // ---- State ----
  let brush;
  let settings = {
    brushSize: 70,
    spring: 0.4,
    friction: 0.45,
    splitNum: 18,
    diff: 6,
    numBristles: 64,
    skipRate: 0.25,
  };

  let paths = [];
  let currentPathIndex = 0;
  let pathIndex = 0;
  let numGestures = 1;

  // ---- p5 lifecycle ----

  p.setup = () => {
    p.createCanvas(700, 700);
    p.background(245);
    settings.bristles = generateBristleConfigRANDOM(settings.numBristles);
    brush = new Brush(settings);
    drawPerfectO(350, 350, 250);
    numGestures = p.random(2, 4);
    generateSymbols(numGestures);
  };

  p.draw = () => {
    if (currentPathIndex >= paths.length) {
      p.noLoop();
      return;
    }

    if (!brush.active && currentPathIndex < paths.length) {
      let pt = paths[currentPathIndex][0];
      brush.begin(pt.x, pt.y);
      pathIndex = 0;
    }

    if (brush.active && pathIndex < paths[currentPathIndex].length) {
      for (let i = 0; i < 3; i++) {
        let pt = paths[currentPathIndex][pathIndex];
        brush.step(pt.x, pt.y);
        pathIndex++;
        if (pathIndex >= paths[currentPathIndex].length) break;
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
    let count = p.random(1, 4);
    generateSymbols(count);
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

  // ---- Bristle configs ----

  function generateBristleConfigRANDOM(numBristles) {
    let bristles = [];
    for (let b = 0; b < numBristles; b++) {
      bristles.push({
        offset: p.random(-1, 1),
        alongPathOffset: p.random(-15, 15),
        sizeMultiplier: p.random(0.3, 1.0)
      });
    }
    return bristles;
  }

  function generateBristleConfigCLUMP(numBristles) {
    let bristles = [];
    let numClumps = p.int(p.random(2, 5));
    let clumps = [];
    for (let c = 0; c < numClumps; c++) {
      clumps.push({
        x: p.random(-0.8, 0.8),
        y: p.random(-12, 12),
        spread: p.random(0.05, 0.3)
      });
    }
    for (let b = 0; b < numBristles; b++) {
      let clump = p.random(clumps);
      bristles.push({
        offset: clump.x + p.randomGaussian() * clump.spread,
        alongPathOffset: clump.y + p.randomGaussian() * clump.spread * 15,
        sizeMultiplier: p.random(0.2, 1.0)
      });
    }
    return bristles;
  }

  function generateBristleConfig(numBristles) {
    let bristles = [];
    for (let b = 0; b < numBristles; b++) {
      let offset;
      if (numBristles === 1) {
        offset = 0;
      } else {
        offset = p.map(b, 0, numBristles - 1, -1, 1);
      }
      let sizeMultiplier = 1.0;
      if (p.abs(offset) > 0.5) {
        sizeMultiplier = p.random(0.3, 1.0);
      }
      let alongPathOffset;
      if (p.abs(offset) < 0.25) {
        alongPathOffset = p.random(-13, 50);
      } else {
        alongPathOffset = p.random(-1, 12);
      }
      bristles.push({ offset, sizeMultiplier, alongPathOffset });
    }
    return bristles;
  }

  function generateBristleConfig2(numBristles) {
    let bristles = [];
    let headCount = Math.floor(numBristles * 0.6);
    let tailCount = numBristles - headCount;
    for (let i = 0; i < headCount; i++) {
      let angle = p.random(p.TWO_PI);
      let radius = p.sqrt(p.random()) * 0.3;
      let offsetX = p.cos(angle) * radius;
      let offsetY = p.sin(angle) * radius;
      bristles.push({
        offset: offsetX,
        offsetY: offsetY,
        sizeMultiplier: p.random(0.6, 0.9),
        alongPathOffset: p.random(-3, 8)
      });
    }
    for (let i = 0; i < tailCount; i++) {
      let t = i / (tailCount - 1 || 1);
      let offsetX = p.lerp(0.2, 0.7, t);
      let offsetY = -t * 0.8 * p.pow(t, 0.5);
      offsetX += p.random(-0.05, 0.05);
      offsetY += p.random(-0.05, 0.05);
      let sizeMultiplier = p.lerp(0.7, 0.3, p.pow(t, 0.7));
      bristles.push({
        offset: offsetX,
        offsetY: offsetY,
        sizeMultiplier: sizeMultiplier,
        alongPathOffset: p.random(-5, 3)
      });
    }
    return bristles;
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
      if (!this.active) return;
      const s = this.s;

      let RAMP_STEPS = 50;
      let t = pathIndex / RAMP_STEPS;
      let pr = p.constrain(t, 0, 1);

      let RAMP_OUT_STEPS = 40;
      let remaining = paths[currentPathIndex].length - pathIndex;
      let prOut = p.constrain(remaining / RAMP_OUT_STEPS, 0, 1);
      pr = p.min(pr, prOut);

      this.vx += (targetX - this.x) * s.spring;
      this.vy += (targetY - this.y) * s.spring;
      this.vx *= s.friction;
      this.vy *= s.friction;

      this.speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.velocity += this.speed - this.velocity;
      this.velocity *= 2.0;

      if (this.speed < 1.5) return;

      let oldR = this.r;
      this.r = (s.brushSize - this.velocity) * pr;

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
        p.fill(0);

        for (let bristle of this.bristles) {
          let speedFactor = p.constrain(this.speed / 100, 0, 1);
          let skipChance = s.skipRate + speedFactor * 0.35;
          if (p.random() < skipChance) continue;

          let spacingMultiplier = s.brushSize / 20;

          let bristleX = this.x + nx * s.diff * bristle.offset * spacingMultiplier;
          let bristleY = this.y + ny * s.diff * bristle.offset * spacingMultiplier;

          bristleX += dx * bristle.alongPathOffset;
          bristleY += dy * bristle.alongPathOffset;

          let bristleSize = oldR * bristle.sizeMultiplier;

          drawBristle(bristleX, bristleY, angle, bristleSize, this.speed);
        }
      }
    }
  }

  function drawBristle(x, y, angle, size, speed) {
    let col = 30;
    p.push();
    p.translate(x, y);
    p.rotate(angle);
    let w = size;

    let speedNormalized = p.constrain(speed / 30, 0, 1);
    let opacityDrop = p.pow(speedNormalized, 0.1);
    let alpha = p.map(opacityDrop, 0, 1, 255, 180);

    let eased = p.pow(speedNormalized, 0.3);
    let h = p.map(eased, 0, 1, size, size * 0.65);

    p.fill(col, col, col, alpha);
    p.ellipse(0, 0, w, h);
    p.pop();
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
      let angle = p.random(p.TWO_PI);
      let pointCount = p.int(p.random(2, 7));

      for (let i = 0; i < pointCount; i++) {
        angle += p.random(0.1, 9);
        let r = R * p.random(0.1, 0.9);
        pts.push(p.createVector(
          cx + p.cos(angle) * r,
          cy + p.sin(angle) * r
        ));
      }

      paths.push(smoothPath(pts, 12));
    }
  }

  // ---- Path smoothing ----

  function smoothPathCat(pts, resolution) {
    let result = [];
    for (let i = 0; i < pts.length - 1; i++) {
      let p0 = pts[p.max(i - 1, 0)];
      let p1 = pts[i];
      let p2 = pts[i + 1];
      let p3 = pts[p.min(i + 2, pts.length - 1)];
      for (let j = 0; j < resolution; j++) {
        let t = j / resolution;
        let x = p.curvePoint(p0.x, p1.x, p2.x, p3.x, t);
        let y = p.curvePoint(p0.y, p1.y, p2.y, p3.y, t);
        result.push(p.createVector(x, y));
      }
    }
    return result;
  }

  function smoothPathBez(pts, resolution) {
    let result = [];
    for (let i = 0; i < pts.length - 1; i++) {
      let p1 = pts[i];
      let p2 = pts[i + 1];
      let mx = (p1.x + p2.x) / 2;
      let my = (p1.y + p2.y) / 2;
      let d = p.dist(p1.x, p1.y, p2.x, p2.y);
      let cx1 = mx + p.random(-d * 0.6, d * 0.6);
      let cy1 = my + p.random(-d * 0.6, d * 0.6);
      let cx2 = mx + p.random(-d * 0.6, d * 0.6);
      let cy2 = my + p.random(-d * 0.6, d * 0.6);
      for (let j = 0; j < resolution; j++) {
        let t = j / resolution;
        let x = p.bezierPoint(p1.x, cx1, cx2, p2.x, t);
        let y = p.bezierPoint(p1.y, cy1, cy2, p2.y, t);
        result.push(p.createVector(x, y));
      }
    }
    return result;
  }

  function smoothPathNoise(pts, resolution) {
    let result = [];
    for (let i = 0; i < pts.length - 1; i++) {
      let p1 = pts[i];
      let p2 = pts[i + 1];
      let noiseOffset = p.random(1000);
      for (let j = 0; j < resolution; j++) {
        let t = j / resolution;
        let x = p.lerp(p1.x, p2.x, t);
        let y = p.lerp(p1.y, p2.y, t);
        let d = p.dist(p1.x, p1.y, p2.x, p2.y);
        let wobble = (p.noise(noiseOffset + t * 3) - 0.5) * d * 0.5;
        let angle = p.atan2(p2.y - p1.y, p2.x - p1.x) + p.HALF_PI;
        x += p.cos(angle) * wobble;
        y += p.sin(angle) * wobble;
        result.push(p.createVector(x, y));
      }
    }
    return result;
  }

  function smoothPath(pts, resolution) {
    let method = p.random(['bezier', 'noise', 'catmull']);
    if (method == 'bezier') {
      return smoothPathBez(pts, resolution);
    } else if (method == 'noise') {
      return smoothPathNoise(pts, resolution);
    } else {
      return smoothPathCat(pts, resolution);
    }
  }
}
