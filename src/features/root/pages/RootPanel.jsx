// ─── ROOT CONTROL CENTER ───────────────────────────────────────────────────
// Superadmin panel — /sap URL orqali kiriladi.
// Terminal uslubi: qora fon, yashil matn, monospace shrift.
// Yangilangan: sidebar navigatsiya, server monitor, live activity, xavfsizlik.
import { useState, useEffect, useCallback, useRef } from 'react'

import {
  rootLogin, rootLogout, rootMe,
  getRootStats, getRootCollections, getRootCollection,
  createRootDocument, updateRootDocument, deleteRootDocument, wipeRootCollection,
  resetUserPassword,
  getSystemStatus, getLiveActivity, getApiMonitor, getSecurity, getJobsStatus,
} from '../api'

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────
const MONO = { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace" }
const GREEN = '#00ff41'
const GREEN_DIM = '#00b32d'
const CYAN = '#00e5ff'
const RED = '#ff3333'
const YELLOW = '#ffd24d'
const BORDER = '#222'
const BORDER_LIGHT = '#333'

const inputCls = 'w-full bg-black px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500'
const btnGreen = 'border px-3 py-1.5 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-40'
const btnGhost = 'border px-3 py-1.5 text-sm text-gray-300 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50 transition-colors'
const navItem = 'flex items-center gap-2 border-l-2 px-3 py-2 text-xs transition-all cursor-pointer select-none'

// ─── SIDEBAR SECTIONS ─────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview', icon: '◈', label: 'OVERVIEW' },
  { id: 'database', icon: '⬡', label: 'DATABASE' },
  { id: 'security', icon: '◉', label: 'SECURITY' },
  { id: 'api', icon: '△', label: 'API MONITOR' },
  { id: 'jobs', icon: '◇', label: 'JOBS' },
  { id: 'danger', icon: '⚠', label: 'DANGER', danger: true },
]

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────
function Prompt({ children, path = '~' }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-green-500">root@restoflow</span>
      <span className="text-white">:</span>
      <span className="text-green-400">{path}</span>
      <span className="text-white">$ </span>
      {children}
    </span>
  )
}

function BlinkCursor() {
  return <span className="inline-block w-2 animate-pulse bg-green-500 align-middle" style={{ height: '1em' }} />
}

function StatusDot({ ok }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
}

function Bar({ percent, color = GREEN, width = 100 }) {
  const filled = Math.min(100, Math.max(0, percent || 0))
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1" style={{ height: 6, background: BORDER, maxWidth: width }}>
        <div style={{ height: '100%', width: `${filled}%`, background: color, transition: 'width 0.3s' }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color, minWidth: 32, textAlign: 'right' }}>
        {filled}%
      </span>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-gray-500">
      {children}
    </div>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`border p-4 ${className}`} style={{ borderColor: BORDER }}>
      {children}
    </div>
  )
}

