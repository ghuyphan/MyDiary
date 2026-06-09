import React, { useEffect, useRef } from "react";

export default function CometBackground({ active = true, speed = 1, cometFrequency = 6000 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Star Class
    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5;
        this.alpha = Math.random();
        this.twinkleSpeed = 0.005 + Math.random() * 0.015;
      }

      update() {
        this.alpha += this.twinkleSpeed * speed;
        if (this.alpha > 1 || this.alpha < 0) {
          this.twinkleSpeed = -this.twinkleSpeed;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, this.alpha)})`;
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
        this.decay = 0.02 + Math.random() * 0.03;
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

    // Comet Class (Shooting Star)
    class Comet {
      constructor() {
        this.reset();
      }

      reset() {
        // Start from top-right region
        this.x = width * 0.4 + Math.random() * width * 0.7;
        this.y = -50 - Math.random() * 100;
        this.length = 80 + Math.random() * 120;
        this.angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.15; // diagonal down-left
        this.speedX = Math.cos(this.angle) * (6 + Math.random() * 4) * speed;
        this.speedY = Math.sin(this.angle) * (6 + Math.random() * 4) * speed;
        this.size = 2.5 + Math.random() * 1.5;
        // Two halves of the splitting Tiamat comet tail: blue/cyan and pink/red
        this.color = Math.random() > 0.5 ? "#4da6ff" : "#ff6699";
        this.active = true;
        this.trail = [];
      }

      update() {
        if (!this.active) return;

        // Add to trail
        this.trail.push(new TrailParticle(this.x, this.y, this.color, this.size * 0.8));
        if (this.trail.length > 30) {
          this.trail.shift();
        }

        // Move comet head
        this.x += this.speedX;
        this.y += this.speedY;

        // Split simulation: occasionally branch off a tiny child comet
        if (Math.random() < 0.01 && this.trail.length > 10) {
          // Add extra colorful side particles
          const splitColor = this.color === "#4da6ff" ? "#ff6699" : "#4da6ff";
          this.trail.push(new TrailParticle(this.x + (Math.random() - 0.5) * 12, this.y + (Math.random() - 0.5) * 12, splitColor, this.size * 0.6));
        }

        // Deactivate when out of bounds
        if (this.y > height + 100 || this.x < -100) {
          this.active = false;
        }

        // Update trail particles
        this.trail.forEach((p) => p.update());
        this.trail = this.trail.filter((p) => p.alpha > 0);
      }

      draw() {
        // Draw trailing particles
        this.trail.forEach((p) => p.draw());

        if (this.active) {
          // Draw comet glowing head
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

    // Initialize Stars
    const starCount = Math.min(60, Math.floor((width * height) / 8000));
    const stars = Array.from({ length: starCount }, () => new Star());

    // Initialize Comet list and scheduler
    let comets = [];
    const spawnComet = () => {
      if (comets.length < 3) {
        comets.push(new Comet());
      }
    };

    // Spawn first comet and setup timer
    spawnComet();
    const cometInterval = setInterval(spawnComet, cometFrequency);

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      // Re-populate stars based on new size
      const newStarCount = Math.min(60, Math.floor((width * height) / 8000));
      stars.length = 0;
      for (let i = 0; i < newStarCount; i++) {
        stars.push(new Star());
      }
    };
    window.addEventListener("resize", handleResize);

    // Main Draw Loop
    const loop = () => {
      // Clear with transparent layer to allow background gradients to show through
      ctx.clearRect(0, 0, width, height);

      // Draw and update stars
      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      // Draw and update comets
      comets.forEach((comet) => {
        comet.update();
        comet.draw();
      });

      // Filter out completed comets
      comets = comets.filter((c) => c.active || c.trail.length > 0);

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(cometInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, speed, cometFrequency]);

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
