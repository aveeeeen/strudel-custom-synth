import * as Tone from 'tone'
import { createParams, getFreq } from '@strudel/core'
import { registerSound, getAudioContext } from '@strudel/webaudio'


export const useKick = () => {

  // Your sound made with Tone.js here

  const kick = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 13,
    oscillator: {
      type: 'sine'
    },
    modulation: {
      type: 'square'
    },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0,
      release: 0.1
    },
    modulationEnvelope: {
      attack: 0.01,
      decay: 0,
      sustain: 1,
      release: 0.1
    },
    note: 'F2'
  })

  const pitchEnv = new Tone.FrequencyEnvelope({
    baseFrequency: "F2",
    octaves: 2
  })

  const lpf = new Tone.Filter(100, 'lowpass', -24)
  lpf.Q.value = 3
  const lpfScale = new Tone.Scale(1000, 50)
  const lpfEnv = new Tone.Envelope()
  lpfEnv.connect(lpfScale)
  lpfScale.connect(lpf.frequency)

  const hpf = new Tone.Filter(100, 'highpass', -24)
  hpf.Q.value = 3
  const hpfScale = new Tone.Scale(1000, 50)
  const hpfEnv = new Tone.Envelope()
  hpfEnv.connect(hpfScale)
  hpfScale.connect(hpf.frequency)

  
  // Let the gain node from OG Web Audio API as the destination source of your audio chain
  // This way of connection is the only way where you can apply all the strudel's effect chain in combination with Tone.js
  const endOfNode = new GainNode(getAudioContext(), {gain: 1})
  pitchEnv.connect(kick.oscillator.frequency)
  pitchEnv.connect(kick.modulation.frequency)
  kick.connect(hpf)
  hpf.connect(lpf)
  lpf.connect(endOfNode)

  // Create parameters so that the strudel repl can interpret. These parameters (control patterns/parameters) will be passed as hap values to the sound registered in strudel.
  // Some control parameters are pre-defined so becareful
  createParams('harm', 'modu', 'fmSet', 'pEnvSet', 'lpfEnvSet', 'hpfEnvSet', 'lpfRange', 'hpfRange' )

  registerSound(
    "kik", // The name of the sound that should be given to `s`, e.g. `mysaw`
    // The function called by the scheduler to trigger the sound:
    (
      time, // The audio context time the sound should start
      value, // The value of the `Hap` (passed values as control patterns. To able to pass these values to this function you need to assign it as a valid parameter from createParams() function)
      onended // A callback that should be fired when the sound has ended
    ) => {
      
      let { decay, harm, modu, note, duration, fmSet, pEnvSet, lpfEnvSet, hpfEnvSet, lpfRange, hpfRange } = value;

      const freq = note ? getFreq(note) : "f2"

      // Map parameter values
      if(fmSet){
        kick.set(fmSet)
      }

      if(pEnvSet){
        pitchEnv.set(pEnvSet)
      }

      if(lpfEnvSet){
        lpfEnv.set(lpfEnvSet)
      }

      if(hpfEnvSet){
        hpfEnv.set(hpfEnvSet)
      }

      if(lpfRange){
        lpfScale.set(lpfRange)
      }

      if(hpfRange){
        hpfScale.set(hpfRange)
      }

      // Sound triggering

      pitchEnv.set({
        baseFrequency: freq
      })

      kick.triggerAttack(freq, time)
      pitchEnv.triggerAttack(time)
      lpfEnv.triggerAttack(time)
      hpfEnv.triggerAttack(time)
      

      // This is a callback which is emmited when the sound stops
      const stop = (time) => {
        kick.triggerRelease(time)
        pitchEnv.triggerRelease(time)
        lpfEnv.triggerRelease(time)
        hpfEnv.triggerRelease(time)
        // Disconnect only the end of node (endOfNode) 
        // The official strudel doc gives you an example where you disconnect all sources but if you do this with Tone.js Audio Node, you'll get no sound 
        // Since all audio node instances are defined outside this registerSound() callback, it is safe to do so. (if the audio node is defined inside the callback, you will hear multiple instances of the audio node resulting a crash of the browser)
        endOfNode.disconnect()
        onended()
      }

      return { node: endOfNode, stop }
    },
  );
}