// --- HTML5 Web Audio Synthesizer Engine ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    switch (type) {
        case 'click':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.08);
            osc.start(now); osc.stop(now + 0.08);
            break;
        case 'flip':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
            osc.start(now); osc.stop(now + 0.15);
            break;
        case 'scratch':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100 + Math.random() * 200, now);
            gainNode.gain.setValueAtTime(0.04, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.04);
            osc.start(now); osc.stop(now + 0.04);
            break;
        case 'win':
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const subOsc = audioCtx.createOscillator();
                const subGain = audioCtx.createGain();
                subOsc.connect(subGain); subGain.connect(audioCtx.destination);
                subOsc.type = 'sine';
                subOsc.frequency.setValueAtTime(freq, now + (idx * 0.1));
                subGain.gain.setValueAtTime(0.15, now + (idx * 0.1));
                subGain.gain.linearRampToValueAtTime(0, now + (idx * 0.1) + 0.3);
                subOsc.start(now + (idx * 0.1)); subOsc.stop(now + (idx * 0.1) + 0.3);
            });
            break;
        case 'lose':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(70, now + 0.6);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
            osc.start(now); osc.stop(now + 0.6);
            break;
    }
}