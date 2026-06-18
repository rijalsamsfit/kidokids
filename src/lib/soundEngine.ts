// src/lib/soundEngine.ts

// Kita bikin instance AudioContext yang jalan di semua browser (Untuk SFX)
let audioCtx: AudioContext | null = null;

// Instance Audio untuk Background Music (BGM)
let bgmAudio: HTMLAudioElement | null = null;

const initAudio = () => {
  if (!audioCtx && typeof window !== "undefined") {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// --- 🎵 KONTROL BACKGROUND MUSIC (BGM) 🎵 ---

export const playBGM = (audioUrl: string) => {
  if (typeof window === "undefined") return;
  
  if (!bgmAudio) {
    bgmAudio = new Audio(audioUrl);
    bgmAudio.loop = true; // Musik akan berputar terus
    bgmAudio.volume = 0.15; // Volume sangat pelan agar tidak mengganggu (15%)
  } else if (bgmAudio.src !== audioUrl) {
    bgmAudio.src = audioUrl; 
  }
  
  // Browser butuh interaksi user (klik) sebelum ngebolehin audio jalan
  bgmAudio.play().catch(e => console.log("BGM menunggu interaksi user...", e));
};

export const pauseBGM = () => {
  if (bgmAudio && !bgmAudio.paused) {
    bgmAudio.pause();
  }
};

export const resumeBGM = () => {
  if (bgmAudio && bgmAudio.paused) {
    bgmAudio.play().catch(e => console.log("Gagal resume BGM", e));
  }
};

export const stopBGM = () => {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }
};


// --- 🔊 KONTROL SOUND EFFECTS (SFX) 🔊 ---

// 1. SUARA KOIN (Ting-ting tinggi)
export const playCoinSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.type = "sine"; // Gelombang halus
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1); // Pitch naik cepat
  
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
};

// 2. SUARA SUKSES / BENAR (Nada naik 2 ketuk: Ta-Daa!)
export const playSuccessSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const playNote = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.value = freq;
    
    gainNode.gain.setValueAtTime(0.1, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = ctx.currentTime;
  playNote(523.25, now, 0.15); // Nada C5 (Ta)
  playNote(659.25, now + 0.15, 0.3); // Nada E5 (Daa!)
};

// 3. SUARA GAGAL / SALAH (Nada rendah turun: Te-tot)
export const playErrorSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.type = "sawtooth"; // Gelombang agak kasar/lucu
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3); // Pitch turun
  
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
};