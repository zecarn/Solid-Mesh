/**
 * Hero 3D Canvas Renderer & Orbit Controller
 * Renders an interactive 3D node wireframe mesh on HTML5 Canvas.
 */

export function init3DHeroCanvas() {
  const canvas = document.getElementById('heroMeshCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;

  // Hexagonal Prisma 3D Node Mesh (Solid Mesh Studio Core)
  let rotationX = 0.4;
  let rotationY = 0.5;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let meshColor = '#00D9E8';
  let zoom = 1.0;

  // Base vertices for a complex mechanical prism
  const baseVertices = [
    // Top Hexagon
    { x: 0, y: -65, z: 0 },
    { x: 55, y: -35, z: 35 },
    { x: 55, y: -35, z: -35 },
    { x: -55, y: -35, z: 35 },
    { x: -55, y: -35, z: -35 },
    { x: 0, y: -35, z: 65 },
    { x: 0, y: -35, z: -65 },
    // Mid Core nodes
    { x: 75, y: 10, z: 0 },
    { x: -75, y: 10, z: 0 },
    { x: 0, y: 10, z: 75 },
    { x: 0, y: 10, z: -75 },
    { x: 45, y: 10, z: 45 },
    { x: -45, y: 10, z: -45 },
    // Bottom Base
    { x: 0, y: 70, z: 0 },
    { x: 50, y: 55, z: 40 },
    { x: 50, y: 55, z: -40 },
    { x: -50, y: 55, z: 40 },
    { x: -50, y: 55, z: -40 },
  ];

  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
    [1, 7], [2, 7], [3, 8], [4, 8], [5, 9], [6, 10],
    [7, 11], [8, 12], [9, 11], [10, 12],
    [11, 14], [12, 17], [9, 16], [10, 15],
    [13, 14], [13, 15], [13, 16], [13, 17],
    [14, 15], [15, 17], [17, 16], [16, 14],
    [7, 13], [8, 13], [1, 5], [3, 5], [2, 6], [4, 6]
  ];

  function rotate(v, rx, ry) {
    // Rotate Y
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const x1 = v.x * cosY - v.z * sinY;
    const z1 = v.z * cosY + v.x * sinY;

    // Rotate X
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const y2 = v.y * cosX - z1 * sinX;
    const z2 = z1 * cosX + v.y * sinX;

    return { x: x1, y: y2, z: z2 };
  }

  function project(v) {
    const perspective = 340;
    const scale = (perspective / (perspective + v.z + 150)) * zoom;
    return {
      x: v.x * scale + width / 2,
      y: v.y * scale + height / 2,
      scale: scale
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Technical Grid background inside canvas
    ctx.strokeStyle = 'rgba(0, 217, 232, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Concentric target circles in canvas center
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 110, 0, Math.PI * 2);
    ctx.stroke();

    const projected = baseVertices.map(v => project(rotate(v, rotationX, rotationY)));

    // Render Edges
    ctx.strokeStyle = meshColor;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = meshColor;
    ctx.shadowBlur = 8;

    edges.forEach(([startIdx, endIdx]) => {
      const p1 = projected[startIdx];
      const p2 = projected[endIdx];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Render Nodes / Vertices
    ctx.shadowBlur = 12;
    projected.forEach((p) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // Continuous subtle auto-rotation if user is not dragging
    if (!isDragging) {
      rotationY += 0.007;
      rotationX = 0.35 + Math.sin(Date.now() * 0.001) * 0.1;
    }

    requestAnimationFrame(draw);
  }

  // Mouse drag controls
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    rotationY += deltaX * 0.01;
    rotationX += deltaY * 0.01;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  // Touch controls for mobile
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMouseX;
    const deltaY = e.touches[0].clientY - lastMouseY;
    rotationY += deltaX * 0.01;
    rotationX += deltaY * 0.01;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  }, { passive: true });

  // Mouse wheel zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom += e.deltaY * -0.001;
    zoom = Math.min(Math.max(0.6, zoom), 1.7);
  }, { passive: false });

  // Resize listener
  window.addEventListener('resize', () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
  });

  // Material color changer buttons
  const colorBtns = document.querySelectorAll('#hero-material-switches button');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      meshColor = btn.getAttribute('data-color') || '#00D9E8';
    });
  });

  // Start render loop
  draw();
}
