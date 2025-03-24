export default {
  optimizeDeps: {
    exclude: [
      'codemirror',
      '@codemirror/commands',
      '@codemirror/language',
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/lang-sql',
      '@lezer/highlight'
    ]
  }
}