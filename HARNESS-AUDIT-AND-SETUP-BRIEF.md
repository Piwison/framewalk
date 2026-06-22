# Harness 稽核 ＋ 建置指示書（完整獨立版）

> **這份文件給誰看：** Claude（在這個專案的 Cowork / Claude Code session 裡）。
> **這是一份自足文件。** 稽核與修復所需的「最新技術基準」已全部內嵌於 PART I，**你不需要去查任何外部手冊或文件**，以本文件為唯一基準即可。
> **目的（三合一）：**
> &nbsp;&nbsp;**PART I 參考基準** — 2026 下半年 harness 的最新標準與核心概念（你拿來判斷新舊的尺）。
> &nbsp;&nbsp;**PART II 稽核** — 檢查現有專案的 harness 與架構是否跟上基準。
> &nbsp;&nbsp;**PART III 建置／修復** — 依稽核結果，把缺口補到位（含目標架構與要 import 的開源 skill）。
> **產品型態：** 一個**獨立的 web app**（完整、要長期維護的產品，非拋棄式原型）。
> **技術棧：** Next.js（App Router）＋ React ＋ TypeScript ＋ Tailwind v4。
> **負責人：** 我（產品經理，PM）。前端與 harness、架構決策、契約是我的主場；後端 / DB / 部署的深層實作屬工程師範圍。
> **基準日：** 2026 年 6 月中（Claude Opus 4.8 / Sonnet 4.6 時代）。

---

## 0. 給 Claude 的開場指令（請先讀，再開始）

你的角色是**稽核員 + 修復協作者**。請依下列紀律執行：

1. **先唯讀盤點，再下判斷，最後才動手。** 在我明確同意前，**不要**修改設定檔、不要安裝 skill / MCP、不要重構。
2. **以本文件 PART I 為「最新」的唯一基準。** 你的訓練資料對「最新」的認知可能過時——不要憑印象，要對照 PART I。版本細節不確定時標「需對照 `code.claude.com/docs/changelog` 確認」。
3. **基於實際檔案，不臆測。** 每個結論指出證據來源（檔名／片段）；找不到就說「找不到 / 未設定」。
4. **誠實校準，不灌水。** 沒問題就標 ✅；嚴重度只有真正影響正確性／安全／可維護性才給「高」。
5. **分清範圍。** 後端 / DB / 部署深層標 **[工程師範圍]**，只給邊界觀察。
6. **流程：** 盤點（PART II §4）→ 對照基準出 gap 報告（§5–§7）→ **停下來等我挑要修的** → 我同意後，依 PART III 修復。破壞性變更一律先確認。

---
---

# PART I — 參考基準（2026 H2 最新標準，內嵌免查）

> 這一段是你做稽核與修復的「尺」。先理解概念骨架（§1），再用事實基準逐項對照（§2–§3）。

## I-1. 核心概念骨架（為什麼這些基準重要）

**Context Engineering 是母題。** 模型的失敗多半不是模型不夠強，而是 context 的失敗。它有五個操作維度：Selection（選相關的）、Compression（壓掉雜訊）、Ordering（重點放注意力強的位置）、Isolation（把髒活關進獨立 context）、Format（用模型好用的結構）。harness 的每個零件都落在這五格裡。

**2026 下半年的新共識：Context Rot（脈絡腐化）。** 模型表現會隨 context window 被填滿而**非線性劣化**，連簡單任務也是——這是所有前沿模型的共同現象（Chroma 測 18 個前沿模型證實）。實務守則：用「填充百分比」管理而非 token 數、超過 ~60% 主動壓縮、1M context 不解決只是後挪、把工具輸出隔離到 context 之外。

**Harness 修正的三個結構性失敗模式**（Anthropic 2026/6/2〈A harness for every task〉定義，仍為現行標準）：
- **Agentic laziness（怠惰）**：請它 review 50 項，它做了 35 項就宣告完成。→ 用 script 迴圈跑到清單清空。
- **Self-preferential bias（自我偏袒）**：叫它審查自己寫的程式，它過度寬容。→ 用獨立 context 的 reviewer subagent 做對抗式審查。
- **Goal drift（目標漂移）**：開頭說「別動 X 檔」，第 80 輪就忘了（compaction 有損 + context rot）。→ 目標放 script、用 PreToolUse/PreCompact hook 守護。

