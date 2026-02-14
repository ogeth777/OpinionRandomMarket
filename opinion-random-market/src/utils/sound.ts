// Simple synth for sound effects using Web Audio API

// Initialize AudioContext lazily to handle browser policies
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const initAudio = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
};

export const playTick = () => {
  try {
    const ctx = getAudioContext();
    // Don't resume here automatically as it might fail if not in user gesture
    // relying on initAudio being called first

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Short high-pitched click/tick
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // console.error('Audio play failed', e);
  }
};

export const playWin = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    
    const now = ctx.currentTime;
    
    // Major chord arpeggio (A4, C#5, E5, A5) + sparkly high notes
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'; // Mix waves for richer sound
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.08;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
      
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  } catch (e) {
    console.error('Audio play failed', e);
  }
};
