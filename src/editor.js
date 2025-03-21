import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

export class Editor{
  constructor(editorEl){
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

    this.editor = monaco.editor.create(document.getElementById(editorEl), {
      value: "",
      language: 'javascript',
      theme: 'vs-dark',
    });

    this.editor.setValue(this.loadContent())

    this.editor.onDidChangeModelContent(() => {
      localStorage.setItem("pre-edit", this.editor.getValue())
    })

    monaco.editor.defineTheme("flash", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
          "editor.background": "#cccccc"
      }
    });

    this.editor.layout({
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.8
    })

    window.addEventListener('resize', () => {
      const width = window.innerWidth * 0.8
      const height = window.innerHeight * 0.8
      this.editor.layout({ width, height })
    })
  }

  loadContent() {
    const previousContent = localStorage.getItem("pre-edit")
    if(previousContent) return previousContent
    return "" 
  }

  editorEval(callback){
    monaco.editor.setTheme('flash')
    setTimeout(() => {
      monaco.editor.setTheme('vs-dark')
    },250)
    callback()
  }

  setEvalCommand(callback){
    this.editor.addCommand(monaco.KeyCode.Enter | monaco.KeyMod.CtrlCmd, () => {
      callback()
    })
  }
  
  getValue(){
    return this.editor.getValue()
  }

  setValue(value){
    this.editor.setValue(value)
  }
}