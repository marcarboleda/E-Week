// --- Smooth Scratch Canvas Engine ---
function setupSmoothScratch(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // EXACT ORIGINAL BASE: Solid pink fill rect across the canvas
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // NEW DESIGN ONLY: Centered high-contrast vinyl record graphic
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(rect.width, rect.height) / 2;

    // 1. Dark Record Body
    ctx.fillStyle = '#0d0618';
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.90, 0, Math.PI * 2);
    ctx.fill();

    // 2. Decorative Record Grooves
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Spindle Center Hole (Your matching cyan highlight accent)
    ctx.fillStyle = '#00f3ff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.20, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // UNTOUCHED ORIGINAL SCRATCHING MECHANICS
    // ==========================================
    let isScratching = false;
    let isFullyCleared = false;
    let lastX = 0;
    let lastY = 0;

    function getPosition(e) {
        const bounds = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - bounds.left,
            y: clientY - bounds.top
        };
    }

    function startScratch(e) {
        if (isFullyCleared) return;
        isScratching = true;
        const pos = getPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        scratchLine(pos.x, pos.y);
    }

    function moveScratch(e) {
        if (!isScratching || isFullyCleared) return;
        e.preventDefault();
        const pos = getPosition(e);
        scratchLine(pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
        playSound('scratch');
    }

    function stopScratch() {
        if (!isScratching) return;
        isScratching = false;
        checkTransparency();
    }

    function scratchLine(targetX, targetY) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = Math.max(34, rect.width * 0.28);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
    }

    function checkTransparency() {
        if (isFullyCleared) return;

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) {
                transparentPixels++;
            }
        }

        const totalSampled = pixels.length / 16;
        if (transparentPixels / totalSampled > 0.60) {
            isFullyCleared = true;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            checkScratchProgress();
        }
    }

    canvas.addEventListener('mousedown', startScratch);
    canvas.addEventListener('mousemove', moveScratch);
    window.addEventListener('mouseup', stopScratch);

    canvas.addEventListener('touchstart', startScratch);
    canvas.addEventListener('touchmove', moveScratch, { passive: false });
    window.addEventListener('touchend', stopScratch);
}