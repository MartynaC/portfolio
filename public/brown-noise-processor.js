class BrownNoiseProcessor extends AudioWorkletProcessor {
  constructor() { super(); this._lastOut = 0.0; }
  process(inputs, outputs) {
    const out = outputs[0][0];
    for (let i = 0; i < out.length; i++) {
      const white = Math.random() * 2 - 1;
      this._lastOut = (this._lastOut + 0.02 * white) / 1.02;
      out[i] = this._lastOut * 3.5;
    }
    return true;
  }
}
registerProcessor('brown-noise', BrownNoiseProcessor);
