export function speakGerman(text: string, rate = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = rate;

  // Try to find German voice
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find((v) => v.lang.startsWith('de'));
  if (germanVoice) {
    utterance.voice = germanVoice;
  }

  window.speechSynthesis.speak(utterance);
}
