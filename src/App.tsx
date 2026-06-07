import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Braces,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Fingerprint,
  Hash,
  KeyRound,
  Link2,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import QRCode from 'qrcode'

type Tool = {
  id: string
  title: string
  category: string
  description: string
  keywords: string[]
  icon: typeof Braces
  component: () => ReactNode
}

type TransformResult = {
  output: string
  error?: string
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

type JsonMode = 'pretty' | 'compact' | 'sort' | 'escape' | 'unescape'

const sampleJson = '{\n  "name": "DevKit",\n  "localFirst": true,\n  "version": 1,\n  "tools": [\n    { "id": "json", "category": "format", "enabled": true },\n    { "id": "timestamp", "category": "time", "enabled": true },\n    { "id": "base64", "category": "encoding", "enabled": false }\n  ],\n  "owner": { "name": "dev", "roles": ["admin", "editor"] }\n}'

const sampleJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDAwMSIsIm5hbWUiOiJEZXZLaXQiLCJleHAiOjQxMDI0NDQ4MDB9.signature'

const tools: Tool[] = [
  {
    id: 'json',
    title: 'JSON 工作台',
    category: '格式化',
    description: '格式化、压缩、排序、查询路径、统计结构，并支持 JSON 字符串转义与反转义。',
    keywords: ['json', 'format', 'pretty', 'compact', 'sort', 'path', 'query', 'escape', '校验', '格式化'],
    icon: Braces,
    component: JsonTool,
  },
  {
    id: 'timestamp',
    title: '时间戳转换',
    category: '时间',
    description: 'Unix 秒级/毫秒级时间戳与本地时间、UTC、ISO 时间互转。',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', '时间戳'],
    icon: Clock3,
    component: TimestampTool,
  },
  {
    id: 'base64',
    title: 'Base64 编解码',
    category: '编码',
    description: '支持 UTF-8 文本的 Base64 编码与解码。',
    keywords: ['base64', 'b64', 'encode', 'decode', '编码', '解码'],
    icon: Code2,
    component: Base64Tool,
  },
  {
    id: 'url',
    title: 'URL 编解码',
    category: '编码',
    description: '对 URL 参数或文本执行 encodeURIComponent/decodeURIComponent。',
    keywords: ['url', 'uri', 'encodeURIComponent', 'decodeURIComponent', 'query'],
    icon: Link2,
    component: UrlTool,
  },
  {
    id: 'jwt',
    title: 'JWT 解码',
    category: '安全',
    description: '解码 JWT Header 和 Payload，并提示过期时间；仅解码，不验签。',
    keywords: ['jwt', 'token', 'bearer', 'header', 'payload', 'decode'],
    icon: KeyRound,
    component: JwtTool,
  },
  {
    id: 'hash',
    title: 'Hash 生成',
    category: '安全',
    description: '使用浏览器 Web Crypto 生成 SHA-1、SHA-256、SHA-384、SHA-512。',
    keywords: ['hash', 'sha', 'sha256', 'sha512', 'digest', '哈希'],
    icon: Hash,
    component: HashTool,
  },
  {
    id: 'uuid',
    title: 'UUID 生成',
    category: '生成器',
    description: '基于 crypto.randomUUID 批量生成 UUID v4。',
    keywords: ['uuid', 'guid', 'random', 'id', '生成'],
    icon: Fingerprint,
    component: UuidTool,
  },
  {
    id: 'qrcode',
    title: '二维码生成',
    category: '生成器',
    description: '将文本或链接生成二维码图片，适合本地快速分享。',
    keywords: ['qr', 'qrcode', '二维码', 'link', 'url'],
    icon: QrCode,
    component: QrCodeTool,
  },
]

export function App() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('json')
  const selectedTool = tools.find((tool) => tool.id === selectedId) ?? tools[0]

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return tools
    }

    return tools.filter((tool) => {
      const haystack = [tool.title, tool.category, tool.description, ...tool.keywords]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalized)
    })
  }, [query])

  const ActiveTool = selectedTool.component

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="DevKit 工具导航">
        <div className="brand-card">
          <div className="brand-mark">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="eyebrow">Local-first dev tools</p>
            <h1>DevKit</h1>
          </div>
        </div>

        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索 json / jwt / 时间戳"
          />
        </label>

        <nav className="tool-list">
          {filteredTools.map((tool) => {
            const Icon = tool.icon
            const active = selectedTool.id === tool.id

            return (
              <button
                className={active ? 'tool-button active' : 'tool-button'}
                key={tool.id}
                onClick={() => setSelectedId(tool.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{tool.title}</span>
                <small>{tool.category}</small>
              </button>
            )
          })}
        </nav>

        <div className="privacy-card">
          <ShieldCheck size={18} />
          <span>无后端上传。输入内容仅在当前浏览器内处理。</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="hero">
          <div>
            <p className="eyebrow">{selectedTool.category}</p>
            <h2>{selectedTool.title}</h2>
            <p>{selectedTool.description}</p>
          </div>
          <div className="hero-badge">MVP</div>
        </header>

        <ActiveTool />
      </section>
    </main>
  )
}

