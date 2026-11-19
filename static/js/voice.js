/**
 * Find My Stuff AI - Voice Recognition & Speech Synthesis Module
 * Supports Web Speech API with pulse animations and Web Audio feedback tones.
 */

class VoiceSearchController {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.onStatusChangeCallback = null;
        this.audioCtx = null;

        this.initRecognition();
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Web Speech API is not supported in this browser.");
            return;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.playTone(600, 0.08); // Friendly listening chime
                if (this.onStatusChangeCallback) this.onStatusChangeCallback(true, 'Listening... Speak now');
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                const transcript = finalTranscript || interimTranscript;
                if (this.onStatusChangeCallback) {
                    this.onStatusChangeCallback(true, `Heard: "${transcript}"`);
                }

                if (finalTranscript && this.onResultCallback) {
                    this.playTone(880, 0.1); // Success chime
                    this.onResultCallback(finalTranscript.trim());
                }
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                console.error("Speech Recognition Error:", event.error);
                let message = "Speech recognition error.";
                if (event.error === 'not-allowed') {
                    message = "Microphone access denied. Please allow microphone permission in your browser.";
                } else if (event.error === 'no-speech') {
                    message = "No speech detected. Please try speaking again.";
                }
                if (this.onErrorCallback) this.onErrorCallback(message);
                if (this.onStatusChangeCallback) this.onStatusChangeCallback(false, message);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.onStatusChangeCallback) this.onStatusChangeCallback(false, 'Ready');
            };
        } catch (err) {
            console.error("Failed to initialize speech recognition:", err);
        }
    }

    startListening(onResult, onStatusChange, onError) {
        this.onResultCallback = onResult;
        this.onStatusChangeCallback = onStatusChange;
        this.onErrorCallback = onError;

        if (!this.recognition) {
            if (onError) onError("Voice search is not supported on this browser. Try Chrome, Edge, or Safari.");
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Recognition already started or error:", e);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            if (this.onStatusChangeCallback) this.onStatusChangeCallback(false, 'Stopped');
        }
    }

    // Web Audio API pure synthesized tones (zero external mp3 needed!)
    playTone(frequency = 440, duration = 0.1) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!this.audioCtx) this.audioCtx = new AudioContext();
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume().catch(() => {});
            }

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

            gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            // Audio context silently ignored if blocked by autoplay policy
        }
    }
}

window.VoiceSearch = new VoiceSearchController();

