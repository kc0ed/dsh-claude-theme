// ══════════════════════════════════════════════════════════════════
// dsh-claude-theme · Host 半体（静态固化版，2026-08）
// ──
// 类插件模式（官方带 Remote 的插件均 Service 子类 default export）：
// 提供 claudeTheme Remote 服务，三个方法（wire 名 = 方法名）：
//   getConfig()        → { enabled }
//   setEnabled(args)   → { enabled }，持久化 ~/.dsh/claude-theme.config.json
//   diagnostics()      → 存储目录/配置快照
// 客户端据此注入/移除主题 CSS（开关即时生效）。
// ══════════════════════════════════════════════════════════════════
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import { Service } from '@deepseek-ai/cordis'
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname } from 'node:path'

// ── Remote 装饰器的手工等效（同 dsh-bottom-bar，无装饰器语法） ──
function remoteMarks(methodName) {
  const initializers = []
  Remote(methodName)(null, {
    kind: 'method',
    name: methodName,
    static: false,
    private: false,
    addInitializer(fn) {
      initializers.push(fn)
    },
  })
  return initializers
}
const REMOTE_METHODS = ['getConfig', 'setEnabled', 'diagnostics']
const DEFAULT_CONFIG = { enabled: true }

class ClaudeThemeService extends TypertRemoteService {
  constructor(ctx, config) {
    super(ctx, 'claudeTheme')
    for (const name of REMOTE_METHODS) {
      for (const fn of remoteMarks(name)) fn.call(this)
    }
    this.officialStoreDir = null
    this.config = null
  }

  configPath() {
    return (this.officialStoreDir !== null ? this.officialStoreDir : '') + '/claude-theme.config.json'
  }

  async readJsonFile(path) {
    try {
      const info = await stat(path)
      if (info === undefined) return null
      const text = await readFile(path, 'utf8')
      return JSON.parse(text)
    } catch (err) { return null }
  }

  async writeJsonFile(path, value) {
    try {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, JSON.stringify(value, null, 2), 'utf8')
      return true
    } catch (err) {
      console.error('dsh-claude-theme: write failed', path, err)
      return false
    }
  }

  // 官方存储目录三源兜底：DSH_HOME 环境变量 → settings 文档目录 → ~/.dsh
  async resolveOfficialStoreDir() {
    if (typeof process !== 'undefined' && process.env && typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME.length > 0) {
      return process.env.DSH_HOME.replace(/[\\/]+$/, '')
    }
    try {
      const settingsSvc = this.ctx.get('settings')
      if (settingsSvc !== undefined) {
        const doc = await settingsSvc.prepareDocument()
        if (typeof doc === 'string' && doc.length > 0) {
          const dir = doc.replace(/[\\/][^\\/]*$/, '')
          if (dir.length > 0) return dir
        }
      }
    } catch (err) { /* ignore */ }
    try {
      return homedir() + '/.dsh'
    } catch (err) { return null }
  }

  async loadConfig() {
    if (this.config !== null) return
    this.config = { ...DEFAULT_CONFIG }
    const parsed = await this.readJsonFile(this.configPath())
    if (parsed !== null && typeof parsed === 'object') {
      if (typeof parsed.enabled === 'boolean') this.config.enabled = parsed.enabled
    }
  }

  async saveConfig() {
    if (this.officialStoreDir === null) return false
    return this.writeJsonFile(this.configPath(), {
      version: 1,
      updatedAt: new Date().toISOString(),
      enabled: this.config.enabled,
    })
  }

  // ── 生命周期 ──
  async [Service.init]() {
    this.officialStoreDir = await this.resolveOfficialStoreDir()
    await this.loadConfig()
  }

  // ── Remote 方法 ──
  async getConfig() {
    await this.loadConfig()
    return { enabled: this.config.enabled }
  }

  async setEnabled(args) {
    await this.loadConfig()
    const a = args === null || args === undefined ? {} : args
    if (typeof a.enabled === 'boolean') this.config.enabled = a.enabled
    await this.saveConfig()
    return { enabled: this.config.enabled }
  }

  async diagnostics() {
    return {
      officialStoreDir: this.officialStoreDir,
      config: this.config === null ? null : { ...this.config },
    }
  }
}

export default ClaudeThemeService
