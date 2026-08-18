import type { CameraDeviceInfo, MicTelemetry, SpeakerChannel } from "../types";

let activeAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
	if (!activeAudioCtx || activeAudioCtx.state === "closed") {
		const AudioContextClass =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext;
		activeAudioCtx = new AudioContextClass();
	}
	if (activeAudioCtx.state === "suspended") {
		activeAudioCtx.resume();
	}
	return activeAudioCtx;
}

/**
 * Plays a smooth synthesized test tone to test Stereo Left, Right, Both channels or frequency sweep.
 */
export async function playSpeakerTestTone(
	channel: SpeakerChannel,
	durationMs = 1200,
): Promise<void> {
	if (typeof window === "undefined") return;

	try {
		const ctx = getAudioContext();
		const now = ctx.currentTime;
		const durationSec = durationMs / 1000;

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		// Smooth volume envelope to prevent clicking
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
		gain.gain.setValueAtTime(0.3, now + durationSec - 0.08);
		gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

		if (channel === "sweep") {
			// Frequency sweep from 100Hz (Bass) to 3000Hz (Treble)
			osc.type = "sine";
			osc.frequency.setValueAtTime(100, now);
			osc.frequency.exponentialRampToValueAtTime(3000, now + durationSec);
		} else {
			osc.type = "sine";
			// Left = 440 Hz (A4), Right = 880 Hz (A5), Both = 554 Hz (C#5)
			const freq = channel === "left" ? 440 : channel === "right" ? 880 : 554;
			osc.frequency.setValueAtTime(freq, now);
		}

		// Panning
		if (typeof ctx.createStereoPanner === "function") {
			const panner = ctx.createStereoPanner();
			const panValue =
				channel === "left" ? -1.0 : channel === "right" ? 1.0 : 0.0;
			panner.pan.setValueAtTime(panValue, now);
			osc.connect(gain);
			gain.connect(panner);
			panner.connect(ctx.destination);
		} else {
			osc.connect(gain);
			gain.connect(ctx.destination);
		}

		osc.start(now);
		osc.stop(now + durationSec);

		await new Promise((resolve) => setTimeout(resolve, durationMs + 50));
	} catch {
		// Audio context error or blocked by autoplay policy
	}
}

/**
 * Initializes real-time Microphone stream diagnostics and volume level analyzer.
 * Returns a cleanup function to release microphone hardware stream and audio nodes.
 */
export async function startMicDiagnostics(
	onTelemetry: (telemetry: MicTelemetry, frequencyData: Uint8Array) => void,
	onError: (errMessage: string) => void,
): Promise<() => void> {
	if (
		typeof navigator === "undefined" ||
		!navigator.mediaDevices?.getUserMedia
	) {
		onError("Microphone access is not supported on this browser.");
		return () => {};
	}

	let stream: MediaStream | null = null;
	let animId: number | null = null;

	try {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: false,
				noiseSuppression: false,
				autoGainControl: false,
			},
		});

		const ctx = getAudioContext();
		const source = ctx.createMediaStreamSource(stream);
		const analyser = ctx.createAnalyser();
		analyser.fftSize = 64;
		analyser.smoothingTimeConstant = 0.8;
		source.connect(analyser);

		const track = stream.getAudioTracks()[0];
		const deviceLabel = track?.label || "Default Microphone";
		const sampleRate = ctx.sampleRate || 48000;
		const channelCount = track?.getSettings()?.channelCount || 1;

		const freqBuffer = new Uint8Array(analyser.frequencyBinCount);
		const timeBuffer = new Uint8Array(analyser.fftSize);

		const updateLoop = () => {
			analyser.getByteFrequencyData(freqBuffer);
			analyser.getByteTimeDomainData(timeBuffer);

			// Calculate RMS
			let sumSquares = 0;
			for (let i = 0; i < timeBuffer.length; i++) {
				const val = (timeBuffer[i] ?? 128) - 128;
				sumSquares += val * val;
			}
			const rms = Math.sqrt(sumSquares / timeBuffer.length);
			const peakLevel = Math.min(100, Math.round((rms / 128) * 300));
			const volumeDb =
				rms > 0 ? Math.max(-60, Math.round(20 * Math.log10(rms / 128))) : -60;

			onTelemetry(
				{
					active: true,
					peakLevel,
					volumeDb,
					sampleRate,
					channelCount,
					deviceLabel,
				},
				freqBuffer.slice(0, 16),
			);

			animId = requestAnimationFrame(updateLoop);
		};

		updateLoop();

		return () => {
			if (animId) cancelAnimationFrame(animId);
			source.disconnect();
			analyser.disconnect();
			if (stream) {
				for (const t of stream.getTracks()) {
					t.stop();
				}
			}
		};
	} catch (err) {
		const msg =
			err instanceof Error
				? err.message
				: "Microphone permission denied or device busy.";
		onError(msg);
		return () => {};
	}
}

/**
 * Enumerates available camera hardware devices.
 */
export async function getAvailableCameras(): Promise<CameraDeviceInfo[]> {
	if (
		typeof navigator === "undefined" ||
		!navigator.mediaDevices?.enumerateDevices
	) {
		return [];
	}

	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const videoDevices = devices.filter((d) => d.kind === "videoinput");

		return videoDevices.map((d, i) => ({
			deviceId: d.deviceId,
			label: d.label || `Camera Device ${i + 1}`,
			supportedResolutions: [
				"1080p (1920×1080)",
				"720p (1280×720)",
				"VGA (640×480)",
			],
		}));
	} catch {
		return [];
	}
}