function JsonTool() {
  const [input, setInput] = useState(sampleJson)
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(() => new Set())
  const [actionError, setActionError] = useState('')
  const [showMoreActions, setShowMoreActions] = useState(false)

  const analysis = useMemo(() => analyzeJson(input, 'pretty'), [input])

  function toggleJsonTreePath(path: string) {
    setCollapsedPaths((currentPaths) => {
      const nextPaths = new Set(currentPaths)

      if (nextPaths.has(path)) {
        nextPaths.delete(path)
      } else {
        nextPaths.add(path)
      }

      return nextPaths
    })
  }

  function applyJsonOperation(nextMode: JsonMode) {
    const nextResult = transformJson(input, nextMode)

    if (nextResult.error) {
      setActionError(nextResult.error)
      return
    }

    setActionError('')
    setInput(nextResult.output)
  }

  return (
    <div className="json-workbench">
      <ToolGrid>
        <Panel
          title="输入 JSON"
          actions={
            <div className="json-primary-actions">
              <button className="primary-action" onClick={() => applyJsonOperation('pretty')} type="button">格式化</button>
              <button onClick={() => setShowMoreActions((visible) => !visible)} type="button">更多</button>
            </div>
          }
        >
          {showMoreActions ? (
            <div className="json-more-actions" aria-label="更多 JSON 操作">
              <ModeButton onClick={() => applyJsonOperation('compact')}>压缩</ModeButton>
              <ModeButton onClick={() => applyJsonOperation('sort')}>排序键名</ModeButton>
              <ModeButton onClick={() => applyJsonOperation('escape')}>转义</ModeButton>
              <ModeButton onClick={() => applyJsonOperation('unescape')}>反转义</ModeButton>
            </div>
          ) : null}
          <Textarea value={input} onChange={setInput} placeholder="粘贴 JSON、JSON 字符串或接口响应" />
          {actionError ? <p className="hint warning">{actionError}</p> : null}
          <div className="json-panel-footer">
            <button onClick={() => setInput('')} type="button">清空</button>
            <ResetButton onClick={() => setInput(sampleJson)} />
          </div>
        </Panel>

        <Panel
          title="JSON 树"
          actions={
            <div className="json-primary-actions">
              <button onClick={() => setCollapsedPaths(new Set())} type="button">展开全部</button>
              <CopyButton text={analysis.treeCopyText || analysis.result.output} />
            </div>
          }
        >
          <JsonTreeView
            collapsedPaths={collapsedPaths}
            error={analysis.treeError || analysis.result.error || ''}
            onToggle={toggleJsonTreePath}
            value={analysis.parsed}
          />
        </Panel>
      </ToolGrid>

    </div>
  )
}

function ModeButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="mode-button" onClick={onClick} type="button">
      {children}
    </button>
  )
}

function analyzeJson(input: string, mode: JsonMode) {
  const result = transformJson(input, mode)

  if (!input.trim() || mode === 'escape' || mode === 'unescape') {
    return {
      result,
      parsed: undefined,
      treeCopyText: '',
      treeError: '',
    }
  }

  try {
    const parsed = JSON.parse(input) as JsonValue

    return {
      result,
      parsed,
      treeCopyText: JSON.stringify(parsed, null, 2),
      treeError: '',
    }
  } catch (error) {
    const formatted = formatJsonParseError(input, error)

    return {
      result,
      parsed: undefined,
      treeCopyText: '',
      treeError: formatted,
    }
  }
}

