# dsh-claude-theme

Claude 主题插件（DSH 静态包）：把 Cherry Studio Claude 社区主题
（[igeekbb/Cherry-Studio-Claude-theme](https://github.com/igeekbb/Cherry-Studio-Claude-theme)）
移植到 DSH 变量体系，并带设置页开关（即时生效 + 持久化）。

## 特性

- **配色**：浅色 = 温暖米白 + 陶土品牌色 `#C15F3C`；深色 = 黑曜石深炭 + 珊瑚陶土 `#D97757`
- **字体**：SF Pro Rounded + LXGWWenKaiScreenR（霞鹜文楷），覆盖 DSH 全部字号 token；代码块保留等宽字体
- **cordis 插件面板**：气泡卡片（直角矩形 + 单三角尖角尾巴指向插件按钮，与面板同底色）；滚动区在 body，内容完整可见；按钮悬停浮起（阴影+底色，无位移防文字发糊）、按下凹陷
- **开关**：通用设置 → 外观下方新增一行「Claude 风格」（`settings.general.item`，order 15），关掉即移除全部主题 CSS，重开即恢复；配置持久化在 `~/.dsh/claude-theme.config.json`

## 结构

```
package.json               dsh.bundle.patch + dsh.client(platform web) + exports
cordis.patch.yml           bundle - insert: 插件行
lib/index.js               Host：ClaudeThemeService（TypertRemoteService，类插件模式）
lib/client.js              Client：ModuleLoader 加载 + $mount remote + 设置页开关 + 内联主题 CSS
lib/typert.host.js         TYPERT FaceModel manifest
lib/typert.remote-client.js TYPERT_REMOTE（客户端 $mount 用）
lib/theme.css              主题 CSS 唯一源（改动后同步进 client.js 的 THEME_CSS 字符串）
```

Remote 方法（wire 名 = 方法名）：`getConfig` / `setEnabled` / `diagnostics`。

## 安装

### 0. 前置(两条都要有,缺一不可)

```bash
# ① pnpm —— dsh plugin 是 pnpm 转发器,没它必挂:
npm i -g pnpm
# ② dsh 命令行(有就跳过):
npm i -g @deepseek-ai/dsh
```

装完**重开一个新的终端**(PATH 才生效),验证:

```bash
pnpm -v        # 能打印版本号 = OK
dsh --version  # 能打印版本号 = OK
```

### 1. 方式一:GitHub 直装(类似 nightly,永远最新)

```bash
dsh plugin --profile web add github:kc0ed/dsh-claude-theme
```

- 直接拉仓库 main 分支,**代码推到 GitHub 即可用**,不等发版
- 更新:`git pull` 后重跑一次 add 即可(或 `cd ~/.dsh/profiles/web && pnpm update github:kc0ed/dsh-claude-theme`)
- 可能触发 pnpm 的 git 构建审批,见下方「常见坑-2」

### 2. 方式二:npm 稳定版(等发布后可用)

```bash
dsh plugin --profile web add @kc0ed/dsh-claude-theme
# 更新到最新版:
dsh plugin --profile web update @kc0ed/dsh-claude-theme
```

### 3. 装完(两种方式都一样)

1. **彻底退出 DSH 再重启**(`dsh web` 前老进程得死透,刷新页面不算)
2. 浏览器 **Ctrl+Shift+R 硬刷新**——不是没装上,是缓存记性好
3. 开关在 设置 → 通用设置 → 外观 正下方「Claude 风格」;配置持久化于 `~/.dsh/claude-theme.config.json`
4. 想装到别的 profile(如 headless)就把 `web` 换成 profile 名

卸载:`dsh plugin --profile web remove dsh-claude-theme`(依赖和层栈一起清)

### 常见坑

1. **`'pnpm' 不是内部或外部命令`** → pnpm 没装,或装完没重开终端。先 `npm i -g pnpm`,重开终端,`pnpm -v` 验证再继续。
2. **`pnpm failed` + 提示 allowBuilds(git 方式常见)** → pnpm 10 默认拦截 git 依赖的构建脚本,需要显式批准:
   1. 看报错里打印的 **exact key**(引号里那串,形如 `github.com/kc0ed/dsh-claude-theme`)
   2. 编辑 `~/.dsh/profiles/web/pnpm-workspace.yaml`,加:

      ```yaml
      allowBuilds:
        <exact-key>: "dsh"
      ```

   3. 保存后重跑第 1 步的 add 命令。

## 开发

改 `lib/theme.css` 后同步 `lib/client.js` 里的 `THEME_CSS` 模板字符串（无打包器，
CSS 必须内联），重启 dsh + 硬刷新生效。
