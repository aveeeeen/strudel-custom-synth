import * as Tone from 'tone'
import { createParams, getFreq } from '@strudel/core'
import { registerSound, getAudioContext, gainNode } from '@strudel/webaudio'


export const useKick = () => {

  // Your sound made with Tone.js here

  const kick = new Tone.FMSynth({
    modulationIndex: 10,
    harmonicity: 0.5, 
    oscillator: {
      type: 'sine',
    },
    modulation: {
      type: 'sine',
    },
    envelope: {
      attack: 0.01,
      decay: 1,
      sustain: 0,
      release: 0.1,
    },
    modulationEnvelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.1,
    },
    frequency: 50, // Base frequency for the kick
  })

  // Let the gain node from OG Web Audio API as the destination source of your audio chain
  // This way of connection is the only way that you can apply all the strudel's effect chain in combination with Tone.js
  const endOfNode = new GainNode(getAudioContext(), {gain: 1})
  kick.connect(endOfNode)

  //create parameters so that the strudel repl can interpret. These parameters will be passed as hap values to the sound registered in strudel.
  createParams('harm', 'modu')

  registerSound(
    "kik", // The name of the sound that should be given to `s`, e.g. `mysaw`
    // The function called by the scheduler to trigger the sound:
    (
      time, // The audio context time the sound should start
      value, // The value of the `Hap` (passed values as control patterns. To able to pass these values to this function you need to assign it as a valid parameter from createParams() function)
      onended // A callback that should be fired when the sound has ended
    ) => {
      let { decay, harm, modu, note, duration } = value;
      console.log(value)

      const freq = note ? getFreq(note) : "f2"

      if (decay) {
        kick.set(
          {
            envelope: {
              decay: decay
            }
          }
        )
      }

      if (harm) {
        kick.set(
          {
            harmonicity: harm
          }
        )
      }

      if (modu) {
        kick.set({
          modulation: {
            type: modu
          }
        })
      }

      kick.triggerAttack(freq, time)
      kick.triggerRelease(time + duration)

      const stop = (time) => {
        // disconnect only the end of node (endOfNode) 
        // the official strudel doc gives you an example where you disconnect all sources but if you do this with Tone.js Audio Node, you'll get no sound 
        // since all audio node instances are defined outside this registerSound() callback, it is safe to do so
        endOfNode.disconnect()
        onended()
      }

      return { node: endOfNode, stop }
    },
  );
}