**四種並行手段（關鍵差別＝計畫握在誰手上）：** Subagents（Claude 逐回合）、Agent view（你手動派發）、Agent teams（領頭 agent 監督，實驗中）、Dynamic Workflows（程式腳本協調、模型只做判斷）。

## I-2. 模型陣容基準（最高優先校正點）

| 模型 | 定位 | 輸入/輸出（每 M token） | 重點 |
|---|---|---|---|
| **Claude Opus 4.8**（`claude-opus-4-8`） | 旗艦、最強推理 | $5 / $25 | 2026/5/28 發布，使 Dynamic Workflows 可行；1M context；含 effort 控制與 Fast Mode（$10/$50） |
| **Claude Sonnet 4.6**（`claude-sonnet-4-6`） | 日常主力（預設） | $3 / $15 | 1M context 已轉正；多數 coding 測試優於 4.5 |
| **Claude Haiku 4.5** | 快、省成本 | $1 / $5 | coding/agent 約等同 Sonnet 4 級 |
| **Claude Opus 4.7** | 仍可選用 | — | 2026/4/16 發布 |
| **Fable 5 / Mythos 5** | 更高階（Mythos 級） | $10 / $50 | 2026/6/9 推出，**6/12 因出口管制暫停存取**；`fable` 別名雖存在但**不應假設可用** |

subagent `model:` 接受別名 `sonnet / opus / haiku / fable` 與完整 ID；支援 `model: inherit` ＋ `CLAUDE_CODE_SUBAGENT_MODEL` 設預設。**過時徵兆：設定指向 Opus 4.5 / Sonnet 4.5 等舊世代。**

## I-3. 逐項技術基準

**Dynamic Workflows — 已正式（GA）。** 2026/5/28（v2.1.154）推出、6/2 發表架構文，現已 GA 開放 Pro/Max/Team/Enterprise（Max/Team 預設開、Pro 用 `/config` 開）。觸發：自然語言或 `ultracode`；`/effort ultracode` 設整 session；字面 `workflow` 關鍵字為 v2.1.160 前寫法。限制：最多 **16 並行 / 單次 1,000 agent 上限**（仍為現值，官方註明可能調整）。內建 `/deep-research`。六大模式：classify-and-act、fan-out-and-synthesize、adversarial-verification、generate-and-verify、tournament、loop-until-done。實證：Jarred Sumner 用它把 Bun 從 Zig 移植到 Rust，測試 99.8% 通過、約 75 萬行、11 天。**過時徵兆：把它當「實驗性」。**

**Subagents — 巢狀與隔離已正式。** markdown 放 `~/.claude/agents/` 或 `.claude/agents/`。frontmatter：`name`、`description`、`tools`、`model` ＋ `permissionMode`、`maxTurns`、`skills`、`isolation`、`memory`、`hooks`、`background`。新增：**`isolation: worktree`**（隔離 repo 副本）、**巢狀 subagent**（前景/背景同享 5 層深度上限，v2.1.181 修正）、**fork mode**（`CLAUDE_CODE_FORK_SUBAGENT=1` 共用 prompt cache）。內建三個：Explore（Haiku 唯讀）、Plan、General-purpose。**過時徵兆：文件寫「subagent 不能巢狀」；多 agent 動同批檔卻不用 worktree。**

**Agent Teams — 機制已變。** `TeamCreate`/`TeamDelete` 已於 **v2.1.178 移除**；開 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 後每 session 自帶隱式團隊，直接用 Agent 工具 `name` 生隊友。**過時徵兆：腳本仍呼叫 `TeamCreate`。**

**Hooks — 已擴充到 18+ 事件。** 含 `PreToolUse`、`PostToolUse`、`UserPromptSubmit`、`Stop`、`SubagentStop`、`SessionStart`、`SessionEnd`、**`PreCompact`**（壓縮前保目標）、`Notification` 等。handler 型別 `command/http/prompt/agent`，`async: true`，預設逾時 10 分鐘。三層設定：`~/.claude/settings.json`（全域）、`.claude/settings.json`（專案共享）、`.claude/settings.local.json`（個人）。權限評估序：**deny → ask → allow**。**過時徵兆：完全沒 hook，或沒有寫檔即跑 prettier/eslint/tsc 的護欄。**

