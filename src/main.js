import './style.css'
import { setupCounter } from './counter.js'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import * as core from "@strudel/core";
import { noteToMidi, valueToMidi, Pattern, evalScope, repl, createParams } from '@strudel/core';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds, registerZZFXSounds, samples, registerSound, getWorklet} from "@strudel/webaudio";
import { transpiler } from '@strudel/transpiler'
import * as Tone from 'tone'

document.querySelector('#app').innerHTML = `
  <button id="eval"> eval </button>
  
  <div id="flash"></div>
  <div id="editor"></div>  
`

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const editor = monaco.editor.create(document.getElementById('editor'), {
  value: '',
  language: 'javascript',
  theme: 'vs-dark',
});

editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
  flashScreen();
  evalStrudel();
})

async function prebake() {
  const modulesLoading = evalScope(
    // import('@strudel/core'),
    core,
    import('@strudel/draw'),
    import('@strudel/webaudio'),
    import('@strudel/mini'),
    import('@strudel/transpiler'),
    import('@strudel/tonal'),
  );
  // load samples

  // TODO: move this onto the strudel repo
  const ts = 'https://raw.githubusercontent.com/todepond/samples/main/';
  await Promise.all([
    modulesLoading,
    registerSynthSounds(),
    registerZZFXSounds(),
    //registerSoundfonts(),
    // need dynamic import here, because importing @strudel/soundfonts fails on server:
    // => getting "window is not defined", as soon as "@strudel/soundfonts" is imported statically
    // seems to be a problem with soundfont2
    samples('https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/strudel.json')
  ]);
}


initAudioOnFirstClick();
const ctx = getAudioContext();

const strudelrepl = repl({
  defaultOutput: webaudioOutput,
  getTime: () => ctx.currentTime,
  beforeEval: async () => {
    await prebake()
  },
  transpiler: transpiler
});

// Tone.start()
Tone.setContext(ctx, true)

const kick = new Tone.FMSynth({
  modulationIndex: 10,
  harmonicity: 0.5, // Sub-octave relationship for deep bass
  oscillator: {
    type: 'sine',
  },
  modulation: {
    type: 'sine',
  },
  envelope: {
    attack: 0.001,
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

createParams('harm', 'modu')

registerSound(
  "kik", // The name of the sound that should be given to `s`, e.g. `mysaw`
  // The function called by the scheduler to trigger the sound:
  (
    time, // The audio context time the sound should start
    value, // The value of the `Hap`
    onended // A callback that should be fired when the sound has ended
  ) => {
    let { decay, harm, modu } = value;
    
    console.log(value)

    if(decay){
      kick.set(
        {
          envelope: {
            decay: decay
          }
        }
      )
    }

    if(harm){
      kick.set(
        {
          harmonicity: harm
        }
      )
    }

    if(modu){
      kick.set({
        modulation: {
          type: modu
        }
      })
    }
    
    const node = kick.toDestination()
    kick.triggerAttack("F1", time)
    const stop = (time) => {
      kick.triggerRelease(time)
      kick.disconnect()
      onended()
    }
    
    return {node, stop}
  },
);


const el = document.getElementById('eval')
el.addEventListener('click', () => {
  evalStrudel();
})

const evalStrudel = () => {
  strudelrepl.evaluate(editor.getValue())
  console.log(strudelrepl.state.code)

  if(!strudelrepl.state.started) strudelrepl.start()
}

const flashScreen = () => {
  const editorEl = document.getElementById("editor")
  const defaultStyles = editorEl.style
  editorEl.style.backgroundColor = 'white'
  editorEl.style.opacity = '80%'
  setTimeout(() => {
    editorEl.style = defaultStyles
  },250)
}