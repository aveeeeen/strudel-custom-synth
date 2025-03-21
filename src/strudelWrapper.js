import * as core from '@strudel/core'
import { noteToMidi, valueToMidi, Pattern, evalScope, repl, silence } from '@strudel/core';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds, registerZZFXSounds, samples, registerSound, getWorklet} from "@strudel/webaudio";
import { transpiler } from '@strudel/transpiler'

export class StrudelWrapper {

  constructor(){
    initAudioOnFirstClick();
    this.ctx = getAudioContext();
    this.strudelrepl = repl({
      defaultOutput: webaudioOutput,
      getTime: () => this.ctx.currentTime,
      beforeEval: async () => {
        await this.prebake()
      },
      transpiler: transpiler
    });
    this.strudelrepl.setPattern(silence)
    this.strudelrepl.start()
  }

  async prebake() {
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

  eval (value) {
    this.strudelrepl.evaluate(value)
  }

  getAudioContext(){
    return this.ctx
  }

  
}