**Sandboxing — OS 層隔離。** 建在 macOS Seatbelt / Linux bubblewrap 上、包覆 Bash 工具，減少約 84% 權限提示，用 `/sandbox` 啟用。**安全提醒：有繞過漏洞史**（CVE-2025-66479；SOCKS5 null-byte 注入於 v2.1.90 修補；Check Point 發現透過惡意 repo 設定檔的 RCE/竊憑證途徑 CVE-2026-21852、CVE-2025-59536）——**對不信任 repo 仍要極度小心**。

**CLAUDE.md ↔ AGENTS.md。** AGENTS.md 現由 **Linux 基金會 AAIF**（Anthropic、Block、OpenAI 共同發起）託管、**60,000+ 專案 / 30+ 工具**採用。**關鍵：Claude Code 讀的是 CLAUDE.md，不直接讀 AGENTS.md**——共用時 CLAUDE.md 第一行寫 `@AGENTS.md`，或在已有 AGENTS.md 的 repo 跑 `/init`。建議單檔 < 150–500 行（Codex 對 AGENTS.md 有 32 KiB 上限；研究指 LLM 可靠遵守約 150–200 條指令、人寫的勝過 LLM 生成的）。進階：CLAUDE.md 應是「會自我成長的錯誤日誌」（複利工程）。**過時徵兆：有 AGENTS.md 但 CLAUDE.md 沒 `@import`（等於沒被讀到）。**

**Skills / Commands — 已合併。** `.claude/commands/x.md` 與 `.claude/skills/x/SKILL.md` 都會生成 `/x`，同名 skill 優先。**供應鏈安全：** 研究指某市集逾 13% skill 含嚴重漏洞、約 36% 帶 prompt injection——**視第三方為不可信程式碼，鎖版本、優先第一方（Anthropic/Vercel/Microsoft/Google）。**

**SDD / 交棒工具。** GitHub Spec Kit 約 **111k★**，v0.10+ 改用 `--integration`（不是舊 `--ai`），流程 `/speckit.specify → .plan → .tasks → .implement` ＋ `.constitution/.analyze/.checklist`。其他：OpenSpec 約 52k★（MIT、棕地變更）、Kiro（AWS）GA（EARS ＋ SMT 正確性測試）、Tessl 已轉向「agent skills」、Agent OS v3 改把編排交給 Claude Code Plan Mode。

**Evals — 已加入軌跡評估。** 從「只評輸出」演進為三問：正確性、過程是否壞掉（工具呼叫正確性、計畫遵循、步驟效率）、軌跡品質。**MLflow 3** 導入 Agent GPA 評分器（Plan Adherence、Plan Quality、Tool Selection、Tool Calling、Execution Efficiency、Logical Consistency）。生態：LangSmith、Braintrust、DeepEval v4；**Promptfoo 於 2026/3/9 被 OpenAI 收購**。**過時徵兆：完全無 eval，或只看最終輸出不看過程。**

**其他新介面。** Claude Code 已上 web 與 iOS（research preview），`/rc`（Remote Control）可從手機操控本機 session；新增 Artifacts in Claude Code、`/ultrareview`、`/ultraplan`、`--safe-mode`、官方市集 `claude-plugins-official`、會掃 repo 並推薦設定的 `claude-code-setup` 外掛。查核時版本為 v2.1.183（2026/6/19）。

---
---

# PART II — 稽核（AUDIT）

## II-4. 第一步：盤點現況（唯讀，先做完）

請檢視以下，整理成「找到什麼 / 沒找到什麼」現況清單，再進對照。

**Harness：** `claude --version`、`/status`；`.claude/settings.json` ＋ `settings.local.json` ＋ `~/.claude/settings.json`（hooks/權限/模型）；`.claude/agents/*.md`（frontmatter）；`CLAUDE.md`、`AGENTS.md`（內容、長度、是否 `@import`）；`.mcp.json`；`.claude/skills/`、`.claude/commands/`（來源/版本）；`.claude/workflows/`。

**架構：** `package.json`（Next/React/TS/Tailwind 版本、scripts、過時或重複套件）；`tsconfig.json`（`strict`、`any`）；`next.config.*` 與路由（App Router vs Pages Router）；ESLint/Prettier；測試設定與覆蓋；CI/CD（`.github/workflows/`）；目錄結構；設計 token 檔；有無後端/API route/DB 層（標邊界）；secrets 管理方式（**只看怎麼管，絕不讀出實際值**）。

