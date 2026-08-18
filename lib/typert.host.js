/* Host FaceModel reflection for dsh-claude-theme. Consumed by dsh-typert-loader
   at mount time (contributes the host face to the Typert registry); the running
   Host also falls back to SRC discovery. TYPERT_JSON is a passthrough schema
   (no zod dependency): parse returns the value unchanged. */
const TYPERT_JSON = { _zod: {}, parse: (v) => v }

export const TYPERT = {
  package: 'dsh-claude-theme',
  face: 'host',
  schemas: [],
  model: {
    services: [],
    events: [],
    objects: [],
  },
  invocations: [
    {
      id: 'dsh-claude-theme#claudeTheme/getConfig',
      service: 'claudeTheme',
      namespace: 'claudeTheme',
      method: 'getConfig',
      invocation: { kind: 'direct' },
      parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-claude-theme#Json', schema: TYPERT_JSON },
    },
    {
      id: 'dsh-claude-theme#claudeTheme/setEnabled',
      service: 'claudeTheme',
      namespace: 'claudeTheme',
      method: 'setEnabled',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'args', wire: 'args', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-claude-theme#Json', schema: TYPERT_JSON } }],
      result: { mode: 'strict', typeSymbol: 'dsh-claude-theme#Json', schema: TYPERT_JSON },
    },
    {
      id: 'dsh-claude-theme#claudeTheme/diagnostics',
      service: 'claudeTheme',
      namespace: 'claudeTheme',
      method: 'diagnostics',
      invocation: { kind: 'direct' },
      parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-claude-theme#Json', schema: TYPERT_JSON },
    },
  ],
  events: [],
  objects: [],
}

export default TYPERT
