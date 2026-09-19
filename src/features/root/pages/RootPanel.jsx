// ─── ROOT (SUPERADMIN) PANEL — TERMINAL UI ───────────────────────────────
// Bu sahifa sidebar'da KO'RINMAYDI va faqat bilgan odam URL orqali kiradi:
//   /sap  (Super Admin Panel)
//
// UI: terminal uslubi — qora fon, oq matn, yashil raqamlar/aktsentlar,
// monospace shrift. Logika avvalgi bilan bir xil.
import { useState, useEffect, useCallback } from 'react'

import {
  rootLogin, rootLogout, rootMe,
  getRootStats, getRootCollections, getRootCollection,
  createRootDocument, updateRootDocument, deleteRootDocument, wipeRootCollection,
  resetUserPassword,
} from '../api'

// ─── TERMINAL STYLE CONSTANTS ────────────────────────────────────────────
const MONO = { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace" }
const GREEN = '#00ff41'
const GREEN_DIM = '#00b32d'
const BORDER = '#333'

const inputCls = 'w-full bg-black px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500'
const btnGreen = 'border px-3 py-1.5 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-40'
const btnGhost = 'border px-3 py-1.5 text-sm text-gray-300 hover:bg-green-500 hover:text-black hover:border-green-500 transition-colors'

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

export default function RootPanel() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  // login form — email YOKI telefon
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  // panel data
  const [stats, setStats] = useState(null)
  const [collections, setCollections] = useState([])
  const [activeKey, setActiveKey] = useState(null)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  // editor
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorId, setEditorId] = useState(null) // null = create
  const [editorJson, setEditorJson] = useState('')
  const [editorError, setEditorError] = useState('')
  const [saving, setSaving] = useState(false)

  // password reset result (ko'rsatilgach yashiriladi)
  const [passwordResult, setPasswordResult] = useState(null)

  const handleError = useCallback((e) => {
    const msg = e?.response?.data?.message || e?.message || 'Xatolik yuz berdi'
    if (e?.response?.status === 401 || e?.response?.status === 403) {
      rootLogout()
      setUser(null)
    }
    setNotice(`ERR: ${msg}`)
  }, [])

  // Birinchi render'da token bor-yo'qligini tekshiramiz
  useEffect(() => {
    let alive = true
    rootMe()
      .then((me) => { if (alive) setUser(me) })
      .catch(() => { if (alive) rootLogout() })
      .finally(() => { if (alive) setChecking(false) })
    return () => { alive = false }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([getRootStats(), getRootCollections()])
      setStats(s)
      setCollections(c)
    } catch (e) { handleError(e) }
  }, [handleError])

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
    } finally {
      setLoggingIn(false)
    }
  }

  useEffect(() => {
    if (user) loadStats()
  }, [user, loadStats])

  useEffect(() => {
    if (user && activeKey) loadItems(activeKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeKey, page, search])

  function flash(msg) {
    setNotice(msg)
    window.clearTimeout(flash._t)
    flash._t = window.setTimeout(() => setNotice(''), 4000)
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
    try {
      body = JSON.parse(editorJson)
    } catch (e) {
      setEditorError(`JSON xato: ${e.message}`)
      return
    }
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
      loadStats()
    } catch (e) { handleError(e) } finally { setSaving(false) }
  }

  async function handleDelete(doc) {
    const label = doc.name || doc.title || doc.email || doc._id
    if (!window.confirm(`rm "${label}"\n\nRostdan ham o'chirilsinmi? Bu amal audit logga yoziladi va qaytarilmaydi.`)) return
    try {
      await deleteRootDocument(activeKey, doc._id)
      flash(`rm: o'chirildi [${label}]`)
      loadItems(activeKey)
      loadStats()
    } catch (e) { handleError(e) }
  }

  async function handleResetPassword(doc) {
    const label = doc.name || doc.email
    const custom = window.prompt(
      `passwd: ${label}\n\n` +
      'Bo\'sh qoldirsangiz — avtomatik xavfsiz parol generatsiya qilinadi.\n' +
      'Yoki o\'zingiz xohlagan parolni yozing (kamida 6 belgi):'
    )
    if (custom === null) return // bekor qildi
    if (custom && custom.length < 6) { flash('ERR: parol kamida 6 belgi'); return }
    try {
      const res = await resetUserPassword(doc._id, custom || null)
      setPasswordResult({ user: res, password: res.newPassword })
      loadItems(activeKey)
    } catch (e) { handleError(e) }
  }

  async function handleWipe(key) {
    if (!window.confirm(`!! DANGER ZONE !!\n\nrm -rf /${key} — kolleksiyadagi BARCHA yozuvlar o'chiriladi!\n\nDavom etasizmi?`)) return
    const typed = window.prompt(`Tasdiqlash uchun kolleksiya nomini yozing: ${key}`)
    if (typed !== key) { flash('ERR: bekor qilindi (nom mos kelmadi)'); return }
    try {
      const res = await wipeRootCollection(key)
      flash(`rm -rf /${key}: ${res.deleted} yozuv o'chirildi`)
      loadStats()
      if (activeKey === key) loadItems(key)
    } catch (e) { handleError(e) }
  }

  // ─── BOOT / CHECKING SCREEN ────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-black text-sm" style={MONO}>
        <pre className="text-green-500">{`> initializing root shell...`}</pre>
        <BlinkCursor />
      </div>
    )
  }

  // ─── LOGIN SCREEN (terminal) ───────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4" style={MONO}>
        <form onSubmit={handleLogin} className="w-full max-w-md">
          {/* terminal window chrome */}
          <div className="border" style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: BORDER }}>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-500">root@restoflow: ~/auth — ssh</span>
            </div>

            <div className="space-y-4 p-6">
              <pre className="text-xs leading-5 text-green-500">{String.raw`  ____              _____
 |  _ \ ___ _ __   |_   _|__  __ _ _ __ ___
 | |_) / _ \ '_ \    | |/ _ \/ _` + "`" + String.raw` | '_ ' _ \
 |  _ <  __/ | | |   | |  __/ (_| | | | | | |
 |_| \_\___|_| |_|   |_|\___|\__,_|_| |_| |_|
        R E S T O F L O W   ·   v1.0`}</pre>

              <div className="text-xs text-gray-500">
                <Prompt path="auth"><span className="text-white">sudo login --root</span></Prompt>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">login (email yoki telefon)</label>
                <input
                  type="text"
                  className={`${inputCls} border`}
                  style={{ borderColor: BORDER }}
                  placeholder="root@restoflow.uz"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">password</label>
                <input
                  type="password"
                  className={`${inputCls} border`}
                  style={{ borderColor: BORDER }}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {loginError && (
                <p className="border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-400">
                  auth failed: {loginError}
                </p>
              )}

              <button type="submit" disabled={loggingIn} className={`${btnGreen} w-full py-2.5`} style={{ background: GREEN, borderColor: GREEN }}>
                {loggingIn ? 'AUTHENTICATING...' : '[ ENTER ]'}
              </button>

              <div className="text-xs text-gray-600">
                <Prompt path="auth" />
                <BlinkCursor />
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  // ─── MAIN PANEL (terminal) ─────────────────────────────────────────────
  // Backend har kolleksiya uchun wipeable flag'ini yuboradi.
  const wipeableKeys = new Set(collections.filter((c) => c.wipeable).map((c) => c.key))
  const activeLabel = collections.find((c) => c.key === activeKey)?.label || activeKey

  return (
    <div className="min-h-screen bg-black text-gray-200" style={MONO}>
      {/* Header — terminal title bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-black/95 px-4 py-2 backdrop-blur" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white">ROOT SHELL</span>
            <span className="text-gray-600"> — </span>
            <span className="text-green-500">{user.email}</span>
            <span className="text-gray-600"> · {stats?.db?.name || '?'}</span>
            <span className={stats?.db?.state === 'connected' ? 'text-green-400' : 'text-red-400'}>
              {' '}[{stats?.db?.state || '...'}]
            </span>
          </div>
        </div>
        <button onClick={() => { rootLogout(); setUser(null) }} className={btnGhost}>
          exit
        </button>
      </header>

      {/* Notice — stdout line */}
      {notice && (
        <div className="border-b px-4 py-2 text-sm" style={{ borderColor: BORDER }}>
          <span className={notice.startsWith('ERR') ? 'text-red-400' : 'text-green-400'}>
            {notice.startsWith('ERR') ? '✗ ' : '✓ '}
            {notice}
          </span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* STATS — htop style grid */}
        <section className="mb-6">
          <div className="mb-2 text-xs uppercase tracking-widest text-gray-500">
            <Prompt path="stats">cat db_stats.txt</Prompt>
          </div>
          <div className="grid grid-cols-2 gap-px border sm:grid-cols-4 lg:grid-cols-6" style={{ borderColor: BORDER, background: BORDER }}>
            {stats?.collections?.map((c) => (
              <div key={c.name} className="bg-black p-3">
                <p className="truncate text-[10px] uppercase tracking-wider text-gray-500">{c.name}</p>
                <p className="text-xl font-bold" style={{ color: GREEN }}>
                  {String(c.count).padStart(2, '0')}
                </p>
              </div>
            ))}
          </div>
          {stats?.db && (
            <p className="mt-2 text-[11px] text-gray-600">
              server: <span className="text-green-500">{stats.db.host}</span> · mongodb {stats.db.version} · uptime{' '}
              <span className="text-green-500">{stats.db.uptimeSeconds != null ? `${Math.floor(stats.db.uptimeSeconds / 3600)}h ${Math.floor((stats.db.uptimeSeconds % 3600) / 60)}m` : '—'}</span>
            </p>
          )}
        </section>

        {/* COLLECTIONS — tab buttons */}
        <section className="mb-6">
          <div className="mb-2 text-xs uppercase tracking-widest text-gray-500">
            <Prompt path="db">ls collections/</Prompt>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {collections.map((c) => (
              <button
                key={c.key}
                onClick={() => { setActiveKey(c.key); setSearch(''); setPage(1); setItems([]); setPagination(null) }}
                className={`border px-2.5 py-1 text-xs transition-colors ${
                  activeKey === c.key
                    ? 'font-bold text-black'
                    : 'text-gray-400 hover:border-green-500 hover:text-green-400'
                }`}
                style={activeKey === c.key ? { background: GREEN, borderColor: GREEN } : { borderColor: BORDER }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* ACTIVE TABLE */}
        {activeKey && (
          <section>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">
                <Prompt path={activeKey} />
              </span>
              <input
                className={`${inputCls} max-w-xs border`}
                style={{ borderColor: BORDER }}
                placeholder="grep -i 'qidirish...'"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
              <button onClick={openCreate} className={btnGhost}>+ new</button>
              <button onClick={() => loadItems(activeKey)} className={btnGhost}>refresh</button>
              {wipeableKeys.has(activeKey) && (
                <button
                  onClick={() => handleWipe(activeKey)}
                  className="border border-red-800 px-2.5 py-1 text-xs text-red-400 hover:bg-red-950"
                >
                  rm -rf /* DANGER */
                </button>
              )}
              {pagination && (
                <span className="ml-auto text-xs text-gray-500">
                  total <span style={{ color: GREEN }}>{pagination.total}</span> · page{' '}
                  <span style={{ color: GREEN }}>{pagination.page}</span>/<span style={{ color: GREEN }}>{pagination.pages || 1}</span>
                </span>
              )}
            </div>

            <div className="border" style={{ borderColor: BORDER }}>
              <div className="overflow-x-auto">
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
                      <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-600">0 rows — bo'sh</td></tr>
                    )}
                    {!loading && items.map((doc) => (
                      <tr key={doc._id} className="hover:bg-green-950/20">
                        <td className="border-b px-3 py-1.5 font-mono text-[11px] text-green-600" style={{ borderColor: BORDER }}>{doc._id}</td>
                        <td className="max-w-md truncate border-b px-3 py-1.5 text-[11px] text-gray-300" style={{ borderColor: BORDER }}>
                          <span className="text-gray-600">{String(doc.name || doc.title || doc.email || doc.number || '').slice(0, 40)}</span>
                          <span className="text-gray-600"> · </span>
                          {JSON.stringify(doc, null, 0).slice(0, 130)}...
                        </td>
                        <td className="border-b px-3 py-1.5" style={{ borderColor: BORDER }}>
                          <div className="flex gap-1.5">
                            <button onClick={() => openEdit(doc)} className="border px-1.5 py-0.5 text-[11px] text-gray-300 hover:border-green-500 hover:text-green-400" title="vim">edit</button>
                            {activeKey === 'users' && (
                              <button onClick={() => handleResetPassword(doc)} className="border px-1.5 py-0.5 text-[11px] hover:border-green-500 hover:text-green-400" style={{ borderColor: '#7a5c00', color: '#ffd24d' }} title="passwd — yangi parol berish">passwd</button>
                            )}
                            <button onClick={() => handleDelete(doc)} className="border border-red-900 px-1.5 py-0.5 text-[11px] text-red-400 hover:bg-red-950" title="rm">rm</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-3 flex justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={btnGhost}>← prev</button>
                <span className="px-2 py-1.5 text-xs text-gray-500">
                  page <span style={{ color: GREEN }}>{page}</span> / {pagination.pages}
                </span>
                <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className={btnGhost}>next →</button>
              </div>
            )}
          </section>
        )}

        {!activeKey && (
          <div className="border px-6 py-8 text-center text-xs text-gray-500" style={{ borderColor: BORDER }}>
            <Prompt path="db">
              <span className="text-white">select a collection above</span>
            </Prompt>
            <p className="mt-2 text-gray-600">
              restoranlar · taomlar · xodimlar · buyurtmalar · to'lovlar · bronlar — hammasi boshqariladi
            </p>
          </div>
        )}

        {/* DANGER ZONE */}
        <section className="mt-8 border border-red-900 bg-red-950/20 p-4">
          <h3 className="text-sm font-bold text-red-400">!! DANGER ZONE !!</h3>
          <p className="mt-1 text-[11px] leading-5 text-red-300/60">
            rm -rf — tanlangan kolleksiyadagi HAMMA yozuvni o'chiradi. Root sifatida istalgan
            kolleksiyani tozalash huquqiga egasiz. Har bir amal audit logga yoziladi.
          </p>
        </section>

        {/* footer prompt */}
        <div className="mt-6 pb-10 text-xs text-gray-600">
          <Prompt path={activeKey || '~'} />
          <BlinkCursor />
        </div>
      </div>

      {/* Password result modal — yangi parol faqat bir marta ko'rinadi */}
      {passwordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPasswordResult(null)}>
          <div className="w-full max-w-md border border-green-600 bg-black p-6 shadow-[0_0_30px_rgba(0,255,65,0.15)]" onClick={(e) => e.stopPropagation()} style={MONO}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">passwd: success</span>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>
            <h3 className="text-sm text-green-400">✓ parol almashtirildi</h3>
            <p className="mt-1 text-xs text-gray-400">
              {passwordResult.user.name} <span className="text-gray-600">({passwordResult.user.email})</span> uchun yangi parol:
            </p>
            <div className="mt-3 border border-green-600 bg-green-950/20 p-4 text-center">
              <p className="select-all text-2xl font-bold" style={{ color: GREEN }}>{passwordResult.password}</p>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-red-400">
              ⚠ bu parol BOSHQA KO'RSATILMAYDI — hozir saqlang yoki ishchiga yuboring.
              eski parol o'chirildi, sessiyalari tugatildi.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { navigator.clipboard?.writeText(passwordResult.password); flash('cp: parol clipboardga nusxalandi') }}
                className={btnGhost}
              >
                copy
              </button>
              <button onClick={() => setPasswordResult(null)} className={btnGreen} style={{ background: GREEN, borderColor: GREEN }}>
                OK — saqladim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Editor modal — vim style */}
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
              <textarea
                className="h-80 w-full border bg-black p-3 text-xs leading-5 outline-none focus:border-green-500"
                style={{ borderColor: BORDER, color: GREEN }}
                value={editorJson}
                onChange={(e) => setEditorJson(e.target.value)}
                spellCheck={false}
              />
              {editorError && (
                <p className="mt-2 border border-red-900 bg-red-950/40 px-3 py-1.5 text-xs text-red-400">
                  parse error: {editorError}
                </p>
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
