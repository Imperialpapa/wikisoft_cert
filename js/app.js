// ── Device detection ──
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

// ═══════════════════════════════════════
//  DYNAMIC RENDERING (data.js → DOM)
// ═══════════════════════════════════════

(function renderAll() {
  // ── Features ──
  var fg = document.getElementById('featuresGrid');
  if (fg && typeof FEATURES !== 'undefined') {
    fg.innerHTML = FEATURES.map(function(f) {
      return '<div class="feature-card glass reveal">' +
        '<div class="card-glow"></div>' +
        '<div class="feature-icon-wrap">' + f.icon + '</div>' +
        '<div class="feature-num">' + f.num + '</div>' +
        '<h3>' + f.title + '</h3>' +
        '<p>' + f.desc + '</p>' +
      '</div>';
    }).join('');
  }

  // ── Team ──
  var tg = document.getElementById('teamGrid');
  if (tg && typeof TEAM_MEMBERS !== 'undefined') {
    tg.innerHTML = TEAM_MEMBERS.map(function(m, i) {
      var tagsHtml = m.tags.map(function(t) {
        return '<span class="team-tag">' + t + '</span>';
      }).join('');

      return '<div class="team-card glass reveal"' +
        ' data-member="' + m.name + '"' +
        ' data-dept="' + m.dept + '"' +
        ' data-role="' + m.role + '"' +
        ' data-member-en="' + m.nameEn + '"' +
        ' data-dept-en="' + m.deptEn + '"' +
        ' data-role-en="' + m.roleEn + '"' +
        ' data-idx="' + i + '">' +
        '<div class="team-card-visual">' +
          '<canvas class="team-3d" aria-hidden="true" data-color="' + m.color + '"></canvas>' +
          '<div class="team-avatar" id="avatar-' + i + '">' + m.avatar + '</div>' +
          '<input type="file" class="photo-input" accept="image/*" data-photo-idx="' + i + '">' +
          '<div class="photo-upload-overlay">' +
            '<div class="upload-icon">&#9650;</div>' +
            '<div class="upload-text">사진 업로드</div>' +
          '</div>' +
        '</div>' +
        '<div class="team-body">' +
          '<div class="team-role">' + m.roleLabel + '</div>' +
          '<div class="team-name">' + m.name + '</div>' +
          '<div class="team-uni">' + m.dept + '</div>' +
          '<div class="team-desc">' + m.desc + '</div>' +
          '<div class="team-tags">' + tagsHtml + '</div>' +
          '<div class="cert-btns">' +
            '<button class="cert-btn" data-cert-lang="kr">' +
              '<span class="btn-icon">&#8681;</span> 경력증명서 (KOR)' +
            '</button>' +
            '<button class="cert-btn cert-btn-en" data-cert-lang="en">' +
              '<span class="btn-icon">&#8681;</span> Certificate (ENG)' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // ── Timeline ──
  var tl = document.getElementById('timelineList');
  if (tl && typeof TIMELINE !== 'undefined') {
    tl.innerHTML = TIMELINE.map(function(t) {
      return '<div class="tl-item">' +
        '<div class="tl-dot"></div>' +
        '<div class="tl-date">' + t.date + '</div>' +
        '<h3>' + t.title + '</h3>' +
        '<p>' + t.desc + '</p>' +
      '</div>';
    }).join('');
  }
})();

// ═══════════════════════════════════════════════
//  THREE.JS — FULL-SCREEN 3D PARTICLE BACKGROUND
// ═══════════════════════════════════════════════

(function() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !IS_MOBILE, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // ── Particle field ──
  const particleCount = IS_MOBILE ? 800 : 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

    const colorChoice = Math.random();
    if (colorChoice < 0.4) {
      colors[i * 3] = 0; colors[i * 3 + 1] = 0.94; colors[i * 3 + 2] = 1;
    } else if (colorChoice < 0.7) {
      colors[i * 3] = 0.66; colors[i * 3 + 1] = 0.33; colors[i * 3 + 2] = 0.97;
    } else {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.28;
    }
    sizes[i] = Math.random() * 3 + 0.5;
  }

  const particleGeom = new THREE.BufferGeometry();
  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      uniform float uTime;
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        vec3 pos = position;
        pos.y += sin(uTime * 0.3 + position.x * 50.0 + position.z * 30.0) * 0.08;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = smoothstep(15.0, 2.0, -mvPosition.z) * 0.7;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = exp(-d * 6.0);
        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeom, particleMat);
  scene.add(particles);

  // ── Wireframe geometries ──
  const geoGroup = new THREE.Group();
  scene.add(geoGroup);

  const wireMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.08 });
  const wireMat2 = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.06 });
  const wireMat3 = new THREE.MeshBasicMaterial({ color: 0xffb347, wireframe: true, transparent: true, opacity: 0.06 });

  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, IS_MOBILE ? 0 : 1), wireMat1);
  ico.position.set(3.5, 1, -3);
  geoGroup.add(ico);

  const torus = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.3, IS_MOBILE ? 6 : 8, IS_MOBILE ? 16 : 24), wireMat2);
  torus.position.set(-4, -1.5, -4);
  geoGroup.add(torus);

  const octa = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 0), wireMat3);
  octa.position.set(-2, 2.5, -5);
  geoGroup.add(octa);

  const dodeca = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), wireMat1.clone());
  dodeca.material.opacity = 0.05;
  dodeca.position.set(5, -2, -6);
  geoGroup.add(dodeca);

  const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.2, IS_MOBILE ? 32 : 64, IS_MOBILE ? 4 : 8), wireMat2.clone());
  torusKnot.material.opacity = 0.05;
  torusKnot.position.set(0, -3, -4);
  geoGroup.add(torusKnot);

  // ── Connection lines ──
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.04 });
  const lineCount = IS_MOBILE ? 15 : 30;
  for (let i = 0; i < lineCount; i++) {
    const lineGeom = new THREE.BufferGeometry();
    const verts = new Float32Array(6);
    verts[0] = (Math.random() - 0.5) * 16;
    verts[1] = (Math.random() - 0.5) * 16;
    verts[2] = (Math.random() - 0.5) * 10;
    verts[3] = verts[0] + (Math.random() - 0.5) * 6;
    verts[4] = verts[1] + (Math.random() - 0.5) * 6;
    verts[5] = verts[2] + (Math.random() - 0.5) * 4;
    lineGeom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    scene.add(new THREE.Line(lineGeom, lineMat));
  }

  // ── Mouse tracking ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Scroll tracking ──
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  });

  // ── Animation loop ──
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Rotate particles slowly
    particles.rotation.y = t * 0.02 + mouseX * 0.1;
    particles.rotation.x = t * 0.015 + mouseY * 0.05;

    // GPU-driven particle animation via uTime uniform
    particleMat.uniforms.uTime.value = t;

    // Rotate wireframe objects
    ico.rotation.x = t * 0.15;
    ico.rotation.y = t * 0.2;
    torus.rotation.x = t * 0.25;
    torus.rotation.z = t * 0.15;
    octa.rotation.y = t * 0.3;
    octa.rotation.z = t * 0.1;
    dodeca.rotation.x = t * 0.12;
    dodeca.rotation.y = t * 0.18;
    torusKnot.rotation.x = t * 0.1;
    torusKnot.rotation.y = t * 0.15;

    // Camera follows mouse gently
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Scroll-based depth
    camera.position.z = 5 - scrollProgress * 2;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ═══════════════════════════════════════