## II-5. 稽核 A — Harness 對照表

逐列對照 PART I-3，輸出：狀態 + 證據 + 嚴重度 + 一句話建議。
狀態標籤：`✅ 最新` / `⚠️ 過時` / `❌ 缺漏` / `🔶 有風險` / `➖ 不適用`；嚴重度：`高/中/低`。

| 項目 | 對照基準（見 PART I） | 重點過時徵兆 |
|---|---|---|
| 模型陣容 | I-2：Opus 4.8 / Sonnet 4.6 / Haiku 4.5 | 指向 4.5 舊世代；假設 `fable` 可用 |
| Dynamic Workflows | 已 GA、`ultracode` 觸發 | 當成「實驗性」；只用字面 `workflow` |
| Subagents 巢狀 | 支援（5 層深度） | 文件寫「不能巢狀」 |
| Subagents 隔離 | `isolation: worktree` | 多 agent 動同檔卻沒隔離 |
| Subagents fork/別名 | fork cache、`inherit` | 模型寫死舊 ID、未用 cache |
| Agent Teams | `TeamCreate` 已移除、隱式團隊 | 仍呼叫 `TeamCreate` |
| Hooks 覆蓋 | 18+ 事件，含 PreToolUse/PostToolUse/Stop/PreCompact | 沒 hook、無寫檔即驗護欄 |
| Sandboxing | `/sandbox` 可用 | 未啟用；對不信任 repo 無防備 |
| CLAUDE.md ↔ AGENTS.md | CLAUDE.md `@AGENTS.md` 匯入 | 有 AGENTS.md 但沒被 import |
| Skills/Commands | 已合併、同名 skill 優先 | 重複定義打架 |
| Skill/MCP 安全 | 第一方、鎖版本 | 來源不明、未鎖版本 |
| 複利工程 | CLAUDE.md 含錯誤日誌 | CLAUDE.md 靜態沒成長 |
| SDD/交棒 | Spec Kit v0.10+ `--integration` | 用舊 `--ai`；無 spec/驗收機制 |
| Evals | 加軌跡/工具呼叫評估 | 無 eval；只看輸出 |
| Context 管理 | 填充% 管理、超 60% 壓縮、輸出隔離 | 長 session 不壓縮、輸出灌回主對話 |

## II-6. 稽核 B — 架構健檢表（獨立 web app）

逐面向檢查，輸出格式同上。標 **[工程師範圍]** 者只給邊界觀察。

| 面向 | 健康基準 / 檢查重點 |
|---|---|
| 框架現代度 | Next.js App Router（無 Pages Router 殘留）、React 現代寫法、Tailwind v4；版本是否落後、有無待處理破壞性升級 |
| 渲染策略 | Server Components 為預設、client 邊界克制（`'use client'`）、SSR/SSG/ISR/streaming 用得當、資料抓取與快取一致 |
| 元件架構 | 合理 composition、單一職責、可重用；無過深 prop drilling；`components/ui` 與業務元件分層 |
| 型別安全 | `strict` 開、無 `any` 蔓延；端對端型別（API 邊界用 interface/Zod）；建置含 `tsc --noEmit` |
| 狀態/資料層 | 狀態選型合理、無重複真實來源；資料抓取（Server Actions / fetch caching / React Query 等）一致可預期 |
| 設計系統/token | 單一真實來源的 token（色/字級/間距）；UI 一致、無散落 magic value |
| 無障礙 a11y | 朝 WCAG AA；語意標籤、鍵盤可操作、焦點管理、對比；建議跑 axe-core / Lighthouse |
| 效能 | Core Web Vitals（LCP/INP/CLS）健康；bundle 受控、code splitting、圖片最佳化 |
| 測試 | unit/component、關鍵流程 E2E（Playwright）、視覺回歸（選用）；覆蓋與信心是否足 |
| 安全 | 輸入驗證、輸出轉義、安全 headers、`npm audit` 漏洞、secrets 不入庫、authn/authz 邊界 **[部分工程師範圍]** |
| 錯誤/可觀測性 | error boundary、優雅降級、logging/monitoring 規劃 |
| 建置/部署 | CI/CD 綠燈、環境變數管理、preview/回滾 **[部分工程師範圍]** |
| 可維護性/技術債 | 結構清楚、命名一致、無大量 dead code/TODO 堆積、文件足夠接手 |
| 後端/DB 邊界 | **[工程師範圍]** 前後端契約是否型別化、是否解耦；深層交工程師，只標邊界風險 |

