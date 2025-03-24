import {EditorState, Compartment, Prec} from "@codemirror/state"
import {EditorView, keymap} from "@codemirror/view"
import {javascript} from "@codemirror/lang-javascript"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { vscodeDark } from '@uiw/codemirror-theme-vscode';


export class Editor {
  constructor(editorEl) {

    this.evalKeymap = new Compartment()
    
    this.editor = new EditorView({
      doc: this.loadContent(),
      parent: document.getElementById(editorEl),
      extensions: [
        basicSetup,
        vscodeDark,
        javascript(),
        keymap.of([
          indentWithTab,
        ]),
        this.evalKeymap.of(
          Prec.highest(
            keymap.of({
              key: "Mod-Enter",
              run: () => {
                console.log("eval called from command")
                return true
              }
            })
          )
        )
      ]
    })

    this.setupLayout()

    window.addEventListener('resize', () => this.setupLayout())
  }

  setupEditorEval(callback) {
    const keymapConfig = Prec.highest(
      keymap.of([{
        key: "Mod-Enter" ,
        run: () => {
          console.log("eval called from command")
          this.editorEval(callback)
          return true
        }
      }])
    )
    this.editor.dispatch({
      effects: this.evalKeymap.reconfigure(keymapConfig)
    })
  }

  setupLayout() {
    const width = window.innerWidth * 0.8
    const height = window.innerHeight * 0.8
    
    this.editor.dom.style.width = `${width}px`
    this.editor.dom.style.height = `${height}px`
  }

  loadContent() {
    const previousContent = localStorage.getItem('pre-edit')
    return previousContent || ''
  }

  editorEval(callback) {
    const defaultStyle = this.editor.dom.style.backgroundColor 
    this.editor.dom.style.backgroundColor = '#cccccc'
    setTimeout(() => {
      this.editor.dom.style.backgroundColor = defaultStyle
    }, 250)
    callback()
  }

  getValue() {
    return this.editor.state.doc.toString()
  }

  setValue(value) {
    this.editor.dispatch({
      changes: {
        from: 0,
        to: this.editor.state.doc.length,
        insert: value
      }
    })
  }
}