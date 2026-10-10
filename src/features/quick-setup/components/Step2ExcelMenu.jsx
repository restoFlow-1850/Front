import { useState, useRef } from 'react'
import ExcelJS from 'exceljs'
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button, Card } from '../../../components/ui'
import { parseExcelPrice } from '../../menu/components/ExcelImportModal'
import { DEMO_MENU_DATA } from '../utils/wizardParsers'
import { formatSom } from '../../../lib/api'

export default function Step2ExcelMenu({ data, onNext, onPrev }) {
  const fileInputRef = useRef(null)
  const [items, setItems] = useState(data.menuItems || DEMO_MENU_DATA)
  const [fileName, setFileName] = useState(data.fileName || '')
  const [isParsing, setIsParsing] = useState(false)

  // 1. Download Excel template
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

      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9A968' },
      }

      DEMO_MENU_DATA.forEach((item) => worksheet.addRow(item))

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

      toast.info('Excel shabloni yuklab olindi!')
    } catch (err) {
      console.error(err)
      toast.error('Shablonni yuklab olishda xatolik yuz berdi')
    }
  }

  // 2. Parse Excel file using parseExcelPrice fix
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('Faqat .xlsx formatidagi Excel fayllari qabul qilinadi')
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
        toast.error('Excel faylida varaq topilmadi')
        setIsParsing(false)
        return
      }

      const rows = []
      let headerIndices = { nom: 1, kategoriya: 2, narx: 3, tavsif: 4 }
      let headerRowFound = false

      worksheet.eachRow((row, rowNumber) => {
        const values = row.values.map((val) => {
          if (val === null || val === undefined) return ''
          if (typeof val === 'object') {
            if (val.result !== undefined) return String(val.result)
            if (val.text !== undefined) return String(val.text)
            if (val.richText) return val.richText.map((t) => t.text).join('')
          }
          return String(val).trim()
        })

        if (!headerRowFound) {
          const lowerValues = values.map((v) => v.toLowerCase())
          const nomIdx = lowerValues.findIndex((v) => ['nom', 'name', 'taom'].includes(v))
          const catIdx = lowerValues.findIndex((v) => ['kategoriya', 'category', 'tur'].includes(v))
          const priceIdx = lowerValues.findIndex((v) => ['narx', 'price', 'narxi', 'cost', 'sum'].includes(v))
          const descIdx = lowerValues.findIndex((v) => ['tavsif', 'description', 'izoh'].includes(v))

          if (nomIdx !== -1 || priceIdx !== -1) {
            headerIndices = {
              nom: nomIdx !== -1 ? nomIdx : 1,
              kategoriya: catIdx !== -1 ? catIdx : 2,
              narx: priceIdx !== -1 ? priceIdx : 3,
              tavsif: descIdx !== -1 ? descIdx : 4,
            }
            headerRowFound = true
            return
          }
        }

        const rawNom = values[headerIndices.nom] || values[1] || ''
        const rawKat = values[headerIndices.kategoriya] || values[2] || 'Boshqa'
        const rawPriceVal = row.values[headerIndices.narx] ?? row.values[3]
        const rawDesc = values[headerIndices.tavsif] || values[4] || ''

        if (rawNom && rawNom.toLowerCase() !== 'nom') {
          const parsedPrice = parseExcelPrice(rawPriceVal)
          rows.push({
            nom: rawNom,
            kategoriya: rawKat || 'Milliy taomlar',
            narx: parsedPrice,
            tavsif: rawDesc,
          })
        }
      })

      if (rows.length === 0) {
        toast.warning('Excel faylida taomlar topilmadi, demo menyu saqlab qolindi')
      } else {
        setItems(rows)
        toast.success(`Excel faylidan ${rows.length} ta taom muvaffaqiyatli tahlil qilindi!`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Excel faylini o\'qishda xatolik yuz berdi')
    } finally {
      setIsParsing(false)
    }
  }

  const handleLoadDemo = () => {
    setItems(DEMO_MENU_DATA)
    setFileName('Demo Menyu (8 ta taom)')
    toast.info('Demo menyu yuklandi')
  }

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error('Menyuda kamida 1 ta taom bo\'lishi kerak!')
      return
    }
    onNext({ menuItems: items, fileName })
  }

  return (
    <Card className="p-6 max-w-3xl mx-auto shadow-xl border-[#C89B5E]/30 bg-[#1e1112]">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="text-[#C89B5E] w-6 h-6" />
            2-Qadam: Menyu (Excel'dan yuklash)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Excel fayl orqali menyuni avtomatik yuklang yoki tayyor demo menyudan foydalaning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-1.5"
          >
            <Download className="w-4 h-4 text-[#C89B5E]" />
            Shablon (.xlsx)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadDemo}
            className="border-[#C89B5E]/40 text-[#C89B5E] hover:bg-[#C89B5E]/10 gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Demo menyu
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#C89B5E]/40 hover:border-[#C89B5E] bg-[#1a0e0f] rounded-xl p-6 text-center cursor-pointer transition-colors"
        >
          <Upload className="w-10 h-10 text-[#C89B5E] mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-200">
            {fileName ? (
              <span className="text-[#C89B5E] font-semibold">{fileName} yuklandi</span>
            ) : (
              'Excel faylini shu yerga tashlang yoki kompyuterdan tanlang (.xlsx)'
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Narx bugi avtomatik to'g'rilanadi (masalan: "45.000" → 45,000 so'm)
          </p>
        </div>
      </div>

      {/* Preview Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Yuklanadigan taomlar ({items.length} ta)
          </h3>
          <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
            Tayyor
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-800 bg-[#120909]">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1e1112] text-gray-400 uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">Taom nomi</th>
                <th className="p-2.5">Kategoriya</th>
                <th className="p-2.5 text-right">Narxi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#1a0d0e]">
                  <td className="p-2.5 text-gray-500">{idx + 1}</td>
                  <td className="p-2.5 font-medium text-white">{item.nom}</td>
                  <td className="p-2.5">
                    <span className="bg-[#C89B5E]/20 text-[#C89B5E] px-2 py-0.5 rounded text-[11px]">
                      {item.kategoriya}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-semibold text-emerald-400">
                    {formatSom(item.narx)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-800 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="border-gray-700 text-gray-300 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Orqaga
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-[#C89B5E] hover:bg-[#b08449] text-[#1e1112] font-semibold px-6 gap-2"
        >
          Keyingi qadam: Zallar va stollar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
