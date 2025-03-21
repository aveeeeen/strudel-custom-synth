import './style.css'
import { Editor } from './editor.js';
import { StrudelWrapper } from './strudelWrapper.js';
import * as Tone from 'tone'

//
// import your own synth preset bellow
// declare your synth preset at 'src/synthpreset/'
//

import { useKick } from './synthPreset/kick.js';

document.querySelector('#app').innerHTML = `
  <p>A custom editor for strudel where you can use pre-defined synth with integration of Tone.js as a synth source!!<p>
  <p>To evaluate code press eval or Ctrl + Enter</p>
  <div class="bar">
    <button id="eval"> eval </button>
    <button id="trydemo"> try demo! </button> 
  </div>
  <div id="editor"></div>  
`

const editor = new Editor("editor");
const strudel = new StrudelWrapper();

editor.setEvalCommand(() => {
  console.log("eval command loaded")
  editor.editorEval(() => {
    strudel.eval(editor.getValue())
  })
})

document.getElementById('eval').addEventListener('click', () => {
  editor.editorEval(() => {
    strudel.eval(editor.getValue())
  })
})

document.getElementById('trydemo').addEventListener('click', () => {
  editor.setValue(`
    s('kik')
  `)
})

Tone.setContext(strudel.getAudioContext())

//
// load synth here
//

useKick();