//  TEAM CARD MINI 3D SCENES
// ═══════════════════════════════════════

if (!IS_MOBILE) document.querySelectorAll('.team-3d').forEach((cvs, idx) => {
  const colorStr = cvs.dataset.color;
  const [r, g, b] = colorStr.split(',').map(Number);
  const color = new THREE.Color(r / 255, g / 255, b / 255);

  const renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 3;

  // Mini particle ring
  const ringCount = 300;
  const ringPos = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2 + Math.random() * 0.3;
    const radius = 1.2 + Math.random() * 0.4;
    ringPos[i * 3] = Math.cos(angle) * radius;
    ringPos[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
    ringPos[i * 3 + 2] = Math.sin(angle) * radius;
  }

  const ringGeom = new THREE.BufferGeometry();
  ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  const ringMat = new THREE.PointsMaterial({ color: color, size: 0.04, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(ringGeom, ringMat));

  // Center wireframe shape
  const shapes = [
    new THREE.IcosahedronGeometry(0.5, 0),
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TetrahedronGeometry(0.5, 0)
  ];
  const shapeMesh = new THREE.Mesh(shapes[idx], new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.25 }));
  scene.add(shapeMesh);

  function resizeCanvas() {
    const rect = cvs.parentElement.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const clock = new THREE.Clock();
  function anim() {
    requestAnimationFrame(anim);
    const t = clock.getElapsedTime();
    shapeMesh.rotation.x = t * 0.4;
    shapeMesh.rotation.y = t * 0.6;

    const rp = ringGeom.attributes.position.array;
    for (let i = 0; i < ringCount; i++) {
      rp[i * 3 + 1] += Math.sin(t * 2 + i * 0.1) * 0.001;
    }
    ringGeom.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  anim();
});

// ═══════════════════════════════════════
//  CURSOR GLOW
// ═══════════════════════════════════════

if (!IS_MOBILE) {
  const glow = document.getElementById('cursorGlow');
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ═══════════════════════════════════════
//  REVEAL ON SCROLL
// ═══════════════════════════════════════

const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
reveals.forEach(el => revealObs.observe(el));

// ═══════════════════════════════════════
//  COUNTER ANIMATION
// ═══════════════════════════════════════

function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 2200;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// ═══════════════════════════════════════
//  MOBILE MENU
// ═══════════════════════════════════════

const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const href = a.getAttribute('href');
    menuBtn.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });
});

