/* Hand-written Remote contribution for dsh-claude-theme (plain-JS package, no
   Typert generator). Host SRC discovery resolves by method name; the static
   client mounts this contribution at runtime via ctx.remote.$mount(...).
   TYPERT_JSON is a passthrough schema (no zod dependency): parse returns the
   value unchanged, so every parameter/result crosses as raw JSON. */
const TYPERT_JSON = { _zod: {}, parse: (v) => v }

export const TYPERT_REMOTE = {
  package: 'dsh-claude-theme',
  descriptors: [
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
}

export default TYPERT_REMOTE
