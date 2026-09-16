// ─── ROOT (SUPERADMIN) PANEL ─────────────────────────────────────────────
// Bu sahifa sidebar'da KO'RINMAYDI va faqat bilgan odam URL orqali kiradi:
//   /root-panel
//
// Imkoniyatlar:
//  - DB statistikasi (barcha kolleksiyalar soni, server info)
//  - Har kolleksiya bo'yicha: qidirish, ko'rish, tahrirlash (JSON), o'chirish, yaratish
//  - Danger Zone: butun kolleksiyani tozalash
//  - Har bir amal audit logga yoziladi (root.login / root.create / root.update / root.delete / root.wipe)
import { useState, useEffect, useCallback } from 'react'

import {
  rootLogin, rootLogout, rootMe,
  getRootStats, getRootCollections, getRootCollection,
  createRootDocument, updateRootDocument, deleteRootDocument, wipeRootCollection,
  resetUserPassword,
} from '../api'

const inputCls = 'w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-red-500'
const btnDanger = 'rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50'
const btnGhost = 'rounded-md border border-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50'

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
    setNotice(`❌ ${msg}`)
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
        flash('✅ Yangilandi')
      } else {
        await createRootDocument(activeKey, body)
        flash('✅ Yaratildi')
      }
      setEditorOpen(false)
      loadItems(activeKey)
      loadStats()
    } catch (e) { handleError(e) } finally { setSaving(false) }
  }

  async function handleDelete(doc) {
    const label = doc.name || doc.title || doc.email || doc._id
    if (!window.confirm(`Rostdan ham o'chirilsinmi? (${label})\n\nBu amal audit logga yoziladi va qaytarilmaydi.`)) return
    try {
      await deleteRootDocument(activeKey, doc._id)
      flash('🗑 O\'chirildi')
      loadItems(activeKey)
      loadStats()
    } catch (e) { handleError(e) }
  }

  async function handleResetPassword(doc) {
    const label = doc.name || doc.email
    const custom = window.prompt(
      `🔑 Yangi parol: ${label}\n\n` +
      'Bo\'sh qoldirsangiz — avtomatik xavfsiz parol generatsiya qilinadi.\n' +
      'Yoki o\'zingiz xohlagan parolni yozing (kamida 6 belgi):'
    )
    if (custom === null) return // bekor qildi
    if (custom && custom.length < 6) { flash('❌ Parol kamida 6 belgi'); return }
    try {
      const res = await resetUserPassword(doc._id, custom || null)
      setPasswordResult({ user: res, password: res.newPassword })
      loadItems(activeKey)
    } catch (e) { handleError(e) }
  }

  async function handleWipe(key) {
    if (!window.confirm(`⚠️ DANGER ZONE ⚠️\n\n"${key}" kolleksiyasidagi BARCHA yozuvlar o'chiriladi!\n\nDavom etasizmi?`)) return
    const typed = window.prompt(`Tasdiqlash uchun kolleksiya nomini yozing: ${key}`)
    if (typed !== key) { flash('❌ Bekor qilindi (nom mos kelmadi)'); return }
    try {
      const res = await wipeRootCollection(key)
      flash(`🧹 Tozalandi: ${res.deleted} yozuv o'chirildi`)
      loadStats()
      if (activeKey === key) loadItems(key)
    } catch (e) { handleError(e) }
  }

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-gray-400">
        Tekshirilmoqda...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
          <div className="text-center">
            <div className="text-3xl">🔐</div>
            <h1 className="mt-2 text-xl font-bold text-gray-100">Root Panel</h1>
            <p className="mt-1 text-xs text-gray-500">Faqat vakolatli shaxs uchun</p>
          </div>

          <input
            type="text"
            className={inputCls}
            placeholder="Email yoki telefon"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            className={inputCls}
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {loginError && <p className="text-sm text-red-400">{loginError}</p>}

          <button type="submit" disabled={loggingIn} className={`${btnDanger} w-full py-2`}>
            {loggingIn ? 'Kiring...' : 'Kirish'}
          </button>
        </form>
      </div>
    )
  }

  // ─── MAIN PANEL ────────────────────────────────────────────────────────
  // Backend har kolleksiya uchun wipeable flag'ini yuboradi — bu yerda
  // hardcoded ro'yxat emas, API dan olinadi.
  const wipeableKeys = new Set(collections.filter((c) => c.wipeable).map((c) => c.key))

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <h1 className="text-sm font-bold">ROOT PANEL — RestoFlow</h1>
            <p className="text-xs text-gray-500">{user.email} · {stats?.db?.name}@{stats?.db?.host} ({stats?.db?.state})</p>
          </div>
        </div>
        <button onClick={() => { rootLogout(); setUser(null) }} className={btnGhost}>
          Chiqish
        </button>
      </header>

      {notice && (
        <div className="border-b border-gray-800 bg-gray-900 px-4 py-2 text-sm">{notice}</div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Stats */}
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Ma&apos;lumotlar bazasi statistikasi</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {stats?.collections?.map((c) => (
              <div key={c.name} className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                <p className="truncate text-xs text-gray-500">{c.name}</p>
                <p className="text-lg font-bold">{c.count.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Collections */}
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Kolleksiyalar</h2>
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => (
              <button
                key={c.key}
                onClick={() => { setActiveKey(c.key); setSearch(''); setPage(1); setItems([]); setPagination(null) }}
                className={`rounded-md px-3 py-1.5 text-sm ${activeKey === c.key ? 'bg-red-600 text-white' : 'border border-gray-700 text-gray-300 hover:bg-gray-800'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Active collection table */}
        {activeKey && (
          <section>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                className={`${inputCls} max-w-xs`}
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
              <button onClick={openCreate} className={btnDanger}>+ Yangi yozuv</button>
              <button onClick={() => loadItems(activeKey)} className={btnGhost}>⟳ Yangilash</button>
              {wipeableKeys.has(activeKey) && (
                <button onClick={() => handleWipe(activeKey)} className="rounded-md border border-red-800 bg-red-950 px-3 py-1.5 text-sm text-red-300 hover:bg-red-900">
                  ⚠️ Tozalash (barchasini o&apos;chirish)
                </button>
              )}
              {pagination && (
                <span className="ml-auto text-xs text-gray-500">
                  {pagination.total} ta yozuv · sahifa {pagination.page}/{pagination.pages || 1}
                </span>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-900 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Ma&apos;lumot</th>
                      <th className="px-3 py-2 w-40">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {loading && (
                      <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">Yuklanmoqda...</td></tr>
                    )}
                    {!loading && items.length === 0 && (
                      <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">Yozuv yo&apos;q</td></tr>
                    )}
                    {!loading && items.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-900/60">
                        <td className="px-3 py-2 font-mono text-xs text-gray-500">{doc._id}</td>
                        <td className="max-w-md truncate px-3 py-2 text-xs text-gray-300">
                          {JSON.stringify(doc, null, 0).slice(0, 160)}...
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(doc)} className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800">✏️ Tahrirlash</button>
                            {activeKey === 'users' && (
                              <button onClick={() => handleResetPassword(doc)} className="rounded border border-amber-600 bg-amber-950 px-2 py-1 text-xs text-amber-300 hover:bg-amber-900" title="Yangi parol berish (eski parol o'rniga)">🔑</button>
                            )}
                            <button onClick={() => handleDelete(doc)} className="rounded border border-red-700 bg-red-950 px-2 py-1 text-xs text-red-300 hover:bg-red-900">🗑</button>
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
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={btnGhost}>← Oldingi</button>
                <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className={btnGhost}>Keyingi →</button>
              </div>
            )}
          </section>
        )}

        {!activeKey && (
          <p className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-sm text-gray-500">
            Yuqoridagi kolleksiyalardan birini tanlang — restoranlar, taomlar, xodimlar,
            buyurtmalar, to&apos;lovlar, bronlar va boshqalar. Hammasini boshqarish mumkin.
          </p>
        )}

        {/* Danger zone hint */}
        <section className="mt-8 rounded-lg border border-red-900/50 bg-red-950/30 p-4">
          <h3 className="text-sm font-semibold text-red-300">⚠️ Danger Zone</h3>
          <p className="mt-1 text-xs text-red-200/70">
            &quot;Tozalash&quot; tanlangan kolleksiyadagi HAMMA yozuvni o&apos;chiradi. Root sifatida
            siz istalgan kolleksiyani tozalash huquqiga egasiz (restoranlar, taomlar,
            buyurtmalar — hammasi). Har bir amal audit logga yoziladi.
          </p>
        </section>
      </div>

      {/* Password result modal — yangi parol faqat bir marta ko'rinadi */}
      {passwordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPasswordResult(null)}>
          <div className="w-full max-w-md rounded-xl border border-amber-700 bg-gray-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-amber-300">🔑 Parol almashtirildi</h3>
            <p className="mt-1 text-xs text-gray-400">
              {passwordResult.user.name} ({passwordResult.user.email}) uchun yangi parol:
            </p>
            <div className="mt-3 rounded-md border border-amber-700 bg-amber-950/40 p-4 text-center">
              <p className="select-all font-mono text-2xl font-bold text-amber-200">{passwordResult.password}</p>
            </div>
            <p className="mt-3 text-xs text-red-400">
              ⚠️ Bu parol endi BOSHQA KO'RSATILMAYDI — hozir saqlab oling yoki ishchiga yuboring.
              Eski parol o'chirildi, uning sessiyalari ham tugatildi.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { navigator.clipboard?.writeText(passwordResult.password); flash('📋 Parol nusxalandi') }}
                className={btnGhost}
              >
                📋 Nusxalash
              </button>
              <button onClick={() => setPasswordResult(null)} className={btnDanger}>
                Saqlab oldim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Editor modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEditorOpen(false)}>
          <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-sm font-bold">
              {editorId ? `Tahrirlash: ${editorId}` : `Yangi yozuv: ${activeKey}`}
            </h3>
            <textarea
              className="h-80 w-full rounded-md border border-gray-600 bg-gray-950 p-3 font-mono text-xs text-green-200 outline-none focus:border-red-500"
              value={editorJson}
              onChange={(e) => setEditorJson(e.target.value)}
              spellCheck={false}
            />
            {editorError && <p className="mt-2 text-xs text-red-400">{editorError}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setEditorOpen(false)} className={btnGhost}>Bekor qilish</button>
              <button onClick={handleSave} disabled={saving} className={btnDanger}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