// ═══════════════════════════════════════
//  SMOOTH NAV SCROLL
// ═══════════════════════════════════════

document.querySelectorAll('.nav-links a, .footer-list a').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ═══════════════════════════════════════
//  GLITCH EFFECT ON HERO TITLE
// ═══════════════════════════════════════

const heroTitle = document.querySelector('.hero-title');
setInterval(() => {
  if (Math.random() > 0.95) {
    heroTitle.style.transform = `translate(${(Math.random()-0.5)*4}px, ${(Math.random()-0.5)*2}px)`;
    heroTitle.style.textShadow = `${(Math.random()-0.5)*6}px 0 var(--cyan), ${(Math.random()-0.5)*6}px 0 var(--purple)`;
    setTimeout(() => {
      heroTitle.style.transform = '';
      heroTitle.style.textShadow = '';
    }, 80);
  }
}, 100);

// ═══════════════════════════════════════
//  PHOTO UPLOAD
// ═══════════════════════════════════════

function handlePhotoUpload(input, index) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const visual = input.closest('.team-card-visual');

    // Remove existing uploaded photo if any
    const existing = visual.querySelector('.uploaded-photo');
    if (existing) existing.remove();

    // Create image element
    const img = document.createElement('img');
    img.src = e.target.result;
    img.className = 'uploaded-photo';
    visual.appendChild(img);

    // Hide the text avatar
    const avatar = visual.querySelector('.team-avatar');
    if (avatar) avatar.style.opacity = '0';
  };
  reader.readAsDataURL(file);
}

// ═══════════════════════════════════════
//  KOREAN FONT LOADER FOR PDF
// ═══════════════════════════════════════

let koreanFontBase64 = null;

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunks = [];
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, bytes.length))));
  }
  return btoa(chunks.join(''));
}

async function ensureKoreanFont() {
  if (koreanFontBase64) return;

  const urls = [
    'https://cdn.jsdelivr.net/gh/nicei2024/jspdf-korean-font@main/NanumGothic-Regular.ttf',
    'https://cdn.jsdelivr.net/gh/nicei2024/jspdf-korean-font@main/NanumGothicBold.ttf',
    'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf',
    'https://raw.githubusercontent.com/nicei2024/jspdf-korean-font/main/NanumGothic-Regular.ttf',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 50000) continue; // too small, probably error page
      koreanFontBase64 = arrayBufferToBase64(buf);
      return;
    } catch(e) {
      continue;
    }
  }
  throw new Error('Korean font load failed from all sources');
}

// ═══════════════════════════════════════
//  PDF COMMON: DECORATIVE BORDER
// ═══════════════════════════════════════

// ── Mobile-compatible PDF download ──
function savePdfMobile(doc, filename) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    if (isIOS) {
      // iOS Safari: open in new tab (download attr not supported)
      window.open(url, '_blank');
    } else {
      // Android: use hidden link with download attribute
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
    }
  } else {
    doc.save(filename);
  }
}