function timeAgo(date) {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function RootPanel() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  // login
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  // navigation
  const [activeSection, setActiveSection] = useState('overview')

  // data
  const [stats, setStats] = useState(null)
  const [collections, setCollections] = useState([])
  const [sysStatus, setSysStatus] = useState(null)
  const [liveActivity, setLiveActivity] = useState([])
  const [apiMonitor, setApiMonitor] = useState(null)
  const [security, setSecurity] = useState(null)
  const [jobs, setJobs] = useState(null)

  // collection browser
  const [activeKey, setActiveKey] = useState(null)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  // editor
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorId, setEditorId] = useState(null)
  const [editorJson, setEditorJson] = useState('')
  const [editorError, setEditorError] = useState('')
  const [saving, setSaving] = useState(false)

  // password reset
  const [passwordResult, setPasswordResult] = useState(null)

  // auto-refresh timer
  const refreshRef = useRef(null)

  const handleError = useCallback((e) => {
    const msg = e?.response?.data?.message || e?.message || 'Xatolik yuz berdi'
    if (e?.response?.status === 401 || e?.response?.status === 403) {
      rootLogout()
      setUser(null)
    }
    setNotice(`ERR: ${msg}`)
  }, [])

  // ─── INIT ────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    rootMe()
      .then((me) => { if (alive) setUser(me) })
      .catch(() => { if (alive) rootLogout() })
      .finally(() => { if (alive) setChecking(false) })
    return () => { alive = false }
  }, [])

  // ─── LOAD DASHBOARD DATA ─────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    try {
      const [s, c, sys, act, api, sec, j] = await Promise.allSettled([
        getRootStats(),
        getRootCollections(),
        getSystemStatus(),
        getLiveActivity(20),
        getApiMonitor(),
        getSecurity(),
        getJobsStatus(),
      ])
      if (s.status === 'fulfilled') setStats(s.value)
      if (c.status === 'fulfilled') setCollections(c.value)
      if (sys.status === 'fulfilled') setSysStatus(sys.value)
      if (act.status === 'fulfilled') setLiveActivity(act.value)
      if (api.status === 'fulfilled') setApiMonitor(api.value)
      if (sec.status === 'fulfilled') setSecurity(sec.value)
      if (j.status === 'fulfilled') setJobs(j.value)
    } catch (e) { handleError(e) }
  }, [handleError])

  useEffect(() => {
    if (user) {
      loadDashboard()
      // Auto-refresh every 30s
      refreshRef.current = setInterval(loadDashboard, 30000)
      return () => clearInterval(refreshRef.current)
    }
  }, [user, loadDashboard])

  // ─── COLLECTION BROWSER ──────────────────────────────────────────────
  const loadItems = useCallback(async (key, opts = {}) => {
    if (!key) return
    setLoading(true)
    try {
      const res = await getRootCollection(key, {
        search: opts.search ?? search,
        page: opts.page ?? page,
        limit: 25,
      })
      setItems(res.items)
      setPagination(res.pagination)
    } catch (e) { handleError(e) } finally { setLoading(false) }
  }, [search, page, handleError])

  useEffect(() => {
    if (user && activeKey) loadItems(activeKey)
  }, [user, activeKey, page, search, loadItems])

  // ─── HANDLERS ────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')
    try {
      const me = await rootLogin(identifier.trim(), password)
      setUser(me)
      setPassword('')
    } catch (err) {
      setLoginError(err?.response?.data?.message || 'Kirish amalga oshmadi')
    } finally { setLoggingIn(false) }
  }

  function flash(msg) {
    setNotice(msg)
    clearTimeout(flash._t)
    flash._t = setTimeout(() => setNotice(''), 4000)
  }

  function openCreate() {
    setEditorId(null)
    setEditorJson('{\n  \n}')
    setEditorError('')
    setEditorOpen(true)
  }

  function openEdit(doc) {
    setEditorId(doc._id)
    const { _id, ...rest } = doc
    setEditorJson(JSON.stringify(rest, null, 2))
    setEditorError('')
    setEditorOpen(true)
  }

  async function handleSave() {
    let body
    try { body = JSON.parse(editorJson) } catch (e) { setEditorError(`JSON xato: ${e.message}`); return }
    setSaving(true)
    try {
      if (editorId) {
        await updateRootDocument(activeKey, editorId, body)
        flash('OK: yangilandi')
      } else {
        await createRootDocument(activeKey, body)
        flash('OK: yaratildi')
      }
      setEditorOpen(false)
      loadItems(activeKey)
      loadDashboard()
    } catch (e) { handleError(e) } finally { setSaving(false) }
  }

  async function handleDelete(doc) {
    const label = doc.name || doc.title || doc.email || doc._id
    if (!window.confirm(`rm "${label}"\n\nRostdan ham o'chirilsinmi?`)) return
    try {
      await deleteRootDocument(activeKey, doc._id)
      flash(`rm: o'chirildi [${label}]`)
      loadItems(activeKey)
      loadDashboard()
    } catch (e) { handleError(e) }
  }

  async function handleResetPassword(doc) {
    const label = doc.name || doc.email
    const custom = window.prompt(
      `passwd: ${label}\n\n` +
      "Bo'sh qoldirsangiz — avtomatik parol generatsiya qilinadi.\n" +
      'Yoki parolni yozing (kamida 6 belgi):'
    )
    if (custom === null) return
    if (custom && custom.length < 6) { flash('ERR: parol kamida 6 belgi'); return }
    try {
      const res = await resetUserPassword(doc._id, custom || null)
      setPasswordResult({ user: res, password: res.newPassword })
      loadItems(activeKey)
    } catch (e) { handleError(e) }
  }

  async function handleWipe(key) {
    if (!window.confirm(`!! DANGER ZONE !!\n\nrm -rf /${key} — BARCHA yozuvlar o'chiriladi!\n\nDavom etasizmi?`)) return
    const typed = window.prompt(`Tasdiqlash: kolleksiya nomini yozing: ${key}`)
    if (typed !== key) { flash('ERR: bekor qilindi'); return }
    try {
      const res = await wipeRootCollection(key)
      flash(`rm -rf /${key}: ${res.deleted} o'chirildi`)
      loadDashboard()
      if (activeKey === key) loadItems(key)
    } catch (e) { handleError(e) }
  }

  // ─── BOOT SCREEN ─────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-black text-sm" style={MONO}>
        <pre className="text-green-500">{`> initializing root control center...`}</pre>
        <BlinkCursor />
      </div>
    )
  }

  // ─── LOGIN SCREEN ────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4" style={MONO}>
        <form onSubmit={handleLogin} className="w-full max-w-md">
          <div className="border" style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: BORDER }}>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-500">root@restoflow: ~/auth</span>
            </div>
            <div className="space-y-4 p-6">
              <pre className="text-xs leading-5 text-green-500">{String.raw`  ____              _____
 |  _ \\ ___ _ __   |_   _|__  __ _ _ __ ___
 | |_) / _ \\ '_ \\    | |/ _ \\/ _` + "`" + String.raw` | '_ ' _ \\
 |  _ <  __/ | | |   | |  __/ (_| | | | | | |
 |_| \\_\\___|_| |_|   |_|\\___|\\__,_|_| |_| |_|
        R E S T O F L O W   ·   CONTROL CENTER`}</pre>
              <div className="text-xs text-gray-500">
                <Prompt path="auth"><span className="text-white">sudo login --root</span></Prompt>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-widest text-gray-500">login</label>
                <input type="text" className={`${inputCls} border`} style={{ borderColor: BORDER }}
                  placeholder="root@restoflow.uz" value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-widest text-gray-500">password</label>
                <input type="password" className={`${inputCls} border`} style={{ borderColor: BORDER }}
                  placeholder="********" value={password}
                  onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              {loginError && (
                <p className="border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-400">
                  auth failed: {loginError}
                </p>
              )}
              <button type="submit" disabled={loggingIn} className={`${btnGreen} w-full py-2.5`}
                style={{ background: GREEN, borderColor: GREEN }}>
                {loggingIn ? 'AUTHENTICATING...' : '[ ENTER CONTROL CENTER ]'}
              </button>
              <div className="text-xs text-gray-600"><Prompt path="auth" /><BlinkCursor /></div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  // ─── MAIN CONTROL CENTER ─────────────────────────────────────────────
  const wipeableKeys = new Set(collections.filter((c) => c.wipeable).map((c) => c.key))

  return (
    <div className="flex min-h-screen bg-black text-gray-200" style={MONO}>
      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className="sticky top-0 flex h-screen w-52 flex-col border-r bg-black/95" style={{ borderColor: BORDER }}>
        {/* Logo */}
        <div className="border-b px-4 py-3" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <span className="text-xs font-bold text-white">ROOT</span>
          </div>
          <p className="mt-1 truncate text-[10px] text-green-500">{user.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          <SectionTitle px="px-4">Sections</SectionTitle>
          {SECTIONS.map((s) => (
            <div key={s.id}
              onClick={() => { setActiveSection(s.id); if (s.id !== 'database') setActiveKey(null) }}
              className={`${navItem} ${
                activeSection === s.id
                  ? s.danger ? 'border-red-500 bg-red-950/30 text-red-400' : 'border-green-500 bg-green-950/20 text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}>
              <span className="w-4 text-center">{s.icon}</span>
              <span>{s.label}</span>
            </div>
          ))}

          {/* Collection shortcuts */}
          <SectionTitle px="px-4 mt-4">Collections</SectionTitle>
          {collections.slice(0, 10).map((c) => (
            <div key={c.key}
              onClick={() => { setActiveSection('database'); setActiveKey(c.key); setSearch(''); setPage(1); setItems([]); setPagination(null) }}
              className={`${navItem} ${
                activeSection === 'database' && activeKey === c.key
                  ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400'
                  : 'border-transparent text-gray-600 hover:text-gray-400 hover:border-gray-700'
              }`}>
              <span className="w-4 text-center text-[10px]">{'>'}</span>
              <span className="truncate">{c.label}</span>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t px-4 py-2" style={{ borderColor: BORDER }}>
          <button onClick={() => { rootLogout(); setUser(null) }}
            className="w-full text-left text-[10px] text-gray-500 hover:text-red-400 transition-colors">
            ⏻ exit
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Header bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-black/95 px-6 py-2 backdrop-blur" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-white">RESTOFLOW ROOT</span>
            <span className="text-gray-600">·</span>
            <StatusDot ok={sysStatus?.server?.status === 'ONLINE'} />
            <span className={sysStatus?.server?.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}>
              {sysStatus?.server?.status || 'CHECKING'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span>uptime {sysStatus?.server?.uptimeSeconds ? `${Math.floor(sysStatus.server.uptimeSeconds / 3600)}h` : '—'}</span>
            <span>·</span>
            <span>{stats?.db?.name || '—'}</span>
            <StatusDot ok={stats?.db?.state === 'connected'} />
          </div>
        </header>

        {/* Notice */}
        {notice && (
          <div className="border-b px-6 py-2 text-xs" style={{ borderColor: BORDER }}>
            <span className={notice.startsWith('ERR') ? 'text-red-400' : 'text-green-400'}>
              {notice.startsWith('ERR') ? '✗ ' : '✓ '}{notice}
            </span>
          </div>
        )}

        <div className="p-6">

          {/* ════════════════════════════════════════════════════════════════
              OVERVIEW SECTION
             ════════════════════════════════════════════════════════════════ */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* System Status */}
              <section>
                <SectionTitle>◈ System Status</SectionTitle>
                <div className="grid grid-cols-2 gap-px lg:grid-cols-4" style={{ background: BORDER }}>
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Server</p>
                    <p className="mt-1 text-lg font-bold" style={{ color: GREEN }}>
                      <StatusDot ok /> ONLINE
                    </p>
                    <p className="mt-1 text-[10px] text-gray-600">{sysStatus?.server?.hostname || '—'}</p>
                  </Card>
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Database</p>
                    <p className="mt-1 text-lg font-bold" style={{ color: stats?.db?.state === 'connected' ? GREEN : RED }}>
                      <StatusDot ok={stats?.db?.state === 'connected'} /> {stats?.db?.state?.toUpperCase() || '...'}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-600">mongodb {stats?.db?.version || '—'}</p>
                  </Card>
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Node.js</p>
                    <p className="mt-1 text-lg font-bold" style={{ color: CYAN }}>{sysStatus?.node?.version || '—'}</p>
                    <p className="mt-1 text-[10px] text-gray-600">PID {sysStatus?.node?.pid || '—'}</p>
                  </Card>
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Platform</p>
                    <p className="mt-1 text-lg font-bold text-white">{sysStatus?.server?.platform || '—'}</p>
                    <p className="mt-1 text-[10px] text-gray-600">{sysStatus?.server?.arch || '—'}</p>
                  </Card>
                </div>
              </section>

              {/* Resource Bars */}
              <section>
                <SectionTitle>◈ Resources</SectionTitle>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <Card className="bg-black">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase text-gray-500">CPU</span>
                      <span className="text-[10px] text-gray-600">{sysStatus?.cpu?.cores || 0} cores · load {sysStatus?.cpu?.loadAverage?.[0] || 0}</span>
                    </div>
                    <Bar percent={sysStatus?.cpu?.percent} />
                  </Card>
                  <Card className="bg-black">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase text-gray-500">RAM</span>
                      <span className="text-[10px] text-gray-600">{sysStatus?.memory?.usedMB || 0} / {sysStatus?.memory?.totalMB || 0} MB</span>
                    </div>
                    <Bar percent={sysStatus?.memory?.percent} color={sysStatus?.memory?.percent > 80 ? RED : GREEN} />
                  </Card>
                  <Card className="bg-black">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase text-gray-500">DISK</span>
                      <span className="text-[10px] text-gray-600">{sysStatus?.disk?.usedGB || 0} / {sysStatus?.disk?.totalGB || 0} GB</span>
                    </div>
                    <Bar percent={sysStatus?.disk?.percent} color={sysStatus?.disk?.percent > 85 ? RED : CYAN} />
                  </Card>
                </div>
              </section>

              {/* Database Collections Quick View */}
              <section>
                <SectionTitle>⬡ Database Collections</SectionTitle>
                <div className="grid grid-cols-3 gap-px sm:grid-cols-5 lg:grid-cols-8" style={{ background: BORDER }}>
                  {stats?.collections?.map((c) => (
                    <div key={c.name} className="cursor-pointer bg-black p-3 hover:bg-green-950/20 transition-colors"
                      onClick={() => { setActiveSection('database'); setActiveKey(c.name); setSearch(''); setPage(1) }}>
                      <p className="truncate text-[9px] uppercase tracking-wider text-gray-500">{c.name}</p>
                      <p className="text-xl font-bold" style={{ color: GREEN }}>
                        {String(c.count).padStart(2, '0')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Live Activity */}
              <section>
                <SectionTitle>◉ Live Activity (last 20)</SectionTitle>
                <Card className="bg-black max-h-72 overflow-y-auto">
                  {liveActivity.length === 0 && <p className="text-xs text-gray-600">No recent activity</p>}
                  {liveActivity.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 border-b py-2 text-xs last:border-0" style={{ borderColor: BORDER }}>
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                      <div className="flex-1 min-w-0">
                        <span className="text-green-400">{a.action}</span>
                        <span className="text-gray-600"> · </span>
                        <span className="text-gray-400">{a.entity || '—'}</span>
                        {a.user && (
                          <><span className="text-gray-600"> · </span><span className="text-gray-300">{a.user.name}</span></>
                        )}
                      </div>
                      <span className="flex-shrink-0 text-[10px] text-gray-600">{timeAgo(a.timestamp)}</span>
                    </div>
                  ))}
                </Card>
              </section>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              DATABASE SECTION
             ════════════════════════════════════════════════════════════════ */}
          {activeSection === 'database' && (
            <div>
              {activeKey ? (
                <section>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500"><Prompt path={activeKey} /></span>
                    <input className={`${inputCls} max-w-xs border`} style={{ borderColor: BORDER }}
                      placeholder="grep -i 'qidirish...'" value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
                    <button onClick={openCreate} className={btnGhost}>+ new</button>
                    <button onClick={() => loadItems(activeKey)} className={btnGhost}>refresh</button>
                    {wipeableKeys.has(activeKey) && (
                      <button onClick={() => handleWipe(activeKey)}
                        className="border border-red-900 px-2.5 py-1 text-xs text-red-400 hover:bg-red-950">
                        rm -rf
                      </button>
                    )}
                    {pagination && (
                      <span className="ml-auto text-[10px] text-gray-500">
                        total <span style={{ color: GREEN }}>{pagination.total}</span> · page{' '}
                        <span style={{ color: GREEN }}>{pagination.page}</span>/{pagination.pages || 1}
                      </span>
                    )}
                  </div>

                  <div className="border overflow-x-auto" style={{ borderColor: BORDER }}>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-950 text-[10px] uppercase tracking-widest text-gray-500">
                        <tr>
                          <th className="border-b px-3 py-2" style={{ borderColor: BORDER }}>_id</th>
                          <th className="border-b px-3 py-2" style={{ borderColor: BORDER }}>data</th>
                          <th className="w-44 border-b px-3 py-2" style={{ borderColor: BORDER }}>actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && (
                          <tr><td colSpan={3} className="px-3 py-8 text-center text-green-500">loading<span className="animate-pulse">...</span></td></tr>
                        )}
                        {!loading && items.length === 0 && (
                          <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-600">0 rows</td></tr>
                        )}
                        {!loading && items.map((doc) => (
                          <tr key={doc._id} className="hover:bg-green-950/20">
                            <td className="border-b px-3 py-1.5 text-[10px] text-green-600" style={{ borderColor: BORDER }}>{doc._id?.slice(-12)}</td>
                            <td className="max-w-md truncate border-b px-3 py-1.5 text-[11px] text-gray-400" style={{ borderColor: BORDER }}>
                              {JSON.stringify(doc, null, 0).slice(0, 150)}...
                            </td>
                            <td className="border-b px-3 py-1.5" style={{ borderColor: BORDER }}>
                              <div className="flex gap-1">
                                <button onClick={() => openEdit(doc)} className="border px-1.5 py-0.5 text-[10px] text-gray-300 hover:border-green-500 hover:text-green-400" style={{ borderColor: BORDER_LIGHT }}>edit</button>
                                {activeKey === 'users' && (
                                  <button onClick={() => handleResetPassword(doc)} className="border px-1.5 py-0.5 text-[10px] hover:border-yellow-500 hover:text-yellow-400" style={{ borderColor: '#7a5c00', color: YELLOW }}>passwd</button>
                                )}
                                <button onClick={() => handleDelete(doc)} className="border px-1.5 py-0.5 text-[10px] text-red-400 hover:bg-red-950" style={{ borderColor: '#661111' }}>rm</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pagination && pagination.pages > 1 && (
                    <div className="mt-3 flex justify-center gap-2">
                      <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={btnGhost}>← prev</button>
                      <span className="px-2 py-1.5 text-[10px] text-gray-500">
                        <span style={{ color: GREEN }}>{page}</span> / {pagination.pages}
                      </span>
                      <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className={btnGhost}>next →</button>
                    </div>
                  )}
                </section>
              ) : (
                <Card className="bg-black">
                  <Prompt path="db"><span className="text-white">select a collection from sidebar</span></Prompt>
                  <p className="mt-2 text-[11px] text-gray-600">Restoranlar · Taomlar · Xodimlar · Buyurtmalar — hammasi boshqariladi</p>
                </Card>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              SECURITY SECTION
             ════════════════════════════════════════════════════════════════ */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              {/* Users Overview */}
              <section>
                <SectionTitle>◉ Users & Sessions</SectionTitle>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Total Users</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: GREEN }}>{security?.users?.total || 0}</p>
                  </Card>
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Active</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: GREEN }}>{security?.users?.active || 0}</p>
                  </Card>
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Inactive</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: YELLOW }}>{security?.users?.inactive || 0}</p>
                  </Card>
                </div>
              </section>

              {/* Role Distribution */}
              <section>
                <SectionTitle>◉ Role Distribution</SectionTitle>
                <Card className="bg-black">
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                    {security?.roles?.map((r) => (
                      <div key={r.role}>
                        <p className="text-[10px] uppercase text-gray-500">{r.role}</p>
                        <p className="text-lg font-bold" style={{ color: r.role === 'root' ? YELLOW : GREEN }}>{r.count}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>

              {/* Root Sessions */}
              <section>
                <SectionTitle>◉ Root Sessions</SectionTitle>
                <Card className="bg-black">
                  {security?.rootSessions?.length === 0 && <p className="text-xs text-gray-600">No root sessions</p>}
                  {security?.rootSessions?.map((s, i) => (
                    <div key={i} className="flex items-center justify-between border-b py-2 text-xs last:border-0" style={{ borderColor: BORDER }}>
                      <div>
                        <span className="text-green-400">{s.user}</span>
                        <span className="text-gray-600"> · </span>
                        <span className="text-gray-500">{s.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">IP: {s.ip || '—'}</span>
                        <span className="text-[10px] text-gray-500">{timeAgo(s.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </Card>
              </section>

              {/* Recent Security Events */}
              <section>
                <SectionTitle>◉ Security Events (24h)</SectionTitle>
                <Card className="bg-black max-h-60 overflow-y-auto">
                  {security?.logins?.failed?.length === 0 && <p className="text-xs text-gray-600">No security events</p>}
                  {security?.logins?.failed?.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 border-b py-2 text-xs last:border-0" style={{ borderColor: BORDER }}>
                      <span className="text-yellow-400">⚠</span>
                      <span className="text-gray-300">{f.action}</span>
                      <span className="text-gray-500">by {f.user}</span>
                      <span className="text-gray-600">IP: {f.ip || '—'}</span>
                      <span className="ml-auto text-[10px] text-gray-600">{timeAgo(f.timestamp)}</span>
                    </div>
                  ))}
                </Card>
              </section>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              API MONITOR SECTION
             ════════════════════════════════════════════════════════════════ */}
          {activeSection === 'api' && (
            <div className="space-y-6">
              <section>
                <SectionTitle>△ API Summary</SectionTitle>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Total Requests</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: GREEN }}>{apiMonitor?.summary?.totalRequests?.toLocaleString() || 0}</p>
                  </Card>
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Last Hour</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: CYAN }}>{apiMonitor?.summary?.requestsLastHour || 0}</p>
                  </Card>
                  <Card className="bg-black">
                    <p className="text-[10px] uppercase text-gray-500">Action Types</p>
                    <p className="mt-1 text-2xl font-bold text-white">{apiMonitor?.topActions?.length || 0}</p>
                  </Card>
                </div>
              </section>

              <section>
                <SectionTitle>△ Top Actions</SectionTitle>
                <Card className="bg-black">
                  {apiMonitor?.topActions?.map((a, i) => (
                    <div key={i} className="flex items-center justify-between border-b py-1.5 text-xs last:border-0" style={{ borderColor: BORDER }}>
                      <span className="text-gray-300 font-mono">{a.action}</span>
                      <span className="font-bold" style={{ color: GREEN }}>{a.count.toLocaleString()}</span>
                    </div>
                  ))}
                </Card>
              </section>

              {apiMonitor?.recentErrors?.length > 0 && (
                <section>
                  <SectionTitle>△ Recent Errors (24h)</SectionTitle>
                  <Card className="bg-black max-h-60 overflow-y-auto">
                    {apiMonitor.recentErrors.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 border-b py-2 text-xs last:border-0" style={{ borderColor: BORDER }}>
                        <span className="text-red-400">✗</span>
                        <span className="text-gray-300">{e.action}</span>
                        <span className="text-gray-500">· {e.entity || '—'}</span>
                        <span className="text-gray-600">by {e.user}</span>
                        <span className="ml-auto text-[10px] text-gray-600">{timeAgo(e.timestamp)}</span>
                      </div>
                    ))}
                  </Card>
                </section>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              JOBS SECTION
             ════════════════════════════════════════════════════════════════ */}
          {activeSection === 'jobs' && (
            <div className="space-y-6">
              <section>
                <SectionTitle>◇ Background Jobs</SectionTitle>
                <Card className="bg-black">
                  {jobs?.jobs?.map((j, i) => (
                    <div key={i} className="flex items-center justify-between border-b py-3 text-xs last:border-0" style={{ borderColor: BORDER }}>
                      <div className="flex items-center gap-3">
                        <StatusDot ok={j.status === 'ok' || j.status === 'idle' || j.status === 'active'} />
                        <span className="text-gray-300">{j.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase ${
                          j.status === 'ok' ? 'text-green-500' :
                          j.status === 'active' ? 'text-cyan-400' :
                          j.status === 'needs_cleanup' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{j.status}</span>
                        <span className="text-[10px] text-gray-600">{j.detail}</span>
                      </div>
                    </div>
                  ))}
                </Card>
              </section>

              <section>
                <SectionTitle>◇ Health Summary</SectionTitle>
                <Card className="bg-black">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-green-400">✓ {jobs?.summary?.healthy || 0} healthy</span>
                    {jobs?.summary?.warnings > 0 && <span className="text-yellow-400">⚠ {jobs.summary.warnings} warning</span>}
                  </div>
                </Card>
              </section>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              DANGER ZONE
             ════════════════════════════════════════════════════════════════ */}
          {activeSection === 'danger' && (
            <div className="space-y-6">
              <section className="border border-red-900 bg-red-950/20 p-6">
                <h3 className="text-sm font-bold text-red-400">⚠ DANGER ZONE</h3>
                <p className="mt-2 text-xs leading-5 text-red-300/60">
                  Bu yerda barcha kolleksiyalarni to'liq tozash mumkin. Har bir amal audit logga yoziladi va qaytarilmaydi.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {collections.filter((c) => c.wipeable).map((c) => (
                    <button key={c.key} onClick={() => handleWipe(c.key)}
                      className="border border-red-900 bg-red-950/40 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-950 transition-colors">
                      <span className="block font-bold">rm -rf /{c.key}</span>
                      <span className="text-[10px] text-red-300/40">{c.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

        </div>
      </main>

      {/* ── MODALS ─────────────────────────────────────────────────────── */}

      {/* Password Result Modal */}
      {passwordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPasswordResult(null)}>
          <div className="w-full max-w-md border border-green-600 bg-black p-6 shadow-[0_0_30px_rgba(0,255,65,0.15)]" onClick={(e) => e.stopPropagation()} style={MONO}>
            <h3 className="text-sm text-green-400">✓ parol almashtirildi</h3>
            <p className="mt-1 text-xs text-gray-400">
              {passwordResult.user.name} ({passwordResult.user.email}) uchun yangi parol:
            </p>
            <div className="mt-3 border border-green-600 bg-green-950/20 p-4 text-center">
              <p className="select-all text-2xl font-bold" style={{ color: GREEN }}>{passwordResult.password}</p>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-red-400">
              ⚠ bu parol BOSHQA KO'RSATILMAYDI — hozir saqlang.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { navigator.clipboard?.writeText(passwordResult.password); flash('cp: clipboard') }} className={btnGhost}>copy</button>
              <button onClick={() => setPasswordResult(null)} className={btnGreen} style={{ background: GREEN, borderColor: GREEN }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setEditorOpen(false)}>
          <div className="w-full max-w-2xl border bg-black shadow-[0_0_30px_rgba(0,255,65,0.1)]" onClick={(e) => e.stopPropagation()} style={{ borderColor: BORDER, ...MONO }}>
            <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: BORDER }}>
              <span className="text-xs text-gray-500">
                {editorId ? `vim ${activeKey}/${editorId.slice(-8)}.json` : `new > ${activeKey}.json`}
              </span>
              <span className="text-[10px] text-gray-600">-- INSERT --</span>
            </div>
            <div className="p-4">
              <textarea className="h-80 w-full border bg-black p-3 text-xs leading-5 outline-none focus:border-green-500"
                style={{ borderColor: BORDER, color: GREEN }} value={editorJson}
                onChange={(e) => setEditorJson(e.target.value)} spellCheck={false} />
              {editorError && (
                <p className="mt-2 border border-red-900 bg-red-950/40 px-3 py-1.5 text-xs text-red-400">parse error: {editorError}</p>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => setEditorOpen(false)} className={btnGhost}>:q!</button>
                <button onClick={handleSave} disabled={saving} className={btnGreen} style={{ background: GREEN, borderColor: GREEN }}>
                  {saving ? 'writing...' : ':wq — save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
