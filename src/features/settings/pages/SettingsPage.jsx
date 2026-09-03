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
import styles from './SettingsPage.module.css'

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
  return message ? <span className={styles.error} role="alert">{message}</span> : null
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
    return <main className={styles.page}><div className={styles.shell}><div className={styles.loading}>{t('loading')}</div></div></main>
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Restaurant operations / 01</p>
            <h1 className={styles.title}>{t('settings.title', { defaultValue: "Sozlamalar" })}</h1>
            <p className={styles.lead}>{t('settings.subtitle', { defaultValue: "Restoraningiz qanday ko‘rinishi va hisob-kitoblar qanday ishlashini shu yerda boshqaring." })}</p>
          </div>
          <div className={styles.headerActions}>
            {saveState === 'saved' && <span className={`${styles.status} ${styles.statusSuccess}`}><LuCheck size={15} aria-hidden="true" /> {t('save', { defaultValue: "Saqlandi" })}</span>}
            {saveState === 'error' && <span className={`${styles.status} ${styles.statusError}`}>{t('kitchen.loadFailed', { defaultValue: "Saqlashda xatolik" })}</span>}
            <Button type="submit" form="settings-form" className={styles.actionButton} isLoading={saveState === 'saving'}>
              <LuSave size={16} aria-hidden="true" /> {t('save', { defaultValue: "Saqlash" })}
            </Button>
          </div>
        </header>

        {loadError && (
          <div className={styles.alert} role="alert">
            <span>{loadError}</span>
            {pageState === 'error' && <button type="button" className={styles.retryButton} onClick={loadSettings}>{t('refresh', { defaultValue: "Qayta urinish" })}</button>}
          </div>
        )}

        <form id="settings-form" className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className={styles.section}>
            <div className={styles.sectionCopy}>
              <p className={styles.sectionEyebrow}>Identity</p>
              <h2 className={styles.sectionTitle}>{t('settings.general', { defaultValue: "Restoraningiz ovozi" })}</h2>
              <p className={styles.sectionDescription}>{t('settings.generalDesc', { defaultValue: "Menyu, chek va mijozlar ko‘radigan joylarda ishlatiladigan asosiy ma’lumotlar." })}</p>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.fieldGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="restaurantName">{t('settings.restaurantName', { defaultValue: "Restoran nomi" })} <span className={styles.required}>*</span></label>
                  <input id="restaurantName" className={styles.input} aria-invalid={Boolean(errors.restaurantName)} {...register('restaurantName')} placeholder="Masalan, Sabo Restaurant" />
                  <FieldError message={errors.restaurantName?.message} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="logoUrl">Logo URL</label>
                  <input id="logoUrl" className={styles.input} aria-invalid={Boolean(errors.logoUrl)} {...register('logoUrl')} onChange={(event) => { register('logoUrl').onChange(event); if (!logoName) setLogoPreview(event.target.value) }} placeholder="https://..." />
                  <span className={styles.helper}>{t('settings.logoHelper', { defaultValue: "Yoki quyidagi maydondan rasm faylini tanlang." })}</span>
                  <FieldError message={errors.logoUrl?.message} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <div className={styles.logoField}>
                    <div className={styles.logoPreview} aria-label="Logo preview">
                      {logoPreview ? <img src={logoPreview} alt="Restoran logosi preview" /> : <span className={styles.logoPlaceholder}>RF</span>}
                    </div>
                    <label className={styles.logoDrop} htmlFor="logoFile">
                      <LuCloudUpload size={22} aria-hidden="true" />
                      <span className={styles.logoDropTitle}>{logoName || t('settings.logoDropTitle', { defaultValue: "Logo faylini yuklang" })}</span>
                      <span className={styles.logoDropText}>{t('settings.logoDropText', { defaultValue: "PNG, JPG yoki SVG. Fayl tanlanganda preview shu zahoti yangilanadi." })}</span>
                      <input id="logoFile" className={styles.fileInput} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionCopy}>
              <p className={styles.sectionEyebrow}>Financial rules</p>
              <h2 className={styles.sectionTitle}>{t('settings.financial', { defaultValue: "Hisob-kitob tili" })}</h2>
              <p className={styles.sectionDescription}>{t('settings.financialDesc', { defaultValue: "Buyurtma summasi, xizmat haqi va soliq hisoblash uchun ishlatiladigan qiymatlar." })}</p>
            </div>
            <div className={styles.sectionBody}>
              <div className={`${styles.fieldGrid} ${styles.fieldGridThree}`}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="serviceFee">{t('settings.serviceFee', { defaultValue: "Xizmat haqi" })} % <span className={styles.required}>*</span></label>
                  <input id="serviceFee" className={styles.input} type="number" min="0" max="100" step="0.1" aria-invalid={Boolean(errors.serviceFee)} {...register('serviceFee')} />
                  <FieldError message={errors.serviceFee?.message} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="tax">{t('settings.tax', { defaultValue: "Soliq" })} % <span className={styles.required}>*</span></label>
                  <input id="tax" className={styles.input} type="number" min="0" max="100" step="0.1" aria-invalid={Boolean(errors.tax)} {...register('tax')} />
                  <FieldError message={errors.tax?.message} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="currency">{t('settings.currency', { defaultValue: "Valyuta" })} <span className={styles.required}>*</span></label>
                  <select id="currency" className={styles.select} aria-invalid={Boolean(errors.currency)} {...register('currency')}>
                    <option value="UZS">UZS — so‘m</option>
                    <option value="USD">USD — dollar</option>
                    <option value="EUR">EUR — yevro</option>
                  </select>
                  <FieldError message={errors.currency?.message} />
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionCopy}>
              <p className={styles.sectionEyebrow}>Hardware</p>
              <h2 className={styles.sectionTitle}>{t('settings.printers', { defaultValue: "Printerlar" })}</h2>
              <p className={styles.sectionDescription}>{t('settings.printersDesc', { defaultValue: "Chek va oshxona printerlarini ulash uchun nom, host va vazifani belgilang." })}</p>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.printerList}>
                {fields.map((field, index) => (
                  <div className={styles.printerRow} key={field.id}>
                    <div className={styles.printerField}>
                      <label className={styles.label} htmlFor={`printers.${index}.name`}>{t('employees.name', { defaultValue: "Nomi" })}</label>
                      <input className={styles.input} id={`printers.${index}.name`} aria-invalid={Boolean(errors.printers?.[index]?.name)} {...register(`printers.${index}.name`)} placeholder="Asosiy printer" />
                      <FieldError message={errors.printers?.[index]?.name?.message} />
                    </div>
                    <div className={styles.printerField}>
                      <label className={styles.label} htmlFor={`printers.${index}.ip`}>IP / host</label>
                      <input className={styles.input} id={`printers.${index}.ip`} aria-invalid={Boolean(errors.printers?.[index]?.ip)} {...register(`printers.${index}.ip`)} placeholder="192.168.1.40" />
                      <FieldError message={errors.printers?.[index]?.ip?.message} />
                    </div>
                    <div className={styles.printerField}>
                      <label className={styles.label} htmlFor={`printers.${index}.role`}>{t('employees.role', { defaultValue: "Vazifasi" })}</label>
                      <select className={styles.select} id={`printers.${index}.role`} {...register(`printers.${index}.role`)}>
                        {printerRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                      </select>
                    </div>
                    <div className={styles.printerActions}>
                      <button type="button" className={styles.iconButton} title={t('delete', { defaultValue: "Printer qatorini o‘chirish" })} aria-label={t('delete', { defaultValue: "Printer qatorini o‘chirish" })} disabled={fields.length === 1} onClick={() => remove(index)}><LuTrash2 size={16} aria-hidden="true" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className={styles.addPrinter} onClick={() => append({ ...defaultPrinter, name: `Printer ${fields.length + 1}` })}>
                <LuPlus size={16} aria-hidden="true" /> {t('settings.addPrinter', { defaultValue: "Printer qo‘shish" })}
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionCopy}>
              <p className={styles.sectionEyebrow}>Access control</p>
              <h2 className={styles.sectionTitle}>{t('settings.permissions', { defaultValue: "Rollar va ruxsatlar" })}</h2>
              <p className={styles.sectionDescription}>{t('settings.permissionsDesc', { defaultValue: "Har bir rol qaysi bo‘limlarni ko‘rishi va boshqarishi mumkinligini tekshiring." })}</p>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.permissionsScroller}>
                <table className={styles.permissionsTable}>
                  <caption className={styles.srOnly}>Rollar bo‘yicha tizim ruxsatlari</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t('settings.permissions', { defaultValue: "Ruxsat" })}</th>
                      {ROLE_LIST.map((roleKey) => <th scope="col" key={roleKey}>{t(`roles.${roleKey}`, ROLE_LABELS[roleKey] ?? roleKey)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionKeys.map((permission) => (
                      <tr key={permission}>
                        <th scope="row">{PERMISSION_LABELS[permission]}</th>
                        {ROLE_LIST.map((roleKey) => {
                          const allowed = roleHasPermission(roleKey, permission)
                          return (
                            <td key={roleKey} className={allowed ? styles.permissionAllowed : styles.permissionDenied}>
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

          <footer className={styles.formFooter}>
            {isDirty && <span className={styles.helper}>{t('settings.unsavedChanges', { defaultValue: "Saqlanmagan o‘zgarishlar bor." })}</span>}
            <Button type="submit" className={styles.actionButton} isLoading={saveState === 'saving'}>
              <LuSave size={16} aria-hidden="true" /> {t('save', { defaultValue: "O‘zgarishlarni saqlash" })}
            </Button>
          </footer>
        </form>
      </div>
    </main>
  )
}