## II-7. 稽核報告格式

```
# 稽核報告：<專案名> — <日期>
## Executive Summary
- 整體 harness 成熟度：<高/中/低> ＋ 一段話
- 整體架構健康度：<高/中/低> ＋ 一段話
- Top 3 風險（高嚴重度）／ Top 3 Quick Wins
## A. Harness 稽核結果（表：項目|狀態|證據|嚴重度|建議|工作量）
## B. 架構健檢結果（表：面向|狀態|證據|嚴重度|建議|工作量）
## C. 修復優先序：P0（立刻）/ P1（本週）/ P2（有空）
## D. 建議的下一步（每項標 harness/架構、PM/工程師範圍）
```

**成熟度評分指引：** 高＝基準項 ≥80% ✅ 且無高嚴重度缺口；中＝多數到位但有若干過時/中嚴重度缺口；低＝核心護欄（hooks 把關、TS strict、測試、模型陣容）多處缺漏。

---
---

# PART III — 建置 / 修復（SETUP / REMEDIATION）

> 在我看完稽核報告、勾選要修的項目後，依此把缺口補到位。下面是「目標狀態」與「怎麼補」。

## III-8. 目標 Harness 架構（修到這個樣子）

```
<repo>/
  AGENTS.md                 # 正規共用、< 150 行；被 CLAUDE.md 以 @ 匯入
  CLAUDE.md                 # 第一行 @AGENTS.md ＋ Claude 專屬補充與錯誤日誌
  .claude/
    settings.json           # hooks（prettier/eslint/tsc/vitest）、權限預算
    agents/
      component-architect.md
      design-reviewer.md     # 用 Playwright MCP
      a11y-checker.md
      code-reviewer.md       # 唯讀，獨立 context 對抗式審查
    skills/                  # 人工 import 的開源 skill（見 §9）
    workflows/               # 偶爾存下的 ultracode run（選用）
  .mcp.json                 # playwright、chrome-devtools、shadcn（選用 figma）
  specs/                    # Spec Kit 產出（EARS 驗收條件）
  src/
    app/ (預設 Server Components)
    components/ (ui/ 自有 primitives)
    styles/tokens.css (設計 token 單一真實來源)
  .storybook/
```

**要建立的 Subagents：**

| Subagent | 模型 | 工具 | 職責 |
|---|---|---|---|
| `component-architect` | sonnet | Read/Glob/Grep + 有限 Write | 規劃元件層級、props/型別、composition |
| `design-reviewer` | sonnet + Playwright MCP | Read/Bash/Playwright | 截圖比對參考設計、檢查視覺層級/RWD/狀態 |
| `a11y-checker` | haiku/sonnet | Read/Bash/Playwright | axe-core/jsx-a11y + 無障礙樹快照，標 WCAG AA |
| `code-reviewer` | sonnet | **唯讀** Read/Grep/Glob | TS 嚴格度、prop drilling、死碼；對抗式審查 |

**要設定的 Hooks（`.claude/settings.json`）：**
- **PostToolUse（`Write|Edit|MultiEdit`）** → `prettier --write` → `eslint --fix` → `tsc --noEmit` → `vitest related`（只測碰到的）。
- **PreToolUse（`Write|Edit`）** → 擋 `.env` 與危險 bash；強制 Next.js 規則。
- **Stop / SubagentStop** → 宣告完成前跑完整 `tsc` ＋ `vitest run`，沒過不准說 done。
- **PreCompact** → 壓縮前重申禁改檔案與目標，對抗 goal drift。

**CLAUDE.md / AGENTS.md：** AGENTS.md 當正規共用層（指令、風格、目錄地圖、測試、「一定做/先問我/絕不做」）；CLAUDE.md 第一行 `@AGENTS.md` ＋ Claude 專屬補充與錯誤日誌。保留 `create-next-app` 生成的 Next.js 受管區塊。

**MCP（`.mcp.json`）：** Playwright MCP（Microsoft）、Chrome DevTools MCP（Google，Lighthouse/CWV）、shadcn/ui MCP（官方免費）、（選用）Figma MCP。

