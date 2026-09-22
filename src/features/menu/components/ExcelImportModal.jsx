import { useState, useRef } from 'react'
import ExcelJS from 'exceljs'
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  FileText,
  Trash2,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { formatSom } from '../../../lib/api'

export function parseExcelPrice(val) {
  if (val === null || val === undefined) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  if (typeof val === 'object') {
    if (typeof val.result === 'number') return val.result
    if (val.result !== undefined) val = val.result
    else if (val.text !== undefined) val = val.text
    else if (val.richText) val = val.richText.map((t) => t.text).join('')
  }
  let str = String(val).trim()
  if (!str) return 0

  if (/^\d+$/.test(str)) {
    return parseInt(str, 10)
  }

  str = str.replace(/\s+/g, '')
  str = str.replace(/[^0-9.,]/g, '')
  if (!str) return 0

  if (str.includes('.') && str.includes(',')) {
    if (str.lastIndexOf('.') > str.lastIndexOf(',')) {
      str = str.replace(/,/g, '')
    } else {
      str = str.replace(/\./g, '').replace(',', '.')
    }
  } else if (str.includes('.')) {
    const parts = str.split('.')
    if (parts.length > 2) {
      str = str.replace(/\./g, '')
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        str = str.replace('.', '')
      }
    }
  } else if (str.includes(',')) {
    const parts = str.split(',')
    if (parts.length > 2) {
      str = str.replace(/,/g, '')
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        str = str.replace(',', '')
      } else {
        str = str.replace(',', '.')
      }
    }
  }

  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  onSuccess,
  categories = [],
  createCategory,
  createProduct,
}) {
  const fileInputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [isParsing, setIsParsing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

  if (!isOpen) return null

  const handleReset = () => {
    setFileName('')
    setParsedRows([])
    setIsParsing(false)
    setIsUploading(false)
    setUploadProgress({ current: 0, total: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    if (isUploading) return
    handleReset()
    onClose()
  }

  // 1. Excel Shablonini yuklab olish
  const handleDownloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Taomlar')

      worksheet.columns = [
        { header: 'nom', key: 'nom', width: 25 },
        { header: 'kategoriya', key: 'kategoriya', width: 20 },
        { header: 'narx', key: 'narx', width: 15 },
        { header: 'tavsif', key: 'tavsif', width: 35 },
      ]

      // Header style
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9A968' },
      }

      // Sample data
      worksheet.addRow({
        nom: 'Toshkent Palov',
        kategoriya: 'Milliy taomlar',
        narx: 35000,
        tavsif: 'Mazzali qo\'y go\'shtli maxsus palov',
      })
      worksheet.addRow({
        nom: 'Tandir Somsa',
        kategoriya: 'Milliy taomlar',
        narx: 12000,
        tavsif: 'Go\'shtli issiq tandir somsa',
      })
      worksheet.addRow({
        nom: 'Moxito Ichimlik',
        kategoriya: 'Ichimliklar',
        narx: 22000,
        tavsif: 'Muzli va yalpizli yangilaydigan ichimlik',
      })
      worksheet.addRow({
        nom: 'Muzqaymoq Assorti',
        kategoriya: 'Shirinliklar',
        narx: 18000,
        tavsif: 'Mevali va shokoladli muzqaymoq',
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'taomlar_import_shablon.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.info("Excel shabloni yuklab olindi!")
    } catch (err) {
      console.error(err)
      toast.error("Shablonni yuklab olishda xatolik yuz berdi")
    }
  }

  // 2. Excel faylni o'qish va tahlil qilish (Parsing)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error("Faqat .xlsx formatidagi Excel fayllari qabul qilinadi")
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setFileName(file.name)
    setIsParsing(true)

    try {
      const buffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)

      const worksheet = workbook.worksheets[0]
      if (!worksheet) {
        toast.error("Excel faylida varaq topilmadi")
        setIsParsing(false)
        return
      }

      const rows = []
      let headerIndices = { nom: -1, kategoriya: -1, narx: -1, tavsif: -1 }
      let headerRowFound = false

      worksheet.eachRow((row, rowNumber) => {
        const values = row.values
        // row.values is 1-indexed array of cell values or objects
        const stringValues = values.map((val) => {
          if (val === null || val === undefined) return ''
          if (typeof val === 'object') {
            if (val.result !== undefined) return String(val.result)
            if (val.text !== undefined) return String(val.text)
            if (val.richText) return val.richText.map((t) => t.text).join('')
          }
          return String(val).trim()
        })

        // Check if header row
        if (!headerRowFound) {
          const lowerValues = stringValues.map((v) => v.toLowerCase())
          const nomIdx = lowerValues.findIndex((v) =>
            ['nom', 'name', 'taom', 'taom nomi', 'title'].includes(v),
          )
          const catIdx = lowerValues.findIndex((v) =>
            ['kategoriya', 'category', 'tur', 'bo\'lim'].includes(v),
          )
          const priceIdx = lowerValues.findIndex((v) =>
            ['narx', 'price', 'narxi', 'cost', 'sum'].includes(v),
          )
          const descIdx = lowerValues.findIndex((v) =>
            ['tavsif', 'description', 'haqida', 'desc', 'izoh'].includes(v),
          )

          if (nomIdx !== -1 || priceIdx !== -1) {
            headerIndices = {
              nom: nomIdx !== -1 ? nomIdx : 1,
              kategoriya: catIdx !== -1 ? catIdx : 2,
              narx: priceIdx !== -1 ? priceIdx : 3,
              tavsif: descIdx !== -1 ? descIdx : 4,
            }
            headerRowFound = true
            return // Skip header row
          }
        }

        // If no header row found yet and it's row 1, use defaults
        if (!headerRowFound && rowNumber === 1) {
          headerIndices = { nom: 1, kategoriya: 2, narx: 3, tavsif: 4 }
          headerRowFound = true
          return
        }

        // Parse data row
        const rawNom = stringValues[headerIndices.nom] || stringValues[1] || ''
        const rawKat = stringValues[headerIndices.kategoriya] || stringValues[2] || ''
        const rawPriceVal = values[headerIndices.narx] ?? values[3] ?? stringValues[headerIndices.narx]
        const rawDesc = stringValues[headerIndices.tavsif] || stringValues[4] || ''

        if (!rawNom && !rawPriceVal && !rawKat) return // Skip empty rows

        const parsedPrice = parseExcelPrice(rawPriceVal)
        const isValid = Boolean(rawNom.trim()) && parsedPrice > 0

        let error = ''
        if (!rawNom.trim()) error = "Taom nomi yo'q"
        else if (parsedPrice <= 0) error = "Narx noto'g'ri"

        rows.push({
          id: rowNumber,
          nom: rawNom.trim(),
          kategoriya: rawKat.trim(),
          narx: parsedPrice,
          tavsif: rawDesc.trim(),
          isValid,
          error,
        })
      })

      if (rows.length === 0) {
        toast.warning("Excel faylida ma'lumotlar topilmadi")
      }

      setParsedRows(rows)
    } catch (err) {
      console.error("Excel parse error:", err)
      toast.error("Excel faylini o'qishda xatolik yuz berdi. Fayl formatini tekshiring.")
    } finally {
      setIsParsing(false)
    }
  }

  // 3. Ma'lumotlarni backend'ga yuklash (Import process)
  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid)
    if (validRows.length === 0) {
      toast.error("Yuklash uchun yaroqli taomlar yo'q")
      return
    }

    setIsUploading(true)
    setUploadProgress({ current: 0, total: validRows.length })

    // Category cache map (name lowercase -> _id)
    const categoryMap = {}
    categories.forEach((cat) => {
      if (cat.name) categoryMap[cat.name.trim().toLowerCase()] = cat._id
      if (cat._id) categoryMap[cat._id] = cat._id
    })

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      setUploadProgress({ current: i + 1, total: validRows.length })

      try {
        let categoryId = ''
        const targetCatName = (row.kategoriya || 'Boshqa').trim()
        const catNameLower = targetCatName.toLowerCase()

        if (categoryMap[catNameLower]) {
          categoryId = categoryMap[catNameLower]
        } else {
          // Kategoriya yaratilishi kerak
          try {
            const catRes = await createCategory({
              name: targetCatName,
              icon: 'UtensilsCrossed',
            })
            const newCat = catRes?.data?.data || catRes?.data || catRes
            if (newCat?._id) {
              categoryId = newCat._id
              categoryMap[catNameLower] = newCat._id
            } else {
              throw new Error("Kategoriya yaratishda ID olinmadi")
            }
          } catch (catErr) {
            console.error(`Kategoriya yaratishda xatolik ("${targetCatName}"):`, catErr)
            throw new Error(`Kategoriya yaratib bo'lmadi ("${targetCatName}")`)
          }
        }

        if (!categoryId) {
          throw new Error(`Kategoriya topilmadi yoki yaratib bo'lmadi ("${targetCatName}")`)
        }

        const formData = new FormData()
        formData.append('name', row.nom)
        formData.append('category', categoryId)
        formData.append('price', String(row.narx))
        formData.append('description', row.tavsif || '')
        formData.append('isAvailable', 'true')

        await createProduct(formData)
        successCount++
      } catch (err) {
        console.error(`Import failed for ${row.nom}:`, err)
        failCount++
      }
    }

    setIsUploading(false)

    if (successCount > 0) {
      toast.success(`${successCount} ta taom muvaffaqiyatli yuklandi!`)
      if (failCount > 0) {
        toast.warning(`${failCount} ta taomni yuklashda xatolik yuz berdi`)
      }
      onSuccess?.()
      handleClose()
    } else {
      toast.error("Taomlarni yuklashda xatolik yuz berdi")
    }
  }

  const validCount = parsedRows.filter((r) => r.isValid).length
  const invalidCount = parsedRows.length - validCount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative my-8 w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111827] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Excel'dan menyu yuklash
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Excel (.xlsx) fayli orqali ko'plab taomlarni bir vaqtda yuklang
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* Top Actions: Template & File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Download Template */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <FileText className="h-4 w-4 text-[#D9A968]" />
                  <span>1. Excel shablonini yuklab oling</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Jadval ustunlari: <strong className="text-slate-700 dark:text-slate-300">nom | kategoriya | narx | tavsif</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#D9A968]/30 bg-[#D9A968]/10 px-4 py-2 text-xs font-semibold text-[#D9A968] hover:bg-[#D9A968]/20 transition"
              >
                <Download className="h-4 w-4" />
                <span>Shablonni yuklab olish (.xlsx)</span>
              </button>
            </div>

            {/* Step 2: Upload File */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Upload className="h-4 w-4 text-emerald-500" />
                  <span>2. Excel faylni tanlang</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {fileName ? `Tanlangan: ${fileName}` : "Faqat .xlsx formatidagi Excel faylini yuklang"}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />

              <div className="mt-4 flex gap-2">
                <label
                  htmlFor="excel-file-input"
                  className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                >
                  <Upload className="h-4 w-4" />
                  <span>{fileName ? "Faylni almashtirish" : "Fayl tanlash"}</span>
                </label>

                {parsedRows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
                    title="Tozalash"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading parsing state */}
          {isParsing && (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 p-8 dark:border-slate-800">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Excel fayli tahlil qilinmoqda...
              </span>
            </div>
          )}

          {/* Preview Table Section */}
          {!isParsing && parsedRows.length > 0 && (
            <div className="space-y-3">
              {/* Summary Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100 p-3 dark:bg-slate-800/60 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Jami topildi: <strong>{parsedRows.length}</strong> ta
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Yaroqli: {validCount}
                  </span>
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1 text-rose-500 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Xatoli: {invalidCount}
                    </span>
                  )}
                </div>

                <span className="text-slate-400 text-[11px]">
                  * Xatoli qatorlar yuklashda o'tkazib yuboriladi
                </span>
              </div>

              {/* Table Container */}
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Nom (nom)</th>
                      <th className="px-3 py-2.5">Kategoriya</th>
                      <th className="px-3 py-2.5">Narx (narx)</th>
                      <th className="px-3 py-2.5">Tavsif (tavsif)</th>
                      <th className="px-3 py-2.5 text-center">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        className={
                          row.isValid
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            : 'bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20'
                        }
                      >
                        <td className="px-3 py-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">
                          {row.nom || <span className="text-rose-500 italic">Bo'sh</span>}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-block rounded-md bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 text-[11px]">
                            {row.kategoriya || 'Boshqa'}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-[#D9A968]">
                          {row.narx > 0 ? (
                            formatSom(row.narx)
                          ) : (
                            <span className="text-rose-500">0 so'm</span>
                          )}
                        </td>
                        <td className="px-3 py-2 max-w-[200px] truncate text-slate-500">
                          {row.tavsif || '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-500 font-medium" title={row.error}>
                              <AlertTriangle className="h-4 w-4" />
                              {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Uploading Progress Bar */}
          {isUploading && (
            <div className="space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Taomlar yuklanmoqda... ({uploadProgress.current}/{uploadProgress.total})
                </span>
                <span>
                  {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-950">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={isUploading || validCount === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Yuklanmoqda...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Yuklash ({validCount} ta taom)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
