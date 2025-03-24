import "./style.css";
import { demoCode } from "./demoCodes/demoCodes.js";
import { Editor } from "./editorCodeMirror.js";
import { StrudelWrapper } from "./strudelWrapper.js";
import * as Tone from "tone";

//
// import your own synth preset bellow
// define your synth preset at 'src/synthpreset/'
//

import { useKick } from "./synthPreset/kick.js";

document.querySelector("#app").innerHTML = `
  <p>A custom editor for strudel where you can use pre-defined synth with integration of Tone.js as a synth source!!<p>
  <p>Open your devtools to see the console output from strudel</p>
  <p>To evaluate code press eval or Ctrl + Enter</p>
  <p>Have fun!!</p>
  <div class="bar">
    <button id="eval"> eval </button>
    <button id="trydemo"> try demo! </button> 
  </div>
  <div id="editor"></div>  
`;

const editor = new Editor("editor");
const strudel = new StrudelWrapper();

editor.setupEditorEval(() => {
  strudel.eval(editor.getValue());
});

document.getElementById("eval").addEventListener("click", () => {
  editor.editorEval(() => {
    strudel.eval(editor.getValue());
  });
});

document.getElementById("trydemo").addEventListener("click", () => {
  editor.setValue(demoCode);
});

Tone.setContext(strudel.getAudioContext());

//
// load synth here
//

useKick();