## III-9. 要「人工 import」的開源 Skill

> 先裝第一方、鎖版本。每個裝前請我確認來源與版本。

| Skill / 套件 | 來源 repo | 約星數 | 作用 | 取得方式 |
|---|---|---|---|---|
| **frontend-design**（官方） | `anthropics/skills` | — | 逼出有辨識度、production 級 UI，避「AI slop」 | Anthropic 官方 skill 庫 / marketplace |
| **Vercel agent-skills** | `vercel-labs/agent-skills` | ~27.6k★ | `react-best-practices`、`web-design-guidelines`、`composition-patterns` | `npx skills add vercel-labs/agent-skills` |
| **OneRedOak design-review** | `OneRedOak/claude-code-workflows` | ~3.3k★ | `/design-review` + Playwright 視覺審查 subagent（對標頂級產品＋WCAG AA+） | clone 後複製 `design-review/` 進 `.claude/` |
| **shadcn/ui MCP** | shadcn（官方） | — | 無障礙、可自有的元件 primitives | 官方 MCP server（免費） |
| **Context7**（選用） | upstash | — | 即時版本對應文件，減少幻想 API | MCP / skill |
| **GitHub Spec Kit** | `github/spec-kit` | ~111k★ | spec / EARS 驗收條件 | `--integration claude`（v0.10+，勿用舊 `--ai`） |

> **別裝 BMAD（~49k★）** 之類重量級多 agent 方法——對單人維護的 web app 過重。需要時再說。

## III-10. 修復路線（依稽核結果驅動）

不做大爆炸式重構。依稽核報告的 P0/P1/P2 分批：
- **P0（高嚴重度，先做）：** 修正過時模型陣容、補上 PostToolUse 型別/格式護欄、把 `tsconfig` 改 `strict`、CLAUDE.md 加 `@AGENTS.md`、移除任何 `TeamCreate` 舊呼叫、處理 `npm audit` 高風險漏洞。
- **P1（本週）：** 建齊四個 subagent、補測試護欄（Stop hook 跑 vitest）、設計 token 收斂、a11y 明顯缺口、Spec Kit 升級到 `--integration`。
- **P2（有空）：** PreCompact hook、視覺回歸、Lighthouse 接 Chrome DevTools MCP、把常用 workflow 存成 slash command、Storybook 補件。

每修一項：小步提交、可回滾；修完用對應 hook / eval 驗證真的改善，再把學到的教訓寫進 CLAUDE.md 錯誤日誌。

## III-11. 讓 web app 維持 production 品質（修復時一併織入）

1. 元件驅動 + Storybook（兼文件）。2. 設計 token 為單一真實來源，design-reviewer 強制「色/字級都從 token 衍生」。3. 視覺審查迴圈（Playwright MCP + design-reviewer 真的看到畫面、自我修正）。4. a11y：axe-core/jsx-a11y 進 CI + 無障礙樹快照 + Lighthouse，保留一次人工鍵盤/報讀器檢查。5. Playwright E2E/視覺回歸存成可重用測試。6. TS `strict`、禁 `any`，由 `tsc` hook 強制。

## III-12. 何時升級到 Dynamic Workflows（`ultracode`）

只在偶爾的大型平行任務用，例如：`ultracode：稽核 src/components 每個元件的 WCAG AA 與缺漏鍵盤事件`。日常單一元件開發不要用（多花 token）。第一次跑務必縮小範圍試成本，用 `/workflows` 看用量。

---

## 注意事項（請全程記得）

- 以 **PART I 為唯一基準**，不憑印象判斷新舊；版本相關結論註明信心，必要時對照官方 changelog。
- Claude Code 幾乎每天發版；星數/安裝數為近似值，視為方向性。
- `fable` 別名存在但 Fable 5/Mythos 5 已暫停存取，**不要把任何設定建立在它可用的假設上**。
- 對不信任 repo 小心（sandboxing 有繞過漏洞史）；建議開 `/sandbox` 但仍警覺。
- **絕不讀出 secret 實際值**；只評估管理方式。
- **修復前先問**：報告完成後停下等我勾選；破壞性變更一律先確認。

---

*本文件為自足版本：PART I 已內嵌稽核與修復所需的全部技術基準，你不需要另查任何手冊。*
