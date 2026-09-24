import { useCallback, useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuCloudUpload, LuMinus, LuPlus, LuSave, LuTrash2 } from 'react-icons/lu'
import Button from '../../../components/ui/Button'
import { ROLE_LABELS, ROLE_LIST } from '../../../constants/roles'
import { PERMISSION_LABELS, PERMISSIONS } from '../../../constants/permissions'
import { settingsApi } from '../api'

const printerRoles = [
  { value: 'receipt', label: 'Chek printeri' },
  { value: 'kitchen', label: 'Oshxona' },
  { value: 'bar', label: 'Bar' },
]

const defaultPrinter = { name: 'Asosiy printer', ip: '', role: 'receipt', enabled: true }

const settingsSchema = z.object({
  restaurantName: z.string().trim().min(2, 'Restoran nomini kiriting.').max(80, 'Nomi 80 belgidan oshmasin.'),
  logoUrl: z.string().trim().refine((value) => !value || /^https?:\/\//i.test(value), 'Logo URL http(s) bilan boshlanishi kerak.'),
  serviceFee: z.coerce.number().min(0, '0 dan kichik bo‘lishi mumkin emas.').max(100, '100% dan oshmasin.'),
  tax: z.coerce.number().min(0, '0 dan kichik bo‘lishi mumkin emas.').max(100, '100% dan oshmasin.'),
  currency: z.enum(['UZS', 'USD', 'EUR']),
  printers: z.array(z.object({
    name: z.string().trim().min(1, 'Printer nomini kiriting.'),
    ip: z.string().trim().min(1, 'IP manzil yoki hostni kiriting.'),
    role: z.enum(['receipt', 'kitchen', 'bar']),
    enabled: z.boolean(),
  })).min(1, 'Kamida bitta printer qatori bo‘lishi kerak.'),
  logoFile: z.any().nullable().optional(),
})

const defaultValues = {
  restaurantName: '',
  logoUrl: '',
  serviceFee: 0,
  tax: 12,
  currency: 'UZS',
  printers: [defaultPrinter],
  logoFile: null,
}

// Umumiy utility bloklar — bir xil ko‘rinish bir necha joyda takrorlanmasin.
const eyebrowCls = 'mb-2.5 text-[0.7rem] font-extrabold uppercase leading-tight tracking-[0.16em] text-[#F97316]'
const labelCls = 'mb-1.5 flex items-baseline justify-between gap-3 text-[0.78rem] font-extrabold tracking-[0.02em] text-[#111827] dark:text-gray-100'
const controlCls =
  'min-h-[2.85rem] w-full rounded-[0.65rem] border border-[#111827]/20 bg-white/50 px-3 py-[0.7rem] text-[0.9rem] text-[#111827] outline-none transition placeholder:text-[#6B7280]/70 hover:border-[#111827]/35 focus:border-[#F97316] focus:bg-white focus:shadow-[0_0_0_3px_rgba(153,101,21,0.13)] aria-invalid:border-red-600 dark:border-gray-600 dark:bg-gray-800/60 dark:text-white dark:placeholder:text-gray-400/60 dark:hover:border-gray-500 dark:focus:border-[#F97316] dark:focus:bg-gray-800 dark:focus:shadow-[0_0_0_3px_rgba(249,115,22,0.2)]'
const helperCls = 'mt-1 block text-[0.73rem] leading-[1.4] text-[#6B7280] dark:text-gray-400'
const errorCls = 'mt-1 block text-[0.73rem] leading-[1.4] text-red-600 dark:text-red-400'
const sectionTitleCls = 'text-[clamp(1.55rem,2.8vw,2.25rem)] font-bold leading-[1.05] tracking-[-0.035em]'
const sectionDescCls = 'mt-3 text-[0.85rem] leading-[1.65] text-[#6B7280] dark:text-gray-400'
// Button komponentidagi gradient/shadow ni shu sahifadagi dizayn kesib olishi uchun `!` kerak.
const actionButtonCls =
  'min-h-11 w-full rounded-xl border border-transparent bg-none! bg-[#111827]! px-4 font-bold text-white shadow-none! transition hover:-translate-y-px hover:bg-[#F97316]! dark:bg-[#F97316]! dark:hover:bg-[#EA580C]! sm:w-auto'

function getSettingsPayload(value) {
  const payload = value?.settings ?? value ?? {}
  return {
    restaurantName: payload.restaurantName ?? payload.name ?? '',
    logoUrl: payload.logoUrl ?? payload.logo ?? '',
    serviceFee: payload.serviceFee ?? payload.service_fee ?? 0,
    tax: payload.taxRate ?? payload.tax ?? payload.taxPercent ?? payload.tax_percent ?? 12,
    currency: payload.currency ?? 'UZS',
    printers: Array.isArray(payload.printers) && payload.printers.length
      ? payload.printers.map((printer) => ({
        name: printer.name ?? printer.title ?? 'Printer',
        ip: printer.ip ?? printer.host ?? '',
        role: printer.role ?? 'receipt',
        enabled: printer.enabled ?? true,
      }))
      : [defaultPrinter],
  }
}

function FieldError({ message }) {
  return message ? <span className={errorCls} role="alert">{message}</span> : null
}

const permissionKeys = Object.keys(PERMISSION_LABELS)

function roleHasPermission(role, permission) {
  const permissions = PERMISSIONS[role] ?? []
  return permissions.includes('*') || permissions.includes(permission)
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const [pageState, setPageState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [saveState, setSaveState] = useState('idle')
  const [logoPreview, setLogoPreview] = useState('')
  const [logoName, setLogoName] = useState('')

  const {
    register,
    control,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues,
    resolver: zodResolver(settingsSchema),
    mode: 'onBlur',
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'printers' })

  const loadSettings = useCallback(async () => {
    setPageState('loading')
    setLoadError('')
    try {
      const settings = await settingsApi.get()
      const normalized = getSettingsPayload(settings)
      reset({ ...normalized, logoFile: null })
      setLogoPreview(normalized.logoUrl)
      setPageState('ready')
    } catch (error) {
      setPageState('error')
      setLoadError(error.response?.data?.message ?? 'Sozlamalarni yuklab bo‘lmadi.')
    }
  }, [reset])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setLoadError('Faqat rasm formatidagi logo faylini tanlang.')
      return
    }

    setLoadError('')
    setLogoName(file.name)
    setValue('logoFile', file, { shouldDirty: true })
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(String(reader.result ?? ''))
    reader.readAsDataURL(file)
  }

  const onSubmit = async (values) => {
    setSaveState('saving')
    try {
      const saved = await settingsApi.update({ ...values, taxRate: values.tax, taxPercent: values.tax })
      const normalized = getSettingsPayload(saved)
      reset({ ...normalized, logoFile: null })
      setLogoPreview(normalized.logoUrl || logoPreview)
      setLogoName('')
      setSaveState('saved')
    } catch (error) {
      setSaveState('error')
      setLoadError(error.response?.data?.message ?? 'Sozlamalarni saqlab bo‘lmadi.')
    }
  }

  if (pageState === 'loading') {
    return (
      <main className="min-h-screen bg-white bg-[radial-gradient(circle_at_88%_0%,rgba(216,164,164,0.16),transparent_28rem)] p-4 text-[#111827] dark:bg-[#0B0F17] dark:bg-[radial-gradient(circle_at_88%_0%,rgba(249,115,22,0.08),transparent_28rem)] dark:text-gray-100 sm:p-7 lg:p-14">
        <div className="mx-auto w-full max-w-[75rem]">
          <div className="grid min-h-[22rem] place-items-center border border-[#E5E7EB] bg-white text-[#6B7280] dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
            {t('loading')}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white bg-[radial-gradient(circle_at_88%_0%,rgba(216,164,164,0.16),transparent_28rem)] p-4 text-[#111827] dark:bg-[#0B0F17] dark:bg-[radial-gradient(circle_at_88%_0%,rgba(249,115,22,0.08),transparent_28rem)] dark:text-gray-100 sm:p-7 lg:p-14">
      <div className="mx-auto w-full max-w-[75rem]">
        <header className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <p className={eyebrowCls}>Restaurant operations / 01</p>
            <h1 className="max-w-[42rem] text-[clamp(2.35rem,6vw,4.9rem)] font-bold leading-[0.98] tracking-[-0.05em]">
              {t('settings.title', { defaultValue: "Sozlamalar" })}
            </h1>
            <p className="mt-4 max-w-[40rem] text-[0.98rem] leading-[1.7] text-[#6B7280] dark:text-gray-400">
              {t('settings.subtitle', { defaultValue: "Restoraningiz qanday ko‘rinishi va hisob-kitoblar qanday ishlashini shu yerda boshqaring." })}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:shrink-0 sm:justify-start">
            {saveState === 'saved' && (
              <span className="inline-flex min-h-[2.2rem] items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[0.78rem] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <LuCheck size={15} aria-hidden="true" /> {t('save', { defaultValue: "Saqlandi" })}
              </span>
            )}
            {saveState === 'error' && (
              <span className="inline-flex min-h-[2.2rem] items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[0.78rem] font-bold text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {t('kitchen.loadFailed', { defaultValue: "Saqlashda xatolik" })}
              </span>
            )}
            <Button type="submit" form="settings-form" className={actionButtonCls} isLoading={saveState === 'saving'}>
              <LuSave size={16} aria-hidden="true" /> {t('save', { defaultValue: "Saqlash" })}
            </Button>
          </div>
        </header>

        {loadError && (
          <div
            className="mb-4 flex flex-col items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-[0.85rem] leading-[1.5] text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
            role="alert"
          >
            <span>{loadError}</span>
            {pageState === 'error' && (
              <button
                type="button"
                className="min-h-11 border-0 bg-transparent text-[0.82rem] font-extrabold text-red-600 underline dark:text-red-400"
                onClick={loadSettings}
              >
                {t('refresh', { defaultValue: "Qayta urinish" })}
              </button>
            )}
          </div>
        )}

        <form
          id="settings-form"
          className="overflow-hidden border border-[#E5E7EB] bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-[#111827]/95 dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <section className="grid grid-cols-1 gap-6 border-t-2 border-[#111827] p-5 first:border-t-0 dark:border-gray-100 md:grid-cols-[minmax(12rem,0.72fr)_minmax(0,1.8fr)] md:gap-10 md:p-6 lg:gap-20 lg:p-8">
            <div className="max-w-none md:max-w-[15rem]">
              <p className={eyebrowCls}>Identity</p>
              <h2 className={sectionTitleCls}>{t('settings.general', { defaultValue: "Restoraningiz ovozi" })}</h2>
              <p className={sectionDescCls}>
                {t('settings.generalDesc', { defaultValue: "Menyu, chek va mijozlar ko‘radigan joylarda ishlatiladigan asosiy ma’lumotlar." })}
              </p>
            </div>
            <div className="min-w-0">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="col-span-full min-w-0">
                  <label className={labelCls} htmlFor="restaurantName">
                    {t('settings.restaurantName', { defaultValue: "Restoran nomi" })} <span className="text-[#EA580C] dark:text-[#F97316]">*</span>
                  </label>
                  <input id="restaurantName" className={controlCls} aria-invalid={Boolean(errors.restaurantName)} {...register('restaurantName')} placeholder="Masalan, Sabo Restaurant" />
                  <FieldError message={errors.restaurantName?.message} />
                </div>
                <div className="col-span-full min-w-0">
                  <label className={labelCls} htmlFor="logoUrl">Logo URL</label>
                  <input id="logoUrl" className={controlCls} aria-invalid={Boolean(errors.logoUrl)} {...register('logoUrl')} onChange={(event) => { register('logoUrl').onChange(event); if (!logoName) setLogoPreview(event.target.value) }} placeholder="https://..." />
                  <span className={helperCls}>{t('settings.logoHelper', { defaultValue: "Yoki quyidagi maydondan rasm faylini tanlang." })}</span>
                  <FieldError message={errors.logoUrl?.message} />
                </div>
                <div className="col-span-full min-w-0">
                  <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-[minmax(9rem,0.7fr)_minmax(0,1.3fr)]">
                    <div className="grid min-h-40 place-items-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-orange-100/40 text-center dark:border-gray-800 dark:bg-orange-500/10" aria-label="Logo preview">
                      {logoPreview
                        ? <img src={logoPreview} alt="Restoran logosi preview" className="min-h-40 w-full object-contain p-3.5" />
                        : <span className="p-4 text-[1.5rem] font-bold">RF</span>}
                    </div>
                    <label
                      className="flex min-h-40 cursor-pointer flex-col items-start justify-center gap-2 rounded-lg border border-dashed border-[#111827]/30 bg-white/25 p-4.5 transition hover:border-[#F97316] hover:bg-orange-100/40 focus-within:border-[#F97316] focus-within:bg-orange-100/40 dark:border-gray-600 dark:bg-gray-800/40 dark:hover:bg-orange-500/10"
                      htmlFor="logoFile"
                    >
                      <LuCloudUpload size={22} aria-hidden="true" />
                      <span className="font-extrabold">{logoName || t('settings.logoDropTitle', { defaultValue: "Logo faylini yuklang" })}</span>
                      <span className="text-[0.78rem] leading-[1.5] text-[#6B7280] dark:text-gray-400">
                        {t('settings.logoDropText', { defaultValue: "PNG, JPG yoki SVG. Fayl tanlanganda preview shu zahoti yangilanadi." })}
                      </span>
                      <input id="logoFile" className="sr-only" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 border-t-2 border-[#111827] p-5 dark:border-gray-100 md:grid-cols-[minmax(12rem,0.72fr)_minmax(0,1.8fr)] md:gap-10 md:p-6 lg:gap-20 lg:p-8">
            <div className="max-w-none md:max-w-[15rem]">
              <p className={eyebrowCls}>Financial rules</p>
              <h2 className={sectionTitleCls}>{t('settings.financial', { defaultValue: "Hisob-kitob tili" })}</h2>
              <p className={sectionDescCls}>
                {t('settings.financialDesc', { defaultValue: "Buyurtma summasi, xizmat haqi va soliq hisoblash uchun ishlatiladigan qiymatlar." })}
              </p>
            </div>
            <div className="min-w-0">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="min-w-0">
                  <label className={labelCls} htmlFor="serviceFee">
                    {t('settings.serviceFee', { defaultValue: "Xizmat haqi" })} % <span className="text-[#EA580C] dark:text-[#F97316]">*</span>
                  </label>
                  <input id="serviceFee" className={controlCls} type="number" min="0" max="100" step="0.1" aria-invalid={Boolean(errors.serviceFee)} {...register('serviceFee')} />
                  <FieldError message={errors.serviceFee?.message} />
                </div>
                <div className="min-w-0">
                  <label className={labelCls} htmlFor="tax">
                    {t('settings.tax', { defaultValue: "Soliq" })} % <span className="text-[#EA580C] dark:text-[#F97316]">*</span>
                  </label>
                  <input id="tax" className={controlCls} type="number" min="0" max="100" step="0.1" aria-invalid={Boolean(errors.tax)} {...register('tax')} />
                  <FieldError message={errors.tax?.message} />
                </div>
                <div className="min-w-0 md:col-span-2 xl:col-span-1">
                  <label className={labelCls} htmlFor="currency">
                    {t('settings.currency', { defaultValue: "Valyuta" })} <span className="text-[#EA580C] dark:text-[#F97316]">*</span>
                  </label>
                  <select id="currency" className={controlCls} aria-invalid={Boolean(errors.currency)} {...register('currency')}>
                    <option value="UZS">UZS — so‘m</option>
                    <option value="USD">USD — dollar</option>
                    <option value="EUR">EUR — yevro</option>
                  </select>
                  <FieldError message={errors.currency?.message} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 border-t-2 border-[#111827] p-5 dark:border-gray-100 md:grid-cols-[minmax(12rem,0.72fr)_minmax(0,1.8fr)] md:gap-10 md:p-6 lg:gap-20 lg:p-8">
            <div className="max-w-none md:max-w-[15rem]">
              <p className={eyebrowCls}>Hardware</p>
              <h2 className={sectionTitleCls}>{t('settings.printers', { defaultValue: "Printerlar" })}</h2>
              <p className={sectionDescCls}>
                {t('settings.printersDesc', { defaultValue: "Chek va oshxona printerlarini ulash uchun nom, host va vazifani belgilang." })}
              </p>
            </div>
            <div className="min-w-0">
              <div className="grid gap-3">
                {fields.map((field, index) => (
                  <div
                    className="grid grid-cols-1 items-end gap-2.5 rounded-xl border border-[#E5E7EB] bg-white/25 p-3.5 dark:border-gray-800 dark:bg-gray-800/35 md:grid-cols-[minmax(8rem,1.15fr)_minmax(8rem,1fr)_minmax(8rem,0.8fr)_auto]"
                    key={field.id}
                  >
                    <div className="min-w-0">
                      <label className={`${labelCls} text-[0.68rem]`} htmlFor={`printers.${index}.name`}>{t('employees.name', { defaultValue: "Nomi" })}</label>
                      <input className={controlCls} id={`printers.${index}.name`} aria-invalid={Boolean(errors.printers?.[index]?.name)} {...register(`printers.${index}.name`)} placeholder="Asosiy printer" />
                      <FieldError message={errors.printers?.[index]?.name?.message} />
                    </div>
                    <div className="min-w-0">
                      <label className={`${labelCls} text-[0.68rem]`} htmlFor={`printers.${index}.ip`}>IP / host</label>
                      <input className={controlCls} id={`printers.${index}.ip`} aria-invalid={Boolean(errors.printers?.[index]?.ip)} {...register(`printers.${index}.ip`)} placeholder="192.168.1.40" />
                      <FieldError message={errors.printers?.[index]?.ip?.message} />
                    </div>
                    <div className="min-w-0">
                      <label className={`${labelCls} text-[0.68rem]`} htmlFor={`printers.${index}.role`}>{t('employees.role', { defaultValue: "Vazifasi" })}</label>
                      <select className={controlCls} id={`printers.${index}.role`} {...register(`printers.${index}.role`)}>
                        {printerRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        className="inline-grid size-11 place-items-center rounded-[0.65rem] border border-[#E5E7EB] bg-transparent text-[#111827] transition hover:border-[#111827] hover:bg-[#111827]/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:border-[#F97316] dark:hover:bg-orange-500/10"
                        title={t('delete', { defaultValue: "Printer qatorini o‘chirish" })}
                        aria-label={t('delete', { defaultValue: "Printer qatorini o‘chirish" })}
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <LuTrash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 border-0 bg-transparent text-[0.82rem] font-extrabold text-[#F97316] hover:underline"
                onClick={() => append({ ...defaultPrinter, name: `Printer ${fields.length + 1}` })}
              >
                <LuPlus size={16} aria-hidden="true" /> {t('settings.addPrinter', { defaultValue: "Printer qo‘shish" })}
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 border-t-2 border-[#111827] p-5 dark:border-gray-100 md:grid-cols-[minmax(12rem,0.72fr)_minmax(0,1.8fr)] md:gap-10 md:p-6 lg:gap-20 lg:p-8">
            <div className="max-w-none md:max-w-[15rem]">
              <p className={eyebrowCls}>Access control</p>
              <h2 className={sectionTitleCls}>{t('settings.permissions', { defaultValue: "Rollar va ruxsatlar" })}</h2>
              <p className={sectionDescCls}>
                {t('settings.permissionsDesc', { defaultValue: "Har bir rol qaysi bo‘limlarni ko‘rishi va boshqarishi mumkinligini tekshiring." })}
              </p>
            </div>
            <div className="min-w-0">
              <div className="max-w-full overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white/25 dark:border-gray-800 dark:bg-gray-800/30">
                <table className="w-full min-w-[42rem] border-collapse text-[0.78rem]">
                  <caption className="sr-only">Rollar bo‘yicha tizim ruxsatlari</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="border-b border-[#E5E7EB] px-3.5 py-3 text-left text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[#6B7280] dark:border-gray-800 dark:text-gray-400">
                        {t('settings.permissions', { defaultValue: "Ruxsat" })}
                      </th>
                      {ROLE_LIST.map((roleKey) => (
                        <th
                          scope="col"
                          key={roleKey}
                          className="border-b border-[#E5E7EB] px-3.5 py-3 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.08em] whitespace-nowrap text-[#6B7280] dark:border-gray-800 dark:text-gray-400"
                        >
                          {t(`roles.${roleKey}`, ROLE_LABELS[roleKey] ?? roleKey)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&>tr:last-child>*]:border-b-0">
                    {permissionKeys.map((permission) => (
                      <tr key={permission}>
                        <th scope="row" className="border-b border-[#E5E7EB] px-3.5 py-3 text-left font-bold text-[#111827] dark:border-gray-800 dark:text-gray-100">
                          {PERMISSION_LABELS[permission]}
                        </th>
                        {ROLE_LIST.map((roleKey) => {
                          const allowed = roleHasPermission(roleKey, permission)
                          return (
                            <td
                              key={roleKey}
                              className={`border-b border-[#E5E7EB] px-3.5 py-3 text-center dark:border-gray-800 ${allowed ? 'bg-emerald-100/40 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-[#6B7280] dark:text-gray-400'}`}
                            >
                              {allowed ? <LuCheck size={16} aria-label="Ruxsat berilgan" /> : <LuMinus size={16} aria-label="Ruxsat berilmagan" />}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="z-[2] flex flex-col gap-2.5 border-t border-[#E5E7EB] bg-white/70 px-5 py-3.5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70 md:static md:flex-row md:items-center md:justify-end md:gap-3.5 md:bg-white/25 md:py-4 dark:md:bg-gray-800/35 max-md:sticky max-md:bottom-0">
            {isDirty && <span className={helperCls}>{t('settings.unsavedChanges', { defaultValue: "Saqlanmagan o‘zgarishlar bor." })}</span>}
            <Button type="submit" className={actionButtonCls} isLoading={saveState === 'saving'}>
              <LuSave size={16} aria-hidden="true" /> {t('save', { defaultValue: "O‘zgarishlarni saqlash" })}
            </Button>
          </footer>
        </form>
      </div>
    </main>
  )
}
