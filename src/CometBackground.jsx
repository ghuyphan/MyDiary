import React, { useEffect, useRef } from "react";

/**
 * CometBackground
 *
 * Props:
 *   active      – if false, nothing is rendered at all
 *   burstMode   – if true, spawns comets rapidly for a short burst (used after save)
 *   speed       – animation speed multiplier
 *   cometFrequency – ms between comet spawns (ignored in burstMode)
 */
export default function CometBackground({ active = true, burstMode = false, speed = 1, cometFrequency = 6000 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Star Class – subtle twinkling background stars
    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.2;
        this.alpha = Math.random();
        this.twinkleSpeed = 0.004 + Math.random() * 0.01;
      }

      update() {
        this.alpha += this.twinkleSpeed * speed;
        if (this.alpha > 1 || this.alpha < 0) {
          this.twinkleSpeed = -this.twinkleSpeed;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, this.alpha)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Comet Particle Class (for trailing tail)
    class TrailParticle {
      constructor(x, y, color, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.alpha = 1.0;
        this.decay = 0.025 + Math.random() * 0.03;
      }

      update() {
        this.alpha -= this.decay * speed;
      }

      draw() {
        ctx.fillStyle = `${this.color}${Math.floor(this.alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sparkle burst particle for save celebration
    class Sparkle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.6;
        this.size = 1.5 + Math.random() * 2;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.018;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -0.3 - Math.random() * 0.6;
        const colors = ["#ffffff", "#ffe8f0", "#c8e8ff", "#ffd4e8", "#b8f0ff"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        const a = Math.max(0, this.alpha);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = this.color;
        // Draw a small 4-pointed star
        ctx.beginPath();
        const s = this.size;
        ctx.moveTo(this.x, this.y - s);
        ctx.lineTo(this.x + s * 0.25, this.y - s * 0.25);
        ctx.lineTo(this.x + s, this.y);
        ctx.lineTo(this.x + s * 0.25, this.y + s * 0.25);
        ctx.lineTo(this.x, this.y + s);
        ctx.lineTo(this.x - s * 0.25, this.y + s * 0.25);
        ctx.lineTo(this.x - s, this.y);
        ctx.lineTo(this.x - s * 0.25, this.y - s * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      get dead() {
        return this.alpha <= 0;
      }
    }

    // Comet Class (Shooting Star)
    class Comet {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = width * 0.4 + Math.random() * width * 0.7;
        this.y = -50 - Math.random() * 100;
        this.angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.15;
        this.speedX = Math.cos(this.angle) * (6 + Math.random() * 4) * speed;
        this.speedY = Math.sin(this.angle) * (6 + Math.random() * 4) * speed;
        this.size = 2 + Math.random() * 1.5;
        this.color = Math.random() > 0.5 ? "#4da6ff" : "#ff6699";
        this.active = true;
        this.trail = [];
        // Tiamat split properties
        this.isTiamat = Math.random() < 0.4; // 40% chance to be a splitting Tiamat comet
        this.hasSplit = false;
      }

      update() {
        if (!this.active) return null;

        this.trail.push(new TrailParticle(this.x, this.y, this.color, this.size * 0.8));
        if (this.trail.length > 25) {
          this.trail.shift();
        }

        this.x += this.speedX;
        this.y += this.speedY;

        let fragment = null;
        if (this.isTiamat && !this.hasSplit && this.y > height * 0.35) {
          this.hasSplit = true;
          // Spawn a child fragment
          fragment = new Comet();
          fragment.isTiamat = false;
          fragment.hasSplit = true;
          fragment.x = this.x;
          fragment.y = this.y;
          fragment.size = this.size * 0.85;
          // Fragment gets the opposite color
          fragment.color = this.color === "#4da6ff" ? "#ff6699" : "#4da6ff";
          
          // Split angle drift
          const driftAngle = 0.08 + Math.random() * 0.08;
          
          // Parent and child drift in opposite directions
          const parentAngle = this.angle + driftAngle * 0.5;
          const childAngle = this.angle - driftAngle * 1.2;
          const speedVal = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
          
          this.angle = parentAngle;
          this.speedX = Math.cos(parentAngle) * speedVal;
          this.speedY = Math.sin(parentAngle) * speedVal;
          
          fragment.angle = childAngle;
          fragment.speedX = Math.cos(childAngle) * speedVal * 0.95;
          fragment.speedY = Math.sin(childAngle) * speedVal * 0.95;
        }

        if (Math.random() < 0.008 && this.trail.length > 8) {
          const splitColor = this.color === "#4da6ff" ? "#ff6699" : "#4da6ff";
          this.trail.push(new TrailParticle(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, splitColor, this.size * 0.5));
        }

        if (this.y > height + 100 || this.x < -100) {
          this.active = false;
        }

        this.trail.forEach((p) => p.update());
        this.trail = this.trail.filter((p) => p.alpha > 0);

        return fragment;
      }

      draw() {
        this.trail.forEach((p) => p.draw());

        if (this.active) {
          const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
          grad.addColorStop(0, "#ffffff");
          grad.addColorStop(0.3, this.color);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Initialize Stars – fewer in burst mode since it's an overlay
    const starCount = burstMode ? 0 : Math.min(40, Math.floor((width * height) / 10000));
    const stars = Array.from({ length: starCount }, () => new Star());

    let comets = [];
    let sparkles = [];

    let cometInterval = null;

    if (burstMode) {
      // Burst mode: spawn 3–4 comets immediately, then stop
      const burstCount = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < burstCount; i++) {
        setTimeout(() => comets.push(new Comet()), i * 280);
      }
      // Spawn sparkles in waves
      for (let wave = 0; wave < 4; wave++) {
        setTimeout(() => {
          for (let i = 0; i < 12; i++) sparkles.push(new Sparkle());
        }, wave * 200);
      }
    } else {
      // Normal mode: periodic comet spawning
      const spawnComet = () => {
        if (comets.length < 2) comets.push(new Comet());
      };
      spawnComet();
      cometInterval = setInterval(spawnComet, cometFrequency);
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      if (!burstMode) {
        const newCount = Math.min(40, Math.floor((width * height) / 10000));
        stars.length = 0;
        for (let i = 0; i < newCount; i++) stars.push(new Star());
      }
    };
    window.addEventListener("resize", handleResize);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((s) => { s.update(); s.draw(); });
      
      const fragments = [];
      comets.forEach((c) => {
        const frag = c.update();
        if (frag) fragments.push(frag);
        c.draw();
      });
      if (fragments.length > 0) {
        comets.push(...fragments);
      }
      
      comets = comets.filter((c) => c.active || c.trail.length > 0);

      if (burstMode) {
        sparkles.forEach((sp) => { sp.update(); sp.draw(); });
        sparkles = sparkles.filter((sp) => !sp.dead);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (cometInterval) clearInterval(cometInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, burstMode, speed, cometFrequency]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="comet-background-canvas"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
