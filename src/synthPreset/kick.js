import * as Tone from 'tone'
import { createParams, getFreq } from '@strudel/core'
import { registerSound, getAudioContext, webAudioTimeout } from '@strudel/webaudio'


export const useKick = () => {
  console.log("kick sound loaded")
  const soundWrapper = () => {
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
        attack: 0.001,
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
    hpf.connect(endOfNode)

    // setting parameters for sound-design

    kick.set({
      envelope: {
        attack: 0.005,
        decay: 0.4,
        sustain: 0,
        release: 0.5,
      },
      modulationEnvelope: {
          decay: 0,
          sustain: 0
      },
      modulationIndex: 13,  
      harmonicity: 1
    })

    pitchEnv.set({
      attack: 0.005,
      decay: 0.1,
    })

    hpfEnv.set({
      attack: 0.005,
      decay: 0.2,
      sustain: 0.1,
    })

    hpfScale.set({
      min: 20,
      max: 200,
    })

    return {
      // audio node to pass to soundRegister()
      node: endOfNode,
      triggerAttack (freq, time) {
        pitchEnv.set({
          baseFrequency: freq
        })
        kick.triggerAttack(freq, time)
        pitchEnv.triggerAttack(time)
        hpfEnv.triggerAttack(time)
      },
      triggerRelease (time) {
        kick.triggerRelease(time)
        pitchEnv.triggerRelease(time)
        hpfEnv.triggerRelease(time)
      },
      // disconnect EndOfNode Audio Node and dispose all Tone.js Audio Nodes after the end note
      // unelse it will have a massive memory payload and crash
      deconstruct(){
        endOfNode.disconnect()
        kick.dispose()
        pitchEnv.dispose()
        hpf.dispose()
        hpfEnv.dispose()
        hpfScale.dispose()
      },
      // define setter function for applying control parameters
      kick,
    }
  }

  // Create parameters so that the strudel repl can interpret. These parameters (control patterns/parameters) will be passed as hap values to the sound registered in strudel.
  // Some control parameters are pre-defined so becareful
  // Only include some parameters that you will change on the fly. Calling setter method from Tone.js instances uses enormous amount of resourse somehow. 
  // The best practice is to pre-define the parameters inside soundWrapper() prior
  createParams('harm', 'modIndex', 'modDecay' )

  registerSound(
    "kik", // The name of the sound that should be given to `s`, e.g. `mysaw`
    // The function called by the scheduler to trigger the sound:
    (
      time, // The audio context time the sound should start
      value, // The value of the `Hap` (passed values as control patterns. To able to pass these values to this function you need to assign it as a valid parameter from createParams() function)
      onended // A callback that should be fired when the sound has ended
    ) => {
      
      // destruturing hap values to meaningful parameters
      let { note, duration, modIndex, modDecay, decay, harm } = value;

      const freq = note ? getFreq(note) : "f2"

      const sound = soundWrapper()

      // Map parameter values
      if(harm) {
        sound.kick.harmonicity.value = harm
      }

      if(modIndex) {
        sound.kick.modulationIndex.value = modIndex
      }

      if(modDecay) {
        sound.kick.modulationEnvelope.decay = modDecay
      }

      if(decay) {
        sound.kick.envelope.decay = decay
      }
      const timeEnd = time + duration

      // Sound triggering
      sound.triggerAttack(freq, time)
      sound.triggerRelease(timeEnd)

      webAudioTimeout(
        getAudioContext(),
        () => {
          sound.deconstruct()
          onended()
        },
        time,
        timeEnd
      )

      return { node: sound.node, stop: (time) => {} }
    },
  );
}