function JsonTreeView({
  collapsedPaths,
  error,
  onToggle,
  value,
}: {
  collapsedPaths: Set<string>
  error: string
  onToggle: (path: string) => void
  value: JsonValue | undefined
}) {
  if (error) {
    return <div className="error-box compact-box">{error}</div>
  }

  if (value === undefined) {
    return <div className="empty-state compact-box">JSON 树会显示在这里</div>
  }

  return (
    <div className="json-tree" role="tree">
      <JsonTreeNode
        collapsedPaths={collapsedPaths}
        label="$"
        onToggle={onToggle}
        path="$"
        value={value}
      />
    </div>
  )
}

function JsonTreeNode({
  collapsedPaths,
  label,
  onToggle,
  path,
  value,
}: {
  collapsedPaths: Set<string>
  label: string
  onToggle: (path: string) => void
  path: string
  value: JsonValue
}) {
  const isArray = Array.isArray(value)
  const isObject = value !== null && typeof value === 'object' && !isArray
  const isContainer = isArray || isObject
  const isCollapsed = collapsedPaths.has(path)
  const childEntries: Array<readonly [string, JsonValue, string]> = []

  if (isArray) {
    value.forEach((item, index) => childEntries.push([String(index), item, `${path}[${index}]`]))
  } else if (isObject) {
    Object.entries(value as Record<string, JsonValue>).forEach(([key, item]) => {
      childEntries.push([key, item, appendJsonPath(path, key)])
    })
  }

  if (!isContainer) {
    return (
      <div className="json-tree-row leaf" role="treeitem">
        <span className="json-tree-spacer" />
        <span className="json-tree-key">{label}</span>
        <span className="json-tree-colon">:</span>
        <span className={`json-tree-value ${jsonValueClass(value)}`}>{formatJsonTreePrimitive(value)}</span>
        <button className="json-tree-copy" onClick={() => copyJsonTreeValue(value)} type="button" aria-label="复制节点值">
          <Copy size={12} />
        </button>
      </div>
    )
  }

  const containerMeta = isArray ? `Array(${value.length})` : `Object(${childEntries.length})`
  const ContainerIcon = isCollapsed ? ChevronRight : ChevronDown

  return (
    <div className="json-tree-node" role="treeitem" aria-expanded={!isCollapsed}>
      <div className="json-tree-row">
        <button className="json-tree-toggle" onClick={() => onToggle(path)} type="button">
          <ContainerIcon size={15} strokeWidth={2.2} />
        </button>
        <span className="json-tree-key">{label}</span>
        <span className={isArray ? 'json-tree-meta is-array' : 'json-tree-meta is-object'}>{containerMeta}</span>
        <button className="json-tree-copy" onClick={() => copyJsonTreeValue(value)} type="button" aria-label="复制节点值">
          <Copy size={12} />
        </button>
        <button className="json-tree-path" onClick={() => navigator.clipboard.writeText(path)} type="button">
          <Copy size={12} />
          <span>{path}</span>
        </button>
      </div>

      {!isCollapsed ? (
        <div className="json-tree-children" role="group">
          {childEntries.length > 0 ? (
            childEntries.map(([childLabel, childValue, childPath]) => (
              <JsonTreeNode
                collapsedPaths={collapsedPaths}
                key={childPath}
                label={childLabel}
                onToggle={onToggle}
                path={childPath}
                value={childValue}
              />
            ))
          ) : (
            <div className="json-tree-empty">空 {isArray ? '数组' : '对象'}</div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function jsonValueClass(value: JsonValue) {
  if (value === null) {
    return 'is-null'
  }

  return `is-${typeof value}`
}

function formatJsonTreePrimitive(value: JsonValue) {
  return typeof value === 'string' ? JSON.stringify(value) : String(value)
}

function copyJsonTreeValue(value: JsonValue) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)

  void navigator.clipboard.writeText(text)
}

function transformJson(input: string, mode: JsonMode): TransformResult {
  if (!input.trim()) {
    return { output: '' }
  }

  try {
    if (mode === 'escape') {
      return { output: JSON.stringify(input) }
    }

    if (mode === 'unescape') {
      const parsed = JSON.parse(input) as unknown

      if (typeof parsed !== 'string') {
        return { output: '', error: '反转义模式需要输入一个合法的 JSON 字符串，例如 "{\\\"id\\\":1}"。' }
      }

      return { output: parsed }
    }

    const parsed = JSON.parse(input)
    const normalized = mode === 'sort' ? sortJsonValue(parsed as JsonValue) : parsed

    return {
      output: JSON.stringify(normalized, null, mode === 'compact' ? 0 : 2),
    }
  } catch (error) {
    return { output: '', error: formatJsonParseError(input, error) }
  }
}

function sortJsonValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .reduce<Record<string, JsonValue>>((nextValue, key) => {
        nextValue[key] = sortJsonValue(value[key])
        return nextValue
      }, {})
  }

  return value
}

function appendJsonPath(path: string, key: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$-]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`
}

function formatJsonParseError(input: string, error: unknown) {
  const message = formatError(error)
  const match = message.match(/position (\d+)/i)

  if (!match) {
    return message
  }

  const position = Number(match[1])
  const before = input.slice(0, position)
  const line = before.split('\n').length
  const column = before.length - before.lastIndexOf('\n')

  return `${message}\n位置: 第 ${line} 行，第 ${column} 列`
}

function TimestampTool() {
  const [input, setInput] = useState(String(Date.now()))

  const result = useMemo(() => {
    const value = input.trim()
    const source = value || String(Date.now())
    const numeric = Number(source)

    if (!Number.isFinite(numeric)) {
      const parsed = Date.parse(source)

      if (Number.isNaN(parsed)) {
        return { output: '', error: '请输入秒级/毫秒级时间戳，或可被 Date.parse 识别的时间字符串。' }
      }

      return timestampOutput(new Date(parsed), '时间字符串')
    }

    const isSeconds = Math.abs(numeric) < 10_000_000_000
    return timestampOutput(new Date(isSeconds ? numeric * 1000 : numeric), isSeconds ? '秒级时间戳' : '毫秒级时间戳')
  }, [input])

  return (
    <ToolGrid>
      <Panel title="输入" actions={<button onClick={() => setInput(String(Date.now()))}>当前时间</button>}>
        <Textarea value={input} onChange={setInput} placeholder="例如 1717747200、1717747200000 或 2026-06-07T10:00:00Z" />
      </Panel>
      <Panel title="转换结果" actions={<CopyButton text={result.output} />}>
        <Output result={result} placeholder="时间转换结果会显示在这里" />
      </Panel>
    </ToolGrid>
  )
}

function Base64Tool() {
  const [input, setInput] = useState('DevKit 支持 UTF-8 文本')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const result = useMemo<TransformResult>(() => {
    if (!input) {
      return { output: '' }
    }

    try {
      return { output: mode === 'encode' ? encodeBase64(input) : decodeBase64(input) }
    } catch (error) {
      return { output: '', error: formatError(error) }
    }
  }, [input, mode])

  return (
    <ToolGrid>
      <Panel title="输入" actions={<ModeSwitch mode={mode} setMode={setMode} />}>
        <Textarea value={input} onChange={setInput} placeholder="输入要编码或解码的文本" />
      </Panel>
      <Panel title="输出" actions={<CopyButton text={result.output} />}>
        <Output result={result} placeholder="Base64 结果会显示在这里" />
      </Panel>
    </ToolGrid>
  )
}

function UrlTool() {
  const [input, setInput] = useState('https://example.com/search?q=DevKit 工具箱')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const result = useMemo<TransformResult>(() => {
    if (!input) {
      return { output: '' }
    }

    try {
      return { output: mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input) }
    } catch (error) {
      return { output: '', error: formatError(error) }
    }
  }, [input, mode])

  return (
    <ToolGrid>
      <Panel title="输入" actions={<ModeSwitch mode={mode} setMode={setMode} />}>
        <Textarea value={input} onChange={setInput} placeholder="输入 URL 或 URL 编码后的文本" />
      </Panel>
      <Panel title="输出" actions={<CopyButton text={result.output} />}>
        <Output result={result} placeholder="URL 编解码结果会显示在这里" />
      </Panel>
    </ToolGrid>
  )
}

function JwtTool() {
  const [input, setInput] = useState(sampleJwt)

  const result = useMemo<TransformResult>(() => decodeJwt(input), [input])

  return (
    <ToolGrid>
      <Panel title="JWT" actions={<ResetButton onClick={() => setInput(sampleJwt)} />}>
        <Textarea value={input} onChange={setInput} placeholder="粘贴 JWT token" />
        <p className="hint">仅解码 Header/Payload，不验证签名真实性。</p>
      </Panel>
      <Panel title="解码结果" actions={<CopyButton text={result.output} />}>
        <Output result={result} placeholder="JWT 解码结果会显示在这里" />
      </Panel>
    </ToolGrid>
  )
}

function HashTool() {
  const [input, setInput] = useState('DevKit')
  const [algorithm, setAlgorithm] = useState('SHA-256')
  const [result, setResult] = useState<TransformResult>({ output: '' })

  useEffect(() => {
    let alive = true

    async function run() {
      if (!input) {
        setResult({ output: '' })
        return
      }

      try {
        if (!crypto.subtle) {
          throw new Error('当前浏览器不支持 Web Crypto API。')
        }

        const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input))
        const output = Array.from(new Uint8Array(digest))
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('')

        if (alive) {
          setResult({ output })
        }
      } catch (error) {
        if (alive) {
          setResult({ output: '', error: formatError(error) })
        }
      }
    }

    void run()

    return () => {
      alive = false
    }
  }, [algorithm, input])

  return (
    <ToolGrid>
      <Panel
        title="输入"
        actions={
          <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}>
            <option>SHA-1</option>
            <option>SHA-256</option>
            <option>SHA-384</option>
            <option>SHA-512</option>
          </select>
        }
      >
        <Textarea value={input} onChange={setInput} placeholder="输入要计算 Hash 的文本" />
        {algorithm === 'SHA-1' ? <p className="hint warning">SHA-1 已不适合作为安全签名算法。</p> : null}
      </Panel>
      <Panel title="Hash" actions={<CopyButton text={result.output} />}>
        <Output result={result} placeholder="Hash 结果会显示在这里" />
      </Panel>
    </ToolGrid>
  )
}

function UuidTool() {
  const [count, setCount] = useState(5)
  const [result, setResult] = useState<TransformResult>(() => ({ output: generateUuids(5) }))

  function regenerate(nextCount = count) {
    try {
      setResult({ output: generateUuids(nextCount) })
    } catch (error) {
      setResult({ output: '', error: formatError(error) })
    }
  }

  return (
    <ToolGrid>
      <Panel
        title="生成设置"
        actions={<button onClick={() => regenerate()}>重新生成</button>}
      >
        <label className="field-label">
          生成数量
          <input
            max={100}
            min={1}
            type="number"
            value={count}
            onChange={(event) => {
              const nextCount = clamp(Number(event.target.value), 1, 100)
              setCount(nextCount)
              regenerate(nextCount)
            }}
          />
        </label>
        <p className="hint">使用浏览器 `crypto.randomUUID()`，最多一次生成 100 个。</p>
      </Panel>
      <Panel title="UUID v4" actions={<CopyButton text={result.output} />}>
        <Output result={result} placeholder="UUID 会显示在这里" />
      </Panel>
    </ToolGrid>
  )
}

function QrCodeTool() {
  const [input, setInput] = useState('https://example.com')
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    async function run() {
      if (!input.trim()) {
        setDataUrl('')
        setError('')
        return
      }

      if (input.length > 1024) {
        setDataUrl('')
        setError('二维码内容过长，建议控制在 1024 个字符以内。')
        return
      }

      try {
        const nextDataUrl = await QRCode.toDataURL(input, {
          margin: 1,
          width: 256,
          color: {
            dark: '#111827',
            light: '#ffffff',
          },
        })

        if (alive) {
          setDataUrl(nextDataUrl)
          setError('')
        }
      } catch (caught) {
        if (alive) {
          setDataUrl('')
          setError(formatError(caught))
        }
      }
    }

    void run()

    return () => {
      alive = false
    }
  }, [input])

  return (
    <ToolGrid>
      <Panel title="文本或链接">
        <Textarea value={input} onChange={setInput} placeholder="输入要生成二维码的文本或链接" />
        <p className="hint">请自行确认二维码内容安全性，工具不会判断链接可信度。</p>
      </Panel>
      <Panel
        title="二维码"
        actions={
          dataUrl ? (
            <a download="devkit-qrcode.png" href={dataUrl} role="button">
              下载 PNG
            </a>
          ) : null
        }
      >
        {error ? <div className="error-box">{error}</div> : null}
        {dataUrl ? <img className="qr-image" src={dataUrl} alt="生成的二维码" /> : <div className="empty-state">二维码会显示在这里</div>}
      </Panel>
    </ToolGrid>
  )
}

function ToolGrid({ children }: { children: ReactNode }) {
  return <div className="tool-grid">{children}</div>
}

function Panel({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>{title}</h3>
        <div className="panel-actions">{actions}</div>
      </div>
      {children}
    </section>
  )
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <textarea spellCheck={false} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
}

function Output({ result, placeholder }: { result: TransformResult; placeholder: string }) {
  if (result.error) {
    return <div className="error-box">{result.error}</div>
  }

  if (!result.output) {
    return <div className="empty-state">{placeholder}</div>
  }

  return <pre className="output-box">{result.output}</pre>
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!text) {
      return
    }

    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button disabled={!text} onClick={copy} type="button">
      <Copy size={15} />
      {copied ? '已复制' : '复制'}
    </button>
  )
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} type="button">
      <RotateCcw size={15} />
      示例
    </button>
  )
}

function ModeSwitch({ mode, setMode }: { mode: 'encode' | 'decode'; setMode: (mode: 'encode' | 'decode') => void }) {
  return (
    <div className="segmented">
      <button className={mode === 'encode' ? 'active' : ''} onClick={() => setMode('encode')} type="button">
        编码
      </button>
      <button className={mode === 'decode' ? 'active' : ''} onClick={() => setMode('decode')} type="button">
        解码
      </button>
    </div>
  )
}

function timestampOutput(date: Date, source: string): TransformResult {
  if (Number.isNaN(date.getTime())) {
    return { output: '', error: '无效时间。' }
  }

  const ms = date.getTime()
  const seconds = Math.floor(ms / 1000)

  return {
    output: [
      `识别类型: ${source}`,
      `秒级时间戳: ${seconds}`,
      `毫秒级时间戳: ${ms}`,
      `本地时间: ${date.toLocaleString()}`,
      `UTC 时间: ${date.toUTCString()}`,
      `ISO 时间: ${date.toISOString()}`,
    ].join('\n'),
  }
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary)
}

function decodeBase64(value: string) {
  const binary = atob(value.trim())
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

function decodeJwt(value: string): TransformResult {
  const token = value.trim()

  if (!token) {
    return { output: '' }
  }

  const parts = token.split('.')

  if (parts.length < 2) {
    return { output: '', error: 'JWT 至少需要 Header 和 Payload 两段。' }
  }

  try {
    const header = parseBase64UrlJson(parts[0])
    const payload = parseBase64UrlJson(parts[1])
    const expiresAt = typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null

    return {
      output: [
        'Header',
        JSON.stringify(header, null, 2),
        '',
        'Payload',
        JSON.stringify(payload, null, 2),
        '',
        expiresAt ? `过期时间: ${expiresAt.toLocaleString()} (${expiresAt.toISOString()})` : '过期时间: 未包含 exp 字段',
        '签名验证: 未验证',
      ].join('\n'),
    }
  } catch (error) {
    return { output: '', error: formatError(error) }
  }
}

function parseBase64UrlJson(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')

  return JSON.parse(decodeBase64(padded)) as Record<string, unknown>
}

function generateUuids(count: number) {
  if (!crypto.randomUUID) {
    throw new Error('当前浏览器不支持 crypto.randomUUID()。')
  }

  return Array.from({ length: count }, () => crypto.randomUUID()).join('\n')
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
