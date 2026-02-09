export default function ob1Sketch(p) {
  // ---- State ----
  let brush;
  let settings = {
    brushSize: 70,
    spring: 0.4,
    friction: 0.45,
    splitNum: 18,
    diff: 8,
    numBristles:5,
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
    settings.bristles = generateBristleConfig(settings.numBristles);
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
      this.pressure= 0.1;
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


      let pr = 0.1;

      if (!this.active) return;
      const s = this.s;

      this.vx += (targetX - this.x) * s.spring;
      this.vy += (targetY - this.y) * s.spring;
      this.vx *= s.friction;
      this.vy *= s.friction;

      this.speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.velocity += this.speed - this.velocity;
      this.velocity *= 1.8;

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
      // 2. OUTER BRISTLES FADE: Drop outer bristles aggressively at high speed
      let bristleDistanceFromCenter = p.abs(bristle.offset);
      let outerFade = 1.0;
      
      if (bristleDistanceFromCenter > 0.3) {
        // Outer bristles fade out with speed
        outerFade = p.map(speedFactor, 0, 1, 1.0, 0.0); // High speed = invisible
        outerFade = p.pow(outerFade, 2); // Aggressive exponential fade
      }
      
      // Skip drawing if faded completely
      //if (outerFade < 0.1) continue;
      
      // Position perpendicular to stroke with collapsed spacing
      let bristleX = this.x + nx * s.diff * bristle.offset * spacingScale;
      let bristleY = this.y + ny * s.diff * bristle.offset * spacingScale;
      
      // Offset along the stroke direction
      bristleX += dx * bristle.alongPathOffset* pr;
      bristleY += dy * bristle.alongPathOffset* pr;
      
      let bristleSize = oldR * bristle.sizeMultiplier * outerFade* pr;

      
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
    let eased = p.pow(speedNormalized, 0.3);
    let h = p.map(eased, 0, 1, size, size * 0.65);
    p.fill(col, col, col);
    p.ellipse(0, 0, w, h);
    p.pop();
  }

  // ---- Bristle config ----

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
        sizeMultiplier = p.random(0.7, 1.0);
      }

      let alongPathOffset;
      if (p.abs(offset) < 0.15) {
        alongPathOffset = p.random(20, 50);
      } else {
        alongPathOffset = p.random(-12, 12);
      }

      bristles.push({ offset, sizeMultiplier, alongPathOffset });
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
