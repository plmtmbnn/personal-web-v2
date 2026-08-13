/**
 * Web Audio API Sound Synthesizer for Spinner Wheel.
 * Generates procedural tick sounds and victory chimes without external audio assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (!audioCtx) {
		const AudioContextClass =
			window.AudioContext || (window as any).webkitAudioContext;
		if (AudioContextClass) {
			audioCtx = new AudioContextClass();
		}
	}
	if (audioCtx && audioCtx.state === "suspended") {
		audioCtx.resume().catch(() => {});
	}
	return audioCtx;
}

/**
 * Plays a mechanical tick sound when wheel pointer passes a slice border.
 */
export function playTickSound(soundEnabled = true) {
	if (!soundEnabled) return;
	try {
		const ctx = getAudioContext();
		if (!ctx) return;

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = "triangle";
		// High click pitch
		osc.frequency.setValueAtTime(580, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.03);

		gain.gain.setValueAtTime(0.18, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start();
		osc.stop(ctx.currentTime + 0.035);
	} catch (_e) {}
}

/**
 * Plays a triumphant fanfare sound sequence when a winner is selected.
 */
export function playVictorySound(soundEnabled = true) {
	if (!soundEnabled) return;
	try {
		const ctx = getAudioContext();
		if (!ctx) return;

		const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
		notes.forEach((freq, idx) => {
			setTimeout(() => {
				try {
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();

					osc.type = "sine";
					osc.frequency.setValueAtTime(freq, ctx.currentTime);

					gain.gain.setValueAtTime(0.2, ctx.currentTime);
					gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

					osc.connect(gain);
					gain.connect(ctx.destination);

					osc.start();
					osc.stop(ctx.currentTime + 0.42);
				} catch (_e) {}
			}, idx * 110);
		});
	} catch (_e) {}
}
