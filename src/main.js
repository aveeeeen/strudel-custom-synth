import "./style.css";
import { demoCode } from "./demoCodes/demoCodes.js";
import { Editor } from "./editorCodeMirror.js";
import { StrudelWrapper } from "./strudelWrapper.js";
import * as Tone from "tone";
import { getAudioContext } from "@strudel/webaudio";
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
strudel.initStrudel();

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

Tone.setContext(getAudioContext());

//
// load synth here
//

useKick();

//
// you can also load synth defined in strudel functions as below
//

const fmkick = () => {
  return fm(4)
    .fmattack(0.001)
    .fmdecay(0.2)
    .fmsustain(0)
    .penv(24)
    .patt(0.001)
    .pdec(0.24)
    .sustain(0)
    .decay(2)
};

const fmsn = () => {
  return fm(16)
    .fmh(0.7)
    .fmattack(0.001)
    .fmdecay(0.2)
    .fmsustain(0)
    .decay(0.3)
    .sustain(0)
    .release(0.5)
    .penv(24)
    .patt(0.0001)
    .pdec(0.1)
    .hpf(50).hpq(16)
    .hpattack(.001)
    .hpdecay(0.1)
    .hpenv(4)
    .hpsustain(0.3)
}

strudel.assignSynthWrapper({ fmkick, fmsn })