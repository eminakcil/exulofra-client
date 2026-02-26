class PCMAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Default buffer size for chunking
    this.bufferSize = 4096;
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0]; // Assuming mono channel (channel 0)

      for (let i = 0; i < channelData.length; i++) {
        // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
        let s = Math.max(-1, Math.min(1, channelData[i]));
        this.buffer[this.bufferIndex++] = s < 0 ? s * 0x8000 : s * 0x7FFF;

        if (this.bufferIndex >= this.bufferSize) {
          // Send exactly bufferSize chunks to the main thread
          this.port.postMessage(this.buffer);
          // Allocate new buffer to prevent transfer detachment issues
          this.buffer = new Int16Array(this.bufferSize);
          this.bufferIndex = 0;
        }
      }
    }
    // Return true to keep the processor alive
    return true;
  }
}

registerProcessor('pcm-audio-processor', PCMAudioProcessor);
