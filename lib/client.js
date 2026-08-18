// ══════════════════════════════════════════════════════════════════
// dsh-claude-theme · Client 半体（静态固化版，2026-08）
// ──
// · 高可用设计：
//   - LocalStorage 同步秒级优先启动，热重载/刷新零延迟、绝不掉 CSS；
//   - 动态监听 ctx.on('theme/change') 确保浅/深色切换时 Token 叠层与 CSS 始终生效；
//   - style 标签置顶级联优先级（始终位于 head 尾部，确保样式永不被覆盖）；
// · Remote：apply 内 $mount TYPERT_REMOTE，
//   之后 ctx.get('remote.claudeTheme') + Proxy 解 {ok,value} 包装。
// · 设置页：通用设置 → 外观 下方一行「Claude 风格」（settings.general.item，
//   id claude-theme，order 15），开关即时生效并持久化（Host 写 ~/.dsh/claude-theme.config.json）。
// ══════════════════════════════════════════════════════════════════
window.__ModuleLoader__.load({
  id: 'dsh-claude-theme',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    let React = require('react')

    const LS_KEY = 'dsh-claude-theme:enabled'
    const getLocalEnabled = () => {
      try {
        const v = localStorage.getItem(LS_KEY)
        if (v !== null) return v === 'true'
      } catch (e) {}
      return true
    }
    const setLocalEnabled = (val) => {
      try { localStorage.setItem(LS_KEY, val ? 'true' : 'false') } catch (e) {}
    }

    // ── 幂等样式注入 + 尾部优先级置顶 ──
    function insertCss(css) {
      if (typeof document === 'undefined') return
      const tagId = 'dsh-claude-theme'
      let tag = document.querySelector('style[data-plugin-css="' + tagId + '"]')
      if (tag === null) {
        tag = document.createElement('style')
        tag.dataset.pluginCss = tagId
      }
      tag.textContent = css
      if (tag.parentNode !== document.head || document.head.lastElementChild !== tag) {
        document.head.appendChild(tag)
      }
    }
    function removeCss() {
      if (typeof document === 'undefined') return
      const tag = document.querySelector('style[data-plugin-css="dsh-claude-theme"]')
      if (tag !== null) tag.remove()
    }

    const inject = ['slots', 'remote', 'theme']

    async function apply(ctx) {
      // ── 主题 CSS（与 lib/theme.css 同步） ──
      const THEME_CSS = `/* dsh-claude-theme · 经典 Claude 暖纸与陶土美学（见 lib/theme.css） */
*:focus,
*:focus-visible,
button:focus,
button:focus-visible,
[role="button"]:focus,
[role="button"]:focus-visible,
[tabindex]:focus,
[tabindex]:focus-visible {
  outline: none !important;
}
button:focus-visible,
[role="button"]:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(193, 95, 60, 0.35) !important;
}
body[data-ds-dark-theme] button:focus-visible,
body[data-ds-dark-theme] [role="button"]:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(217, 119, 87, 0.4) !important;
}

:root{
  --dsw-font-family:"SF Pro Rounded","LXGWWenKaiScreenR","LXGW WenKai","PingFang SC","Microsoft YaHei",-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  --dsw-font-base-16-font-family:var(--dsw-font-family);
  --dsw-font-base-strong-16-font-family:var(--dsw-font-family);
  --dsw-font-s-14-font-family:var(--dsw-font-family);
  --dsw-font-s-strong-14-font-family:var(--dsw-font-family);
  --dsw-font-xs-13-font-family:var(--dsw-font-family);
  --dsw-font-xs-strong-13-font-family:var(--dsw-font-family);
  --dsw-font-xxs-12-font-family:var(--dsw-font-family);
  --dsw-font-xxs-strong-12-font-family:var(--dsw-font-family);
  --dsw-font-xxxs-11-font-family:var(--dsw-font-family);
  --dsw-font-xxxs-strong-11-font-family:var(--dsw-font-family);
  --dsw-font-m-18-font-family:var(--dsw-font-family);
  --dsw-font-l-20-font-family:var(--dsw-font-family);
  --dsw-font-xl-24-font-family:var(--dsw-font-family);
  --dsw-font-markdown-base-font-family:var(--dsw-font-family);
  --dsw-font-markdown-base-strong-font-family:var(--dsw-font-family);
  --dsw-font-markdown-base-italic-font-family:var(--dsw-font-family);
  --dsw-font-markdown-base-strong-italic-font-family:var(--dsw-font-family);
  --dsw-font-markdown-small-font-family:var(--dsw-font-family);
  --dsw-font-markdown-small-strong-font-family:var(--dsw-font-family);
  --dsw-font-markdown-small-italic-font-family:var(--dsw-font-family);
  --dsw-font-markdown-small-strong-italic-font-family:var(--dsw-font-family);
  --dsw-font-markdown-h1-font-family:var(--dsw-font-family);
  --dsw-font-markdown-h2-font-family:var(--dsw-font-family);
  --dsw-font-markdown-h3-font-family:var(--dsw-font-family);
  --dsw-font-markdown-h4-font-family:var(--dsw-font-family);
  --dsw-font-markdown-table-font-family:var(--dsw-font-family);
  --dsw-font-markdown-code-font-family:"SFMono-Regular","JetBrains Mono","Cascadia Code",Consolas,monospace;
  --dsw-font-markdown-code-block-font-family:var(--dsw-font-markdown-code-font-family);
  --dsw-font-markdown-code-block-small-font-family:var(--dsw-font-markdown-code-font-family);
}
body{
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}
:root, body{
  --dsw-alias-bg-base:#FAF8F4 !important;
  --dsw-alias-bg-layer-1:#F2EDE3 !important;
  --dsw-alias-bg-layer-2:#FCFBF9 !important;
  --dsw-alias-bg-layer-3:#F5F1E8 !important;
  --dsw-alias-bg-module-platform:#F5F1E8 !important;
  --dsw-alias-bg-overlay:rgba(44,39,32,.08) !important;
  --dsw-alias-bg-mask-1:rgba(35,30,22,.48) !important;
  --dsw-alias-bg-skeleton:rgba(55,48,35,.07) !important;
  --dsw-alias-border-l1:#E8E2D5 !important;
  --dsw-alias-border-l2:#DCD5C6 !important;
  --dsw-alias-border-l3:#CEC5B3 !important;
  --dsw-alias-border-l4:#BEB39E !important;
  --dsw-alias-brand-primary:#C15F3C !important;
  --dsw-alias-brand-primary-hover:#B05432 !important;
  --dsw-alias-brand-primary-invert:#FFFFFF !important;
  --dsw-alias-brand-text:#FFFFFF !important;
  --dsw-alias-button-primary-fill:#C15F3C !important;
  --dsw-alias-button-primary-hover:#B05432 !important;
  --dsw-alias-button-primary-dimmed:rgba(193,95,60,.14) !important;
  --dsw-alias-button-info-fill:#C15F3C !important;
  --dsw-alias-button-info-hover:#B05432 !important;
  --dsw-alias-button-contrast-fill:#C15F3C !important;
  --dsw-alias-button-elevated-fill:#FFFFFF !important;
  --dsw-alias-button-floating-fill:#FFFFFF !important;
  --dsw-alias-button-floating-hover:#F4EFE5 !important;
  --dsw-alias-label-primary:#2C2720 !important;
  --dsw-alias-label-secondary:#666052 !important;
  --dsw-alias-label-tertiary:#8E8675 !important;
  --dsw-alias-label-dimmed:#A69E8D !important;
  --dsw-alias-label-caption:#8E8675 !important;
  --dsw-alias-state-business-primary:#B05432 !important;
  --dsw-alias-state-business-tertiary:rgba(193,95,60,.12) !important;
  --dsw-alias-interactive-bg-hover:rgba(44,39,32,.05) !important;
  --dsw-alias-interactive-bg-active:rgba(44,39,32,.09) !important;
  --dsw-alias-interactive-bg-hover-accent:rgba(193,95,60,.09) !important;
  --dsw-alias-tooltip-bg:#26221B !important;
  --dsw-alias-toast-bg:#26221B !important;
  --dsw-alias-markdown-inline-code:rgba(193,95,60,.09) !important;
  --dsw-alias-markdown-code-block:#F2EDE3 !important;
  --dsw-alias-markdown-code-block-banner:#E8E2D5 !important;
  --dsw-alias-markdown-code-segment-unselected:rgba(44,39,32,.05) !important;
  --dsw-alias-markdown-code-segment-selected:rgba(193,95,60,.14) !important;
  --dsw-alias-markdown-placeholder:#A69E8D !important;
  --dsw-alias-scrollbar-bg-l1:rgba(44,39,32,.14) !important;
  --dsw-alias-scrollbar-hover-l1:rgba(44,39,32,.3) !important;
  --dsw-specific-sidebar-fill:#F2EDE3 !important;
  --dsw-specific-sidebar-nav-item-hover:rgba(44,39,32,.06) !important;
  --dsw-specific-sidebar-nav-item-active:rgba(193,95,60,.14) !important;
  --dsw-specific-sidebar-nav-item-active-accent:#C15F3C;
  --dsw-specific-bubble:#FFFFFF !important;
  --dsw-specific-bubble-highlight:#F7F3EB !important;
  --dsw-specific-input-major:#FFFFFF !important;
  --dsw-specific-menu:#FFFFFF !important;
  --dsw-specific-selector:#F5F1E8 !important;
  --dsw-specific-tip:#FFFFFF !important;
  --dsw-specific-login-input:#FFFFFF !important;

  --dsw-static-deepseek-500:#C15F3C !important;
  --dsw-static-deepseek-450:#C15F3C !important;
  --dsw-static-deepseek-400:#D2724F !important;
  --dsw-static-deepseek-200:#F3B298 !important;
  --dsw-static-neutral-bluish-500:#2C2720 !important;
  --dsw-static-neutral-bluish-400:#C15F3C !important;
  --dsw-static-neutral-bluish-200:#E8E2D5 !important;
}
body[data-ds-dark-theme]{
  --dsw-alias-bg-base:#181816 !important;
  --dsw-alias-bg-layer-1:#1C1B18 !important;
  --dsw-alias-bg-layer-2:#242320 !important;
  --dsw-alias-bg-layer-3:#292824 !important;
  --dsw-alias-bg-module-platform:#201F1C !important;
  --dsw-alias-bg-overlay:rgba(255,255,255,.07) !important;
  --dsw-alias-bg-mask-1:rgba(0,0,0,.75) !important;
  --dsw-alias-bg-skeleton:rgba(255,255,255,.05) !important;
  --dsw-alias-border-l1:#2B2A26 !important;
  --dsw-alias-border-l2:#383731 !important;
  --dsw-alias-border-l3:#48463F !important;
  --dsw-alias-border-l4:#5A584F !important;
  --dsw-alias-brand-primary:#D97757 !important;
  --dsw-alias-brand-primary-hover:#E08563 !important;
  --dsw-alias-brand-primary-invert:#181816 !important;
  --dsw-alias-brand-text:#FFFFFF !important;
  --dsw-alias-button-primary-fill:#D97757 !important;
  --dsw-alias-button-primary-hover:#E08563 !important;
  --dsw-alias-button-primary-dimmed:rgba(217,119,87,.16) !important;
  --dsw-alias-button-info-fill:#D97757 !important;
  --dsw-alias-button-info-hover:#E08563 !important;
  --dsw-alias-button-contrast-fill:#D97757 !important;
  --dsw-alias-button-elevated-fill:#242320 !important;
  --dsw-alias-button-floating-fill:#292824 !important;
  --dsw-alias-button-floating-hover:#33312B !important;
  --dsw-alias-label-primary:#ECE7DF !important;
  --dsw-alias-label-secondary:#B0AAA0 !important;
  --dsw-alias-label-tertiary:#827C72 !important;
  --dsw-alias-label-dimmed:#635E56 !important;
  --dsw-alias-label-caption:#827C72 !important;
  --dsw-alias-state-business-primary:#E08563 !important;
  --dsw-alias-state-business-tertiary:rgba(217,119,87,.18) !important;
  --dsw-alias-interactive-bg-hover:rgba(255,255,255,.06) !important;
  --dsw-alias-interactive-bg-active:rgba(255,255,255,.10) !important;
  --dsw-alias-interactive-bg-hover-accent:rgba(217,119,87,.14) !important;
  --dsw-alias-tooltip-bg:#242320 !important;
  --dsw-alias-toast-bg:#242320 !important;

  --dsw-alias-markdown-code-block:#131312 !important;
  --dsw-alias-markdown-code-block-banner:#1A1917 !important;
  --dsw-alias-markdown-inline-code:rgba(255,255,255,.08) !important;
  --dsw-alias-markdown-code-segment-unselected:rgba(255,255,255,.06) !important;
  --dsw-alias-markdown-code-segment-selected:rgba(217,119,87,.20) !important;
  --dsw-alias-markdown-placeholder:#635E56 !important;
  --dsw-alias-scrollbar-bg-l1:rgba(255,255,255,.12) !important;
  --dsw-alias-scrollbar-hover-l1:rgba(255,255,255,.24) !important;
  --dsw-specific-sidebar-fill:#1A1917 !important;
  --dsw-specific-sidebar-nav-item-hover:rgba(255,255,255,.06) !important;
  --dsw-specific-sidebar-nav-item-active:rgba(217,119,87,.18) !important;
  --dsw-specific-sidebar-nav-item-active-accent:#D97757;
  --dsw-specific-bubble:#22211E !important;
  --dsw-specific-bubble-highlight:#1C1B18 !important;
  --dsw-specific-input-major:#201F1C !important;
  --dsw-specific-menu:#242320 !important;
  --dsw-specific-selector:#242320 !important;
  --dsw-specific-tip:#242320 !important;
  --dsw-specific-login-input:#201F1C !important;

  --dsw-static-deepseek-500:#D97757 !important;
  --dsw-static-deepseek-450:#D97757 !important;
  --dsw-static-deepseek-400:#E2886A !important;
  --dsw-static-deepseek-200:#F7C0AC !important;
  --dsw-static-neutral-bluish-500:#ECE7DF !important;
  --dsw-static-neutral-bluish-400:#D97757 !important;
  --dsw-static-neutral-bluish-200:#2B2A26 !important;
}

body[data-ds-dark-theme] pre,
body[data-ds-dark-theme] [class*="codeBlock"],
body[data-ds-dark-theme] [class*="_payload_"],
body[data-ds-dark-theme] [class*="payload"] {
  background-color: #131312 !important;
  border: 1px solid #282723 !important;
  color: #ECE7DF !important;
}
body[data-ds-dark-theme] pre code {
  background-color: transparent !important;
  color: #EDEAE3 !important;
}
body[data-ds-dark-theme] code:not(pre code) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #E6E1D8 !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  padding: 2px 5px !important;
  border-radius: 5px !important;
}

.Md3f7G_turnStatus {
  background: linear-gradient(
    90deg,
    #C15F3C 0%,
    #C15F3C 38%,
    #EAA38B 50%,
    #C15F3C 62%,
    #C15F3C 100%
  ) !important;
  -webkit-text-fill-color: transparent !important;
  background-position: 100% 0 !important;
  background-size: 250% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
}
.Md3f7G_turnStatusClock {
  color: var(--dsw-alias-label-tertiary) !important;
  -webkit-text-fill-color: var(--dsw-alias-label-tertiary) !important;
}
body[data-ds-dark-theme] .Md3f7G_turnStatus {
  background: linear-gradient(
    90deg,
    #D97757 0%,
    #D97757 38%,
    #F6BBA6 50%,
    #D97757 62%,
    #D97757 100%
  ) !important;
  -webkit-text-fill-color: transparent !important;
  background-position: 100% 0 !important;
  background-size: 250% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
}
body[data-ds-dark-theme] .Md3f7G_turnStatusClock {
  color: #827C72 !important;
  -webkit-text-fill-color: #827C72 !important;
}

.VOzbGW_panel {
  background: var(--dsw-alias-bg-layer-2) !important;
  border: 1px solid var(--dsw-alias-border-l1) !important;
  border-radius: 20px !important;
  box-shadow: 0 24px 60px rgba(35, 30, 20, 0.18), 0 4px 16px rgba(35, 30, 20, 0.08) !important;
  overflow: hidden !important;
}
body[data-ds-dark-theme] .VOzbGW_panel {
  background: #1E1D1A !important;
  border-color: #2B2A26 !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}
.VOzbGW_nav {
  background: var(--dsw-alias-bg-layer-1) !important;
  border-right: 1px solid var(--dsw-alias-border-l1) !important;
  padding: 24px 12px !important;
}
body[data-ds-dark-theme] .VOzbGW_nav {
  background: #181715 !important;
  border-color: #2B2A26 !important;
}
.VOzbGW_navTitle {
  color: var(--dsw-alias-label-primary) !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  margin-bottom: 6px !important;
}
.VOzbGW_navCell {
  border-radius: 10px !important;
  color: var(--dsw-alias-label-secondary) !important;
  font-size: 13.5px !important;
  font-weight: 500 !important;
  padding: 8px 12px !important;
  margin: 1px 0 !important;
  transition: all 0.12s ease !important;
}
.VOzbGW_navCell:hover {
  background: var(--dsw-alias-interactive-bg-hover) !important;
  color: var(--dsw-alias-label-primary) !important;
}
.VOzbGW_navCell.VOzbGW_active,
.VOzbGW_navCell[aria-current="true"] {
  background: rgba(193, 95, 60, 0.12) !important;
  color: var(--dsw-alias-brand-primary) !important;
  font-weight: 600 !important;
}
.VOzbGW_navCell.VOzbGW_active *,
.VOzbGW_navCell[aria-current="true"] * {
  color: var(--dsw-alias-brand-primary) !important;
}
.VOzbGW_navCell.VOzbGW_active svg,
.VOzbGW_navCell[aria-current="true"] svg {
  color: var(--dsw-alias-brand-primary) !important;
  fill: currentColor !important;
}
body[data-ds-dark-theme] .VOzbGW_navCell.VOzbGW_active,
body[data-ds-dark-theme] .VOzbGW_navCell[aria-current="true"] {
  background: rgba(217, 119, 87, 0.18) !important;
  color: #D97757 !important;
}
body[data-ds-dark-theme] .VOzbGW_navCell.VOzbGW_active *,
body[data-ds-dark-theme] .VOzbGW_navCell[aria-current="true"] * {
  color: #D97757 !important;
}
body[data-ds-dark-theme] .VOzbGW_navCell.VOzbGW_active svg,
body[data-ds-dark-theme] .VOzbGW_navCell[aria-current="true"] svg {
  color: #D97757 !important;
  fill: currentColor !important;
}

.VOzbGW_content {
  background: var(--dsw-alias-bg-layer-2) !important;
}
body[data-ds-dark-theme] .VOzbGW_content {
  background: #1E1D1A !important;
}
.VOzbGW_header {
  border-bottom: 1px solid var(--dsw-alias-border-l1) !important;
  padding: 16px 24px !important;
  height: 58px !important;
}
.VOzbGW_options {
  padding: 8px 28px 28px !important;
}

/* 顶部操作按钮（如：打开配置文件） */
[class*="_button_kz6gm"],
[class*="_outline_kz6gm"] {
  border: 1px solid var(--dsw-alias-border-l2) !important;
  background: var(--dsw-alias-bg-module-platform) !important;
  color: var(--dsw-alias-label-secondary) !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  transition: all 0.15s ease !important;
}
[class*="_button_kz6gm"]:hover {
  background: var(--dsw-alias-button-floating-hover) !important;
  border-color: var(--dsw-alias-border-l3) !important;
  color: var(--dsw-alias-label-primary) !important;
}

/* 通用设置页（General Settings） */
._WvWnq_section > [data-slot="settings.general.item"] > * {
  border-bottom: 1px solid var(--dsw-alias-border-l1) !important;
  padding: 16px 0 !important;
}
._5QVD0a_row, .oY77xG_row, .hVGvvW_row, .T1PP_q_row {
  border-bottom: 1px solid var(--dsw-alias-border-l1) !important;
  padding: 16px 0 !important;
}
._5QVD0a_title, .oY77xG_title, .hVGvvW_title, .T1PP_q_title, ._8HJdBW_title {
  color: var(--dsw-alias-label-primary) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 20px !important;
}
._5QVD0a_desc, .oY77xG_desc, .hVGvvW_desc, .T1PP_q_desc {
  color: var(--dsw-alias-label-tertiary) !important;
  font-size: 12.5px !important;
  line-height: 18px !important;
  margin-top: 3px !important;
}

/* 外观主题切换大块（浅色 / 深色 / 跟随系统）── 严格单行平铺，绝不折行 */
._8HJdBW_group {
  border-bottom: 1px solid var(--dsw-alias-border-l1) !important;
  padding: 18px 0 !important;
}
._8HJdBW_cubeRow {
  display: flex !important;
  flex-wrap: nowrap !important;
  gap: 10px !important;
  margin-top: 10px !important;
  width: 100% !important;
}
._8HJdBW_themeCube {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  background: var(--dsw-alias-bg-module-platform) !important;
  border: 1.5px solid var(--dsw-alias-border-l1) !important;
  border-radius: 14px !important;
  color: var(--dsw-alias-label-secondary) !important;
  padding: 14px 8px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  gap: 6px !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 1px 3px rgba(35, 30, 20, 0.03) !important;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
._8HJdBW_themeCube:hover:not(._8HJdBW_selected) {
  background: var(--dsw-alias-button-floating-hover) !important;
  border-color: var(--dsw-alias-border-l2) !important;
  color: var(--dsw-alias-label-primary) !important;
}
._8HJdBW_selected {
  background: #FFFFFF !important;
  border-color: var(--dsw-alias-brand-primary) !important;
  color: var(--dsw-alias-brand-primary) !important;
  box-shadow: 0 4px 14px rgba(193, 95, 60, 0.18), 0 0 0 1px var(--dsw-alias-brand-primary) !important;
  font-weight: 600 !important;
}
body[data-ds-dark-theme] ._8HJdBW_selected {
  background: #2D2C27 !important;
  box-shadow: 0 4px 14px rgba(217, 119, 87, 0.25), 0 0 0 1px var(--dsw-alias-brand-primary) !important;
}

/* 模型设置页（Models Settings）层级分明高定版 */
.zGbnIq_title {
  color: var(--dsw-alias-label-primary) !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}
.zGbnIq_intro {
  color: var(--dsw-alias-label-tertiary) !important;
  font-size: 13px !important;
}
.zGbnIq_rows {
  gap: 8px !important;
  margin: 12px 0 0 !important;
  padding: 0 !important;
  list-style: none !important;
  display: flex !important;
  flex-direction: column !important;
}

/* 模型外层卡片：温润暖纸底色（#F5F1E8 / 深色 #201F1C） */
.zGbnIq_rowCard {
  background: var(--dsw-alias-bg-module-platform) !important;
  border: 1px solid var(--dsw-alias-border-l1) !important;
  border-radius: 14px !important;
  padding: 12px 16px !important;
  box-shadow: 0 1px 3px rgba(35, 30, 20, 0.03) !important;
  transition: all 0.15s ease !important;
}
.zGbnIq_rowCard:hover {
  border-color: var(--dsw-alias-border-l2) !important;
  background: var(--dsw-alias-button-floating-hover) !important;
}
body[data-ds-dark-theme] .zGbnIq_rowCard {
  background: #1E1D1A !important;
  border-color: #2B2A26 !important;
}
.zGbnIq_rowName {
  color: var(--dsw-alias-label-primary) !important;
  font-size: 14.5px !important;
  font-weight: 600 !important;
}

/* 点开后的编辑面板：纯净高阶白底（#FFFFFF / 深色 #252420），不发黄不浑浊 */
.zGbnIq_editor,
.zGbnIq_addCard,
.zGbnIq_setupCard {
  background: #FFFFFF !important;
  border: 1px solid var(--dsw-alias-border-l1) !important;
  border-radius: 12px !important;
  padding: 16px 18px !important;
  margin-top: 10px !important;
  box-shadow: 0 4px 14px rgba(35, 30, 20, 0.06) !important;
}
body[data-ds-dark-theme] .zGbnIq_editor,
body[data-ds-dark-theme] .zGbnIq_addCard,
body[data-ds-dark-theme] .zGbnIq_setupCard {
  background: #252420 !important;
  border-color: #383731 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
}

/* 输入框：清晰整洁 */
.zGbnIq_input {
  background: var(--dsw-alias-bg-module-platform) !important;
  border: 1px solid var(--dsw-alias-border-l2) !important;
  border-radius: 8px !important;
  color: var(--dsw-alias-label-primary) !important;
  height: 34px !important;
  padding: 0 12px !important;
  font-size: 13px !important;
  transition: all 0.15s ease !important;
}
.zGbnIq_input:focus-visible,
.zGbnIq_input:focus {
  border-color: var(--dsw-alias-brand-primary) !important;
  box-shadow: 0 0 0 3px rgba(193, 95, 60, 0.15) !important;
  outline: none !important;
}
body[data-ds-dark-theme] .zGbnIq_input {
  background: #181816 !important;
  border-color: #383731 !important;
}

.zGbnIq_secondaryButton {
  background: var(--dsw-alias-bg-module-platform) !important;
  border: 1px solid var(--dsw-alias-border-l2) !important;
  border-radius: 8px !important;
  color: var(--dsw-alias-label-secondary) !important;
  height: 28px !important;
  padding: 0 12px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  transition: all 0.15s ease !important;
}
.zGbnIq_secondaryButton:hover:not(:disabled) {
  background: var(--dsw-alias-button-floating-hover) !important;
  color: var(--dsw-alias-label-primary) !important;
}
.zGbnIq_primaryButton {
  background: var(--dsw-alias-brand-primary) !important;
  border: none !important;
  color: #FFFFFF !important;
  border-radius: 8px !important;
  height: 28px !important;
  padding: 0 14px !important;
  font-size: 12.5px !important;
  font-weight: 500 !important;
  box-shadow: 0 1px 3px rgba(193, 95, 60, 0.28) !important;
  transition: all 0.15s ease !important;
}
.zGbnIq_primaryButton:hover:not(:disabled) {
  background: var(--dsw-alias-brand-primary-hover) !important;
  box-shadow: 0 2px 6px rgba(193, 95, 60, 0.38) !important;
}
.zGbnIq_dangerButton {
  background: rgba(220, 53, 69, 0.06) !important;
  border: 1px solid rgba(220, 53, 69, 0.2) !important;
  border-radius: 8px !important;
  color: #DC3545 !important;
  height: 28px !important;
  padding: 0 12px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  transition: all 0.15s ease !important;
}
.zGbnIq_dangerButton:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.12) !important;
}
.zGbnIq_addButton {
  border: 1.5px dashed var(--dsw-alias-border-l2) !important;
  background: var(--dsw-alias-bg-module-platform) !important;
  border-radius: 12px !important;
  color: var(--dsw-alias-label-secondary) !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  height: 44px !important;
  transition: all 0.15s ease !important;
}
.zGbnIq_addButton:hover:not(:disabled) {
  border-color: var(--dsw-alias-brand-primary) !important;
  color: var(--dsw-alias-brand-primary) !important;
  background: rgba(193, 95, 60, 0.04) !important;
}

/* ══════════════════════════════════════════════════════════════════
   智能体预设页（Agent Presets）精准定制
   ══════════════════════════════════════════════════════════════════ */
.rtSEdW_title {
  color: var(--dsw-alias-label-primary) !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}
.rtSEdW_intro {
  color: var(--dsw-alias-label-tertiary) !important;
  font-size: 13px !important;
}
.rtSEdW_card {
  background: var(--dsw-alias-bg-module-platform) !important;
  border: 1px solid var(--dsw-alias-border-l1) !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(35, 30, 20, 0.03) !important;
  transition: all 0.16s ease !important;
}
.rtSEdW_card:hover:not(.rtSEdW_cardActive) {
  border-color: var(--dsw-alias-border-l2) !important;
  background: var(--dsw-alias-button-floating-hover) !important;
  box-shadow: 0 2px 6px rgba(35, 30, 20, 0.06) !important;
}
.rtSEdW_cardActive {
  background: #FFFFFF !important;
  border-color: var(--dsw-alias-brand-primary) !important;
  box-shadow: 0 0 0 1.5px var(--dsw-alias-brand-primary), 0 4px 14px rgba(193, 95, 60, 0.12) !important;
}
body[data-ds-dark-theme] .rtSEdW_card {
  background: #1E1D1A !important;
  border-color: #2B2A26 !important;
}
body[data-ds-dark-theme] .rtSEdW_cardActive {
  background: #252420 !important;
  border-color: var(--dsw-alias-brand-primary) !important;
}
.rtSEdW_inUse {
  background: var(--dsw-alias-brand-primary) !important;
  color: #FFFFFF !important;
}
.rtSEdW_creatorButton {
  background: var(--dsw-alias-bg-module-platform) !important;
  border: 1.5px dashed var(--dsw-alias-border-l2) !important;
  border-radius: 12px !important;
  color: var(--dsw-alias-label-secondary) !important;
  font-weight: 500 !important;
}
.rtSEdW_creatorButton:hover:not(:disabled) {
  border-color: var(--dsw-alias-brand-primary) !important;
  color: var(--dsw-alias-brand-primary) !important;
  background: rgba(193, 95, 60, 0.04) !important;
}

/* ══════════════════════════════════════════════════════════════════
   插件配置页面（Plugins Settings）
   ══════════════════════════════════════════════════════════════════ */
.pbvGtq_heading {
  color: var(--dsw-alias-label-primary) !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}
.pbvGtq_intro {
  color: var(--dsw-alias-label-tertiary) !important;
  font-size: 13px !important;
}
.pbvGtq_tabs {
  border-bottom: 1px solid var(--dsw-alias-border-l1) !important;
  gap: 24px !important;
  margin-top: 6px !important;
  margin-bottom: 14px !important;
}
.pbvGtq_tab {
  color: var(--dsw-alias-label-tertiary) !important;
  font-weight: 500 !important;
  font-size: 13.5px !important;
  padding: 8px 2px 10px !important;
  transition: all 0.12s ease !important;
}
.pbvGtq_tab:hover {
  color: var(--dsw-alias-label-primary) !important;
}
.pbvGtq_tab[data-active="true"],
.pbvGtq_tab[aria-selected="true"] {
  color: var(--dsw-alias-brand-primary) !important;
  font-weight: 600 !important;
}
.pbvGtq_tab[data-active="true"]:after,
.pbvGtq_tab:focus-visible:after {
  background: var(--dsw-alias-brand-primary) !important;
  height: 2.5px !important;
  border-radius: 2px !important;
}
.pbvGtq_cards {
  gap: 10px !important;
}
.YyYd_a_card,
.qSYn7G_card {
  background: var(--dsw-alias-bg-module-platform) !important;
  border: 1px solid var(--dsw-alias-border-l1) !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(35, 30, 20, 0.03) !important;
  transition: all 0.16s ease !important;
  overflow: hidden !important;
}
.YyYd_a_card:hover,
.qSYn7G_card:hover {
  border-color: var(--dsw-alias-border-l2) !important;
  background: var(--dsw-alias-button-floating-hover) !important;
  box-shadow: 0 2px 6px rgba(35, 30, 20, 0.06) !important;
}
.YyYd_a_card.YyYd_a_cardOpen,
.qSYn7G_card[data-open="true"] {
  background: #FFFFFF !important;
  border-color: var(--dsw-alias-border-l2) !important;
  box-shadow: 0 4px 16px rgba(35, 30, 20, 0.08) !important;
}
body[data-ds-dark-theme] .YyYd_a_card,
body[data-ds-dark-theme] .qSYn7G_card {
  background: #1E1D1A !important;
  border-color: #2B2A26 !important;
}
body[data-ds-dark-theme] .YyYd_a_card.YyYd_a_cardOpen,
body[data-ds-dark-theme] .qSYn7G_card[data-open="true"] {
  background: #252420 !important;
  border-color: #383731 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
}
.YyYd_a_header {
  padding: 13px 16px !important;
}
.YyYd_a_name,
.qSYn7G_cardTitle {
  color: var(--dsw-alias-label-primary) !important;
  font-size: 14.5px !important;
  font-weight: 600 !important;
}
.YyYd_a_description,
.qSYn7G_status {
  color: var(--dsw-alias-label-tertiary) !important;
  font-size: 12.5px !important;
  margin-top: 1px !important;
}
.YyYd_a_chevron,
.qSYn7G_chevron {
  color: var(--dsw-alias-label-tertiary) !important;
}
.YyYd_a_body,
.qSYn7G_cardDetails {
  border-top: 1px solid var(--dsw-alias-border-l1) !important;
  background: transparent !important;
  padding: 8px 16px 14px !important;
  margin: 0 !important;
}
.At1oFq_field {
  padding: 10px 0 !important;
}
.At1oFq_field + .At1oFq_field {
  border-top: 1px dashed var(--dsw-alias-border-l1) !important;
}
.At1oFq_label {
  color: var(--dsw-alias-label-primary) !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}
.At1oFq_hint {
  color: var(--dsw-alias-label-tertiary) !important;
  font-size: 12px !important;
  margin-top: 4px !important;
}
.At1oFq_input,
.qSYn7G_search input {
  background: var(--dsw-alias-bg-module-platform) !important;
  border: 1px solid var(--dsw-alias-border-l2) !important;
  border-radius: 8px !important;
  color: var(--dsw-alias-label-primary) !important;
  height: 34px !important;
  padding: 0 12px !important;
  font-size: 13px !important;
  transition: all 0.15s ease !important;
}
.qSYn7G_search input {
  padding: 0 34px 0 36px !important;
}
.At1oFq_input:focus-visible,
.qSYn7G_search input:focus-visible {
  border-color: var(--dsw-alias-brand-primary) !important;
  box-shadow: 0 0 0 3px rgba(193, 95, 60, 0.15) !important;
  outline: none !important;
}
.YyYd_a_footer {
  border-top: 1px solid var(--dsw-alias-border-l1) !important;
  padding-top: 12px !important;
  gap: 8px !important;
}
.YyYd_a_discard {
  background: transparent !important;
  border: 1px solid var(--dsw-alias-border-l2) !important;
  color: var(--dsw-alias-label-secondary) !important;
  border-radius: 8px !important;
  padding: 5px 14px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  transition: all 0.15s ease !important;
}
.YyYd_a_discard:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover) !important;
  color: var(--dsw-alias-label-primary) !important;
}
.YyYd_a_save {
  background: var(--dsw-alias-brand-primary) !important;
  border: none !important;
  color: #FFFFFF !important;
  border-radius: 8px !important;
  padding: 5px 16px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  box-shadow: 0 1px 3px rgba(193, 95, 60, 0.28) !important;
  transition: all 0.15s ease !important;
}
.YyYd_a_save:hover:not(:disabled) {
  background: var(--dsw-alias-brand-primary-hover) !important;
  box-shadow: 0 2px 6px rgba(193, 95, 60, 0.38) !important;
}
.YyYd_a_save:disabled {
  opacity: 0.45 !important;
  box-shadow: none !important;
}

/* 药丸选择器 & 下拉菜单浮层（全局） */
.hVGvvW_selector,
._5QVD0a_selector,
.oY77xG_selector,
.T1PP_q_selector,
button[aria-haspopup="menu"] {
  background: var(--dsw-specific-selector) !important;
  color: var(--dsw-alias-label-primary) !important;
  border: 1px solid var(--dsw-alias-border-l2) !important;
  border-radius: 9px !important;
  padding: 0 12px !important;
  height: 32px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  box-shadow: 0 1px 2px rgba(35, 30, 20, 0.05) !important;
  transition: all 0.15s ease !important;
}
.hVGvvW_selector:hover,
._5QVD0a_selector:hover,
.oY77xG_selector:hover,
.T1PP_q_selector:hover,
button[aria-haspopup="menu"]:hover {
  background: var(--dsw-alias-button-floating-hover) !important;
  border-color: var(--dsw-alias-border-l3) !important;
  box-shadow: 0 2px 5px rgba(35, 30, 20, 0.08) !important;
}
.hVGvvW_selector:focus-visible,
._5QVD0a_selector:focus-visible,
.oY77xG_selector:focus-visible,
.T1PP_q_selector:focus-visible,
button[aria-haspopup="menu"]:focus-visible {
  outline: none !important;
  border-color: var(--dsw-alias-brand-primary) !important;
  box-shadow: 0 0 0 3px rgba(193, 95, 60, 0.16) !important;
}
[role="menu"],
[class*="_list_19372"] {
  background: #FFFFFF !important;
  border: 1px solid var(--dsw-alias-border-l1) !important;
  border-radius: 12px !important;
  box-shadow: 0 14px 36px rgba(35, 30, 20, 0.16), 0 2px 8px rgba(35, 30, 20, 0.06) !important;
  padding: 5px !important;
  overflow: hidden !important;
}
body[data-ds-dark-theme] [role="menu"],
body[data-ds-dark-theme] [class*="_list_19372"] {
  background: #242320 !important;
  border-color: #383731 !important;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}
[role="menuitem"],
[class*="_item_19372"] {
  border-radius: 7px !important;
  color: var(--dsw-alias-label-primary) !important;
  padding: 7px 12px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  margin: 1px 0 !important;
  transition: all 0.12s ease !important;
}
[role="menuitem"]:hover,
[class*="_item_19372"]:hover {
  background: rgba(193, 95, 60, 0.1) !important;
  color: var(--dsw-alias-brand-primary) !important;
}
body[data-ds-dark-theme] [role="menuitem"]:hover,
body[data-ds-dark-theme] [class*="_item_19372"]:hover {
  background: rgba(217, 119, 87, 0.16) !important;
  color: var(--dsw-alias-brand-primary) !important;
}

/* 侧边栏与主区域层级分明 */
[class*="SidebarRoot_root"],
[class*="hHd-Xa_root"] {
  border-right: 1px solid var(--dsw-alias-border-l1) !important;
}
[class*="ConversationRoot_root"],
[class*="wSkVaW_root"] {
  background: var(--dsw-alias-bg-base) !important;
}

/* Claude 细节美学增强 */
::selection{
  background:rgba(193,95,60,.22) !important;
  color:inherit !important;
}
body[data-ds-dark-theme] ::selection{
  background:rgba(217,119,87,.28) !important;
  color:inherit !important;
}
input:focus-visible, textarea:focus-visible, [contenteditable="true"]:focus-visible{
  outline:none !important;
  border-color:rgba(193,95,60,.5) !important;
  box-shadow:0 0 0 3px rgba(193,95,60,.15) !important;
}
body[data-ds-dark-theme] input:focus-visible,
body[data-ds-dark-theme] textarea:focus-visible,
body[data-ds-dark-theme] [contenteditable="true"]:focus-visible{
  border-color:rgba(217,119,87,.5) !important;
  box-shadow:0 0 0 3px rgba(217,119,87,.18) !important;
}
blockquote{
  border-left:3px solid var(--dsw-alias-brand-primary) !important;
  background:rgba(193,95,60,.05) !important;
  border-radius:0 8px 8px 0 !important;
  padding:6px 14px !important;
  margin:8px 0 !important;
}
body[data-ds-dark-theme] blockquote{
  background:rgba(217,119,87,.07) !important;
}
::-webkit-scrollbar{
  width:6px !important;
  height:6px !important;
}
::-webkit-scrollbar-thumb{
  border-radius:4px !important;
}

/* cordis 插件面板 */
:root {
  --panel-bottom: 112px;
}
[data-cordis-panel] {
  bottom: var(--panel-bottom) !important;
  overflow: visible !important;
  max-height: 52vh !important;
  box-shadow: none !important;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.14)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06));
  clip-path: polygon(
    0 16px, 4px 12px, 8px 8px, 12px 4px, 16px 0,
    calc(100% - 16px) 0,
    calc(100% - 12px) 4px, calc(100% - 8px) 8px, calc(100% - 4px) 12px, 100% 16px,
    100% 100%,
    38px 100%,
    31px calc(100% + 10px),
    24px 100%, 0 100%
  );
}
body[data-ds-dark-theme] [data-cordis-panel] {
  filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.6)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}
[data-cordis-panel] > div {
  overflow-y: auto !important;
  padding: 4px 14px 12px !important;
}
[data-cordis-panel] > header {
  position: relative;
  border-radius: 16px 16px 0 0;
  min-height: 38px !important;
  padding: 6px 14px !important;
}
[data-cordis-panel] > header,
[data-cordis-panel] > div {
  position: relative;
  z-index: 2;
}
[data-cordis-panel]::before,
[data-cordis-panel]::after {
  display: none !important;
}
body:has([data-cordis-panel]) [data-cordis-badge] {
  color: var(--dsw-alias-brand-primary) !important;
  background-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 15%, transparent) !important;
}
[data-cordis-badge] {
  height: 34px !important;
  min-height: 34px !important;
  transition:
    transform 90ms ease,
    box-shadow 200ms ease,
    background-color 200ms ease,
    color 150ms ease !important;
  will-change: auto !important;
}
[data-cordis-badge]:hover {
  transform: none !important;
  box-shadow:
    0 8px 24px -8px rgba(0, 0, 0, 0.28),
    0 2px 8px -2px rgba(0, 0, 0, 0.12) !important;
  background-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, transparent) !important;
}
body[data-ds-dark-theme] [data-cordis-badge]:hover {
  box-shadow:
    0 8px 24px -8px rgba(0, 0, 0, 0.65),
    0 2px 8px -2px rgba(0, 0, 0, 0.3) !important;
}
[data-cordis-badge]:active:not(:disabled) {
  transform: translateY(2px) scale(0.99) !important;
  box-shadow:
    inset 0 3px 6px rgba(0, 0, 0, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08) !important;
}
body[data-ds-dark-theme] [data-cordis-badge]:active:not(:disabled) {
  box-shadow:
    inset 0 3px 6px rgba(0, 0, 0, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.06) !important;
}
[data-cordis-panel] ul {
  gap: 3px !important;
}
[data-cordis-panel] h3 {
  margin: 7px 0 3px !important;
  font-size: 10px !important;
  letter-spacing: 0.07em !important;
}
[data-cordis-row] {
  min-height: 28px !important;
}
[data-cordis-panel] [class*="title"],
[data-cordis-panel] [class*="name"],
[data-cordis-panel] [class*="purpose"] {
  line-height: 22px !important;
  font-size: 13px !important;
}
[data-cordis-panel] [class*="status"],
[data-cordis-panel] [class*="caption"] {
  line-height: 20px !important;
  font-size: 11px !important;
}

/* ══════════════════════════════════════════════════════════════════
   Claude 主题：首页欢迎标语与图标（Welcome Headline & Logo Colorway）
   ══════════════════════════════════════════════════════════════════ */

/* 原生鲸鱼/鱼图标：完全保留原生排版与坐标几何，仅赋予 Claude 陶土温润色彩 */
.pXSMma_fish,
.pXSMma_fishHitbox svg,
[class*="_fishHitbox"] svg,
[class*="_fish"] {
  color: var(--dsw-alias-brand-primary) !important;
  fill: var(--dsw-alias-brand-primary) !important;
  transition: color 0.2s, fill 0.2s, filter 0.2s !important;
}
body[data-ds-dark-theme] .pXSMma_fish,
body[data-ds-dark-theme] .pXSMma_fishHitbox svg,
body[data-ds-dark-theme] [class*="_fishHitbox"] svg,
body[data-ds-dark-theme] [class*="_fish"] {
  color: var(--dsw-alias-brand-primary) !important;
  fill: var(--dsw-alias-brand-primary) !important;
}
.pXSMma_fish path,
.pXSMma_fishHitbox svg path,
[class*="_fishHitbox"] svg path,
[class*="_fish"] path {
  fill: currentColor !important;
  color: inherit !important;
}

/* 标语主文字：Claude 标志性温润典雅字体 */
.pXSMma_headlineText,
[class*="_headlineText"] {
  font-family: "Iowan Old Style", "Apple Garamond", "Baskerville", "Times New Roman", "LXGW WenKai", "Songti SC", "SimSun", serif, var(--dsw-font-family) !important;
  font-size: 28px !important;
  font-weight: 600 !important;
  color: var(--dsw-alias-label-primary) !important;
  letter-spacing: -0.015em !important;
  line-height: 36px !important;
}

/* 预览版徽章：精致陶土温润胶囊 */
.pXSMma_previewBadge,
[class*="_previewBadge"] {
  background: rgba(193, 95, 60, 0.10) !important;
  color: var(--dsw-alias-brand-primary) !important;
  border: 1px solid rgba(193, 95, 60, 0.22) !important;
  border-radius: 999px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 2px 9px !important;
  letter-spacing: 0.04em !important;
  height: auto !important;
  line-height: 16px !important;
  vertical-align: middle !important;
}
body[data-ds-dark-theme] .pXSMma_previewBadge,
body[data-ds-dark-theme] [class*="_previewBadge"] {
  background: rgba(217, 119, 87, 0.14) !important;
  color: var(--dsw-alias-brand-primary) !important;
  border-color: rgba(217, 119, 87, 0.30) !important;
}

.cth-switch{position:relative;width:34px;height:20px;flex:none;cursor:pointer}.cth-switch input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}.cth-switch input:disabled{cursor:not-allowed}.cth-switch-track{position:absolute;inset:0;border-radius:10px;background:var(--dsw-alias-border-l2);transition:background .15s}.cth-switch input:checked+.cth-switch-track{background:var(--dsw-alias-brand-primary)}.cth-switch input:disabled+.cth-switch-track{opacity:.4}.cth-switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,.15);transition:transform .15s;pointer-events:none}.cth-switch input:checked+.cth-switch-track+.cth-switch-knob{transform:translateX(14px)}
`

      // ── 官方绑定：theme 服务 alias token 叠层 ──
      const themeSvc = ctx.theme ?? ctx.get('theme')
      let tokenDisposer = null
      const stackTokens = () => {
        const t = ctx.theme ?? ctx.get('theme') ?? themeSvc
        if (t === undefined || typeof t.overrideTokens !== 'function') return
        if (tokenDisposer !== null) {
          try { tokenDisposer() } catch (err) {}
          tokenDisposer = null
        }
        tokenDisposer = t.overrideTokens('dsh-claude-theme', {
          '--dsw-alias-bg-base': { light: '#FAF8F4', dark: '#181816' },
          '--dsw-alias-bg-layer-1': { light: '#F2EDE3', dark: '#1C1B18' },
          '--dsw-alias-bg-layer-2': { light: '#FCFBF9', dark: '#242320' },
          '--dsw-alias-bg-layer-3': { light: '#F5F1E8', dark: '#292824' },
          '--dsw-alias-bg-module-platform': { light: '#F5F1E8', dark: '#201F1C' },
          '--dsw-alias-bg-overlay': { light: 'rgba(44,39,32,.08)', dark: 'rgba(255,255,255,.07)' },
          '--dsw-alias-border-l1': { light: '#E8E2D5', dark: '#2B2A26' },
          '--dsw-alias-border-l2': { light: '#DCD5C6', dark: '#383731' },
          '--dsw-alias-border-l3': { light: '#CEC5B3', dark: '#48463F' },
          '--dsw-alias-border-l4': { light: '#BEB39E', dark: '#5A584F' },
          '--dsw-alias-brand-primary': { light: '#C15F3C', dark: '#D97757' },
          '--dsw-alias-label-primary': { light: '#2C2720', dark: '#ECE7DF' },
          '--dsw-alias-label-secondary': { light: '#666052', dark: '#B0AAA0' },
          '--dsw-alias-label-tertiary': { light: '#8E8675', dark: '#827C72' },
          '--dsw-specific-sidebar-fill': { light: '#F2EDE3', dark: '#1A1917' },
          '--dsw-specific-input-major': { light: '#FFFFFF', dark: '#201F1C' },
          '--dsw-specific-menu': { light: '#FFFFFF', dark: '#242320' },
          '--dsw-specific-selector': { light: '#F5F1E8', dark: '#242320' },
          '--dsw-specific-tip': { light: '#FFFFFF', dark: '#242320' },
          '--dsw-specific-login-input': { light: '#FFFFFF', dark: '#201F1C' },
          '--dsw-specific-bubble': { light: '#FFFFFF', dark: '#22211E' },
          '--dsw-alias-markdown-code-block': { light: '#F2EDE3', dark: '#131312' },
          '--dsw-alias-markdown-code-block-banner': { light: '#E8E2D5', dark: '#1A1917' },
          '--dsw-alias-markdown-inline-code': { light: 'rgba(193,95,60,.09)', dark: 'rgba(255,255,255,.08)' },
          '--dsw-static-deepseek-500': { light: '#C15F3C', dark: '#D97757' },
          '--dsw-static-deepseek-450': { light: '#C15F3C', dark: '#D97757' },
          '--dsw-static-deepseek-400': { light: '#D2724F', dark: '#E2886A' },
          '--dsw-static-deepseek-200': { light: '#F3B298', dark: '#F7C0AC' },
          '--dsw-static-neutral-bluish-500': { light: '#2C2720', dark: '#ECE7DF' },
          '--dsw-static-neutral-bluish-400': { light: '#C15F3C', dark: '#D97757' },
          '--dsw-static-neutral-bluish-200': { light: '#E8E2D5', dark: '#2B2A26' },
        })
      }
      const unstackTokens = () => {
        if (tokenDisposer === null) return
        try { tokenDisposer() } catch (err) { /* ignore */ }
        tokenDisposer = null
      }

      // ── 本地存储秒级优先启动 + 状态机 ──
      let enabled = getLocalEnabled()
      const applyTheme = () => { stackTokens(); insertCss(THEME_CSS) }
      const clearTheme = () => { unstackTokens(); removeCss() }

      if (enabled) {
        applyTheme()
      }

      // ── 响应深浅色切换、系统主题切换事件，持续锁死样式 ──
      if (typeof ctx.on === 'function') {
        ctx.on('theme/change', () => {
          if (enabled) applyTheme()
        })
      }
      ctx.effect(() => () => unstackTokens(), 'dsh-claude-theme: token layer cleanup')

      // ── Remote contribution ──
      const TYPERT_JSON = { _zod: {}, parse: (v) => v }
      const TYPERT_REMOTE = {
        package: 'dsh-claude-theme',
        descriptors: [
          { id: 'dsh-claude-theme#claudeTheme/getConfig', service: 'claudeTheme', namespace: 'claudeTheme', method: 'getConfig', invocation: { kind: 'direct' }, parameters: [], result: { mode: 'strict', typeSymbol: 'dsh-claude-theme#Json', schema: TYPERT_JSON } },
          { id: 'dsh-claude-theme#claudeTheme/setEnabled', service: 'claudeTheme', namespace: 'claudeTheme', method: 'setEnabled', invocation: { kind: 'direct' }, parameters: [{ name: 'args', wire: 'args', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-claude-theme#Json', schema: TYPERT_JSON } }], result: { mode: 'strict', typeSymbol: 'dsh-claude-theme#Json', schema: TYPERT_JSON } },
          { id: 'dsh-claude-theme#claudeTheme/diagnostics', service: 'claudeTheme', namespace: 'claudeTheme', method: 'diagnostics', invocation: { kind: 'direct' }, parameters: [], result: { mode: 'strict', typeSymbol: 'dsh-claude-theme#Json', schema: TYPERT_JSON } },
        ],
      }
      const mountSvc = ctx.remote ?? ctx.get('remote')
      if (mountSvc !== undefined && typeof mountSvc.$mount === 'function') {
        try {
          await mountSvc.$mount(TYPERT_REMOTE)
        } catch (err) {
          console.error('dsh-claude-theme: remote mount failed', err)
        }
      }
      const unwrapRemote = (r) => (r !== null && typeof r === 'object' && r.ok === true && Object.prototype.hasOwnProperty.call(r, 'value')) ? r.value : r
      const remoteRaw = ctx.get('remote.claudeTheme')
      const remote = (remoteRaw !== null && remoteRaw !== undefined && typeof Proxy !== 'undefined')
        ? new Proxy(remoteRaw, {
            get(target, prop) {
              const v = target[prop]
              if (typeof v === 'function') return (...args) => Promise.resolve(v.apply(target, args)).then(unwrapRemote)
              return v
            },
          })
        : remoteRaw

      try {
        if (remote !== undefined && remote !== null && typeof remote.getConfig === 'function') {
          const cfg = await remote.getConfig()
          if (cfg !== null && cfg !== undefined && typeof cfg.enabled === 'boolean') {
            enabled = cfg.enabled
            setLocalEnabled(enabled)
            if (enabled) applyTheme(); else clearTheme()
          }
        }
      } catch (err) {
        console.error('dsh-claude-theme: getConfig failed, default to local state', err)
      }

      // ── 通用设置页：外观下方设置项 ──
      const slotsSvc = ctx.slots ?? ctx.get('slots')
      if (slotsSvc !== undefined) {
        slotsSvc.inject('settings.general.item', () => slotsSvc.register(
          { name: 'settings.general.item', id: 'claude-theme', order: 15 },
          () => {
            const [on, setOn] = React.useState(enabled)
            const [saving, setSaving] = React.useState(false)
            const handleToggle = (e) => {
              const next = e.target.checked
              setOn(next)
              setLocalEnabled(next)
              if (next) applyTheme(); else clearTheme()
              setSaving(true)
              remote.setEnabled({ enabled: next })
                .then((r) => {
                  const en = !!(r !== null && r !== undefined && r.enabled === true)
                  setOn(en)
                  setLocalEnabled(en)
                  if (en) applyTheme(); else clearTheme()
                })
                .catch((err) => {
                  console.error('dsh-claude-theme: setEnabled failed', err)
                })
                .then(() => setSaving(false))
            }
            return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--dsw-alias-border-l1)' } },
              React.createElement('div', { style: { flex: 1, minWidth: 0, paddingRight: '24px' } },
                React.createElement('div', { style: { fontSize: 14, lineHeight: '20px', fontWeight: 500, color: 'var(--dsw-alias-label-primary)' } }, 'Claude 风格'),
                React.createElement('div', { style: { fontSize: 12.5, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)', marginTop: 3 } }, 'Anthropic 经典美学：温润暖纸底色、深焙炭黑字、陶土色高亮。关闭即恢复默认外观。'),
              ),
              React.createElement('label', { className: 'cth-switch' },
                React.createElement('input', { type: 'checkbox', checked: on, disabled: saving, onChange: handleToggle }),
                React.createElement('span', { className: 'cth-switch-track' }),
                React.createElement('span', { className: 'cth-switch-knob' }),
              ),
            )
          },
        ))
      }
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