function drawCertBorder(doc, W, H) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, W - 24, H - 24);
  doc.setLineWidth(0.3);
  doc.rect(15, 15, W - 30, H - 30);

  const corners = [[15, 15], [W - 15, 15], [15, H - 15], [W - 15, H - 15]];
  doc.setLineWidth(0.5);
  corners.forEach(([x, y]) => {
    const dx = x < W / 2 ? 1 : -1;
    const dy = y < H / 2 ? 1 : -1;
    doc.line(x, y, x + dx * 12, y);
    doc.line(x, y, x, y + dy * 12);
  });

  const cx = W / 2;
  doc.setDrawColor(160, 140, 100);
  doc.setLineWidth(0.4);
  doc.line(40, 42, W - 40, 42);
  doc.line(40, 43, W - 40, 43);
}

function drawSealAndFooter(doc, cx, signY, W, H, isKorean) {
  // ── Signature line ──
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.3);
  doc.line(cx - 30, signY + 16, cx + 25, signY + 16);

  // ── Corporate Representative Seal ──
  const sealX = cx + 32;
  const sealY = signY + 5;
  const outerR = 15;
  const innerR = 12;

  // Outer double circle
  doc.setDrawColor(190, 40, 40);
  doc.setLineWidth(1.8);
  doc.circle(sealX, sealY, outerR);
  doc.setLineWidth(0.6);
  doc.circle(sealX, sealY, innerR);

  // Cross lines inside seal
  doc.setLineWidth(0.4);
  doc.line(sealX - innerR + 2, sealY, sealX + innerR - 2, sealY);

  if (isKorean) {
    doc.setFont('NanumGothic', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(190, 40, 40);
    doc.text('\uBC95\uC778\uB300\uD45C', sealX, sealY - 3, { align: 'center' });
    doc.setFontSize(10);
    doc.text('\uC778', sealX, sealY + 7, { align: 'center' });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(190, 40, 40);
    doc.text('CORPORATE', sealX, sealY - 3.5, { align: 'center' });
    doc.text('REP.', sealX, sealY - 0.5, { align: 'center' });
    doc.setFontSize(7);
    doc.text('SEAL', sealX, sealY + 6.5, { align: 'center' });
  }

  // ── Registration number ──
  const regNum = 'REG-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000);
  if (isKorean) {
    doc.setFont('NanumGothic', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('\uBC95\uC778\uB300\uD45C \uC778\uC99D\uBC88\uD638: ' + regNum, cx, signY + 24, { align: 'center' });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('Corporate Rep. Certification No: ' + regNum, cx, signY + 24, { align: 'center' });
  }

  // ── Footer ──
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  if (isKorean) {
    doc.setFont('NanumGothic', 'normal');
    doc.text('\uC704\uD0A4\uC18C\uD504\uD2B8\uBCF4\uD5D8\uACC4\uB9AC\uBC95\uC778 | \uC11C\uC6B8\uC2DC \uC885\uB85C\uAD6C \uC778\uC0AC\uB3D95\uAE38 42 \uC885\uB85C\uBE4C\uB529 502\uD638', cx, H - 22, { align: 'center' });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.text('WIKISOFT Actuarial Consulting | #502 Jongno Bldg, 42 Insadong 5-gil, Jongno-gu, Seoul, Korea', cx, H - 22, { align: 'center' });
  }
  doc.setFont('helvetica', 'normal');
  doc.text('Tel: +82-10-2822-1895 | E-mail: mayman11@wikisoft.co.kr | www.wkac.co.kr', cx, H - 18, { align: 'center' });
}

// ═══════════════════════════════════════
//  KOREAN CERTIFICATE PDF
// ═══════════════════════════════════════

async function generateCertificateKR(name, dept, role) {
  const btn = event.currentTarget;
  const origHTML = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">&#8987;</span> Loading...';
  btn.disabled = true;

  try {
    await ensureKoreanFont();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = 210, H = 297, cx = W / 2;

    // Register Korean font
    doc.addFileToVFS('NanumGothic.ttf', koreanFontBase64);
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');

    const today = new Date();
    const dateStr = today.getFullYear() + '\uB144 ' + String(today.getMonth()+1).padStart(2,'0') + '\uC6D4 ' + String(today.getDate()).padStart(2,'0') + '\uC77C';
    const certNum = 'WKAC-' + today.getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000);

    drawCertBorder(doc, W, H);

    // Company header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Actuarial Consulting with WIKISOFT', cx, 30, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text('www.wkac.co.kr', cx, 35, { align: 'center' });

    // Title
    doc.setFont('NanumGothic', 'normal');
    doc.setFontSize(28);
    doc.setTextColor(40, 40, 40);
    doc.text('\uACBD \uB825 \uC99D \uBA85 \uC11C', cx, 62, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(140, 140, 140);
    doc.text('CERTIFICATE OF EMPLOYMENT', cx, 70, { align: 'center' });

    // Decorative line
    doc.setDrawColor(160, 140, 100);
    doc.setLineWidth(0.5);
    doc.line(55, 76, W - 55, 76);

    // Cert number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('No. ' + certNum, cx, 84, { align: 'center' });

    // Personal info
    const startY = 98;
    const labelX = 42;
    const valX = 82;
    const gap = 13;

    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(0.2);

    const fields = [
      ['\uC131        \uBA85', name],
      ['\uC804        \uACF5', dept],
      ['\uADFC \uBB34 \uCC98', '\uACC4\uB9AC\uD300'],
      ['\uC9C1        \uC704', '\uC778\uD134'],
      ['\uADFC\uBB34\uAE30\uAC04', '2025\uB144 03\uC6D4 01\uC77C ~ 2025\uB144 11\uC6D4 30\uC77C (9\uAC1C\uC6D4)'],
    ];

    fields.forEach(([label, value], i) => {
      const y = startY + i * gap;
      doc.setFont('NanumGothic', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(label, labelX, y);

      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(value, valX, y);

      doc.line(valX, y + 2, W - 38, y + 2);
    });

    // Work description
    const descY = startY + fields.length * gap + 14;
    doc.setDrawColor(160, 140, 100);
    doc.setLineWidth(0.3);
    doc.line(38, descY, W - 38, descY);

    doc.setFont('NanumGothic', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('\uC8FC\uC694 \uC5C5\uBB34 \uB0B4\uC6A9', labelX, descY + 12);

    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);

    const tasks = [
      '1. AI\uB97C \uD65C\uC6A9\uD55C K-IFRS 1019 \uD1F4\uC9C1\uAE09\uC5EC\uBD80\uCC44\uC0B0\uCD9C \uC2DC\uC2A4\uD15C \uAC1C\uBC1C \uCC38\uC5EC',
      '2. ' + role,
      '3. K-IFRS 1019\uD638 \uC885\uC5C5\uC6D0\uAE09\uC5EC \uD68C\uACC4 \uB370\uC774\uD130 \uC815\uD569\uC131 \uAC80\uC99D',
      '4. \uBCF4\uD5D8\uC218\uB9AC\uC801 \uAC00\uC815 \uAC80\uC99D \uBC0F \uC774\uC0C1\uCE58 \uD0D0\uC9C0 \uB85C\uC9C1 \uAC1C\uBC1C',
      '5. \uAC80\uC99D \uACB0\uACFC \uB9AC\uD3EC\uD2B8 \uC2DC\uC2A4\uD15C \uAC1C\uBC1C \uCC38\uC5EC',
      '6. \uD504\uB85C\uC81D\uD2B8 \uBB38\uC11C\uD654 \uBC0F \uD488\uC9C8 \uBCF4\uC99D \uD65C\uB3D9',
    ];

    tasks.forEach((t, i) => {
      doc.text(t, labelX + 2, descY + 22 + i * 8);
    });

    // Certification body
    const bodyY = descY + 22 + tasks.length * 8 + 14;
    doc.setDrawColor(160, 140, 100);
    doc.setLineWidth(0.3);
    doc.line(38, bodyY, W - 38, bodyY);

    doc.setFont('NanumGothic', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(40, 40, 40);
    doc.text('\uC704 \uC0AC\uB78C\uC740 \uB2F9 \uBC95\uC778\uC5D0\uC11C \uC0C1\uAE30 \uAE30\uAC04 \uB3D9\uC548 \uC778\uD134\uC73C\uB85C \uADFC\uBB34\uD558\uC600\uC73C\uBA70,', cx, bodyY + 14, { align: 'center' });
    doc.text('K-IFRS 1019\uD638 \uAE30\uBC18 \uB370\uC774\uD130 \uAC80\uC99D \uD504\uB85C\uC81D\uD2B8\uC5D0 \uD0C1\uC6D4\uD55C \uC131\uACFC\uB85C \uAE30\uC5EC\uD558\uC600\uC74C\uC744', cx, bodyY + 22, { align: 'center' });
    doc.text('\uC774\uC5D0 \uC99D\uBA85\uD569\uB2C8\uB2E4.', cx, bodyY + 30, { align: 'center' });

    // Date
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(dateStr, cx, bodyY + 48, { align: 'center' });

    // Company & CEO
    const signY = bodyY + 64;
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text('\uC704\uD0A4\uC18C\uD504\uD2B8\uBCF4\uD5D8\uACC4\uB9AC\uBC95\uC778', cx, signY, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('\uB300\uD45C\uC774\uC0AC (\uBC95\uC778\uB300\uD45C)   \uC774 \uAE30 \uD6C8', cx, signY + 10, { align: 'center' });

    drawSealAndFooter(doc, cx, signY, W, H, true);

    savePdfMobile(doc, '\uACBD\uB825\uC99D\uBA85\uC11C_' + name + '_\uC704\uD0A4\uC18C\uD504\uD2B8.pdf');

  } catch(e) {
    alert('\uD55C\uAE00 \uD3F0\uD2B8 \uB85C\uB4DC \uC2E4\uD328: ' + e.message + '\n\n\uC601\uBB38 \uC99D\uBA85\uC11C(ENG) \uBC84\uD2BC\uC744 \uC774\uC6A9\uD574 \uC8FC\uC138\uC694.');
  } finally {
    btn.innerHTML = origHTML;
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════
//  ENGLISH CERTIFICATE PDF
// ═══════════════════════════════════════

function generateCertificateEN(name, dept, role) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210, H = 297, cx = W / 2;

  const today = new Date();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateStr = months[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear();
  const certNum = 'WKAC-' + today.getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000);

  drawCertBorder(doc, W, H);

  // Company header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Actuarial Consulting with WIKISOFT', cx, 30, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text('www.wkac.co.kr', cx, 35, { align: 'center' });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(40, 40, 40);
  doc.text('CERTIFICATE', cx, 58, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(100, 100, 100);
  doc.text('OF EMPLOYMENT', cx, 66, { align: 'center' });

  // Decorative line
  doc.setDrawColor(160, 140, 100);
  doc.setLineWidth(0.5);
  doc.line(55, 72, W - 55, 72);

  // Cert number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Certificate No. ' + certNum, cx, 80, { align: 'center' });

  // Personal info
  const startY = 96;
  const labelX = 42;
  const valX = 85;
  const gap = 13;

  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.2);

  const fields = [
    ['Name', name],
    ['Major', dept],
    ['Department', 'Actuarial Team'],
    ['Position', 'Intern'],
    ['Period', 'March 1, 2025 ~ November 30, 2025 (9 months)'],
  ];

  fields.forEach(([label, value], i) => {
    const y = startY + i * gap;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(label, labelX, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(value, valX, y);

    doc.line(valX, y + 2, W - 38, y + 2);
  });

  // Work description
  const descY = startY + fields.length * gap + 14;
  doc.setDrawColor(160, 140, 100);
  doc.setLineWidth(0.3);
  doc.line(38, descY, W - 38, descY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Key Responsibilities', labelX, descY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);

  const tasks = [
    '1. Participated in developing K-IFRS 1019 retirement benefit obligation calculation system using AI',
    '2. ' + role,
    '3. Employee benefits accounting data validation under K-IFRS 1019',
    '4. Actuarial assumption verification and anomaly detection development',
    '5. Validation report system development',
    '6. Project documentation and quality assurance activities',
  ];

  tasks.forEach((t, i) => {
    doc.text(t, labelX + 2, descY + 22 + i * 8);
  });

  // Certification body
  const bodyY = descY + 22 + tasks.length * 8 + 14;
  doc.setDrawColor(160, 140, 100);
  doc.setLineWidth(0.3);
  doc.line(38, bodyY, W - 38, bodyY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(40, 40, 40);
  doc.text('This is to certify that the above-named person served as an intern', cx, bodyY + 14, { align: 'center' });
  doc.text('at WIKISOFT Actuarial Consulting during the aforementioned period,', cx, bodyY + 22, { align: 'center' });
  doc.text('and made outstanding contributions to the K-IFRS 1019', cx, bodyY + 30, { align: 'center' });
  doc.text('Data Validation Project.', cx, bodyY + 38, { align: 'center' });

  // Date
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(dateStr, cx, bodyY + 54, { align: 'center' });

  // Company & CEO (Corporate Representative)
  const signY = bodyY + 68;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('WIKISOFT Actuarial Consulting', cx, signY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text('CEO (Corporate Representative)   Lee Ki-Hoon', cx, signY + 10, { align: 'center' });

  drawSealAndFooter(doc, cx, signY, W, H, false);

  savePdfMobile(doc, 'Certificate_' + name.replace(/\s/g, '_') + '_WIKISOFT.pdf');
}

// ═══════════════════════════════════════
//  ANOMALY DETECTION DEMO
// ═══════════════════════════════════════

const ACTUARIAL_REF = {
  discount:  { mean: 4.0,  std: 0.8,  label: '할인율',     unit: '%' },
  salary:    { mean: 4.5,  std: 1.0,  label: '임금상승률', unit: '%' },
  turnover:  { mean: 10.0, std: 3.0,  label: '퇴직률',     unit: '%' },
  mortality: { mean: 1.0,  std: 0.15, label: '사망률 배수', unit: 'x' },
};

function classifyZScore(z) {
  var a = Math.abs(z);
  if (a < 1.5) return { cls: 'normal',  label: '정상', icon: '\u2713' };
  if (a < 2.5) return { cls: 'warning', label: '주의', icon: '\u26A0' };
  return { cls: 'anomaly', label: '이상', icon: '\u2717' };
}

function runAnomalyDetection() {
  var vals = {
    discount:  parseFloat(document.getElementById('demoDiscount').value)  || 0,
    salary:    parseFloat(document.getElementById('demoSalary').value)    || 0,
    turnover:  parseFloat(document.getElementById('demoTurnover').value)  || 0,
    mortality: parseFloat(document.getElementById('demoMortality').value) || 0,
  };

  var html = '<div class="demo-result-grid">';
  var keys = ['discount', 'salary', 'turnover', 'mortality'];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var ref = ACTUARIAL_REF[key];
    var val = vals[key];
    var z = (val - ref.mean) / ref.std;
    var st = classifyZScore(z);
    var barW = Math.min(Math.abs(z) / 3 * 100, 100);

    html += '<div class="demo-result-card demo-' + st.cls + '">' +
      '<div class="demo-result-icon">' + st.icon + '</div>' +
      '<div class="demo-result-label">' + ref.label + '</div>' +
      '<div class="demo-result-value">' + val + ref.unit + '</div>' +
      '<div class="demo-result-zscore">Z-score: ' + z.toFixed(2) + '</div>' +
      '<div class="demo-result-status">' + st.label + '</div>' +
      '<div class="demo-result-bar"><div class="demo-result-bar-fill" style="width:' + barW + '%"></div></div>' +
    '</div>';
  }
  html += '</div>';
  document.getElementById('demoResults').innerHTML = html;
}

document.getElementById('demoRunBtn').addEventListener('click', runAnomalyDetection);

// ═══════════════════════════════════════
//  EVENT DELEGATION (보안: 인라인 핸들러 제거)
// ═══════════════════════════════════════

// 팀 카드 사진 업로드 클릭
document.querySelectorAll('.team-card-visual').forEach(function(visual) {
  visual.addEventListener('click', function() {
    this.querySelector('.photo-input').click();
  });
});

// 사진 파일 선택 시
document.querySelectorAll('.photo-input').forEach(function(input) {
  input.addEventListener('change', function() {
    var idx = parseInt(this.dataset.photoIdx, 10);
    handlePhotoUpload(this, idx);
  });
});

// 경력증명서 버튼 클릭
document.querySelectorAll('.cert-btn[data-cert-lang]').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var card = this.closest('.team-card');
    var lang = this.dataset.certLang;
    if (lang === 'kr') {
      generateCertificateKR(card.dataset.member, card.dataset.dept, card.dataset.role);
    } else {
      generateCertificateEN(card.dataset.memberEn, card.dataset.deptEn, card.dataset.roleEn);
    }
  });
});