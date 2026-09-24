import { useState, useMemo } from 'react'
import { Grid3X3, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Layers } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button, Card } from '../../../components/ui'
import { parseHallsAndTablesInput } from '../utils/wizardParsers'

const DEFAULT_HALLS_TEXT = `Asosiy zal: 20 stol\nVIP zal: 5 stol\nTeras: 10 stol`

export default function Step3HallsTables({ data, onNext, onPrev }) {
  const [textInput, setTextInput] = useState(data.hallsText || DEFAULT_HALLS_TEXT)

  const parsedHalls = useMemo(() => {
    return parseHallsAndTablesInput(textInput)
  }, [textInput])

  const totalTablesCount = useMemo(() => {
    return parsedHalls.reduce((sum, h) => sum + h.count, 0)
  }, [parsedHalls])

  const handleFillDemo = () => {
    setTextInput(`Asosiy zal: 20 stol\nVIP zal: 5 stol\nTeras: 10 stol\nBanket zali: 15 stol`)
  }

  const handleSubmit = () => {
    if (parsedHalls.length === 0 || totalTablesCount === 0) {
      toast.error('Kamida 1 ta zal va 1 ta stol kiritilishi kerak!')
      return
    }
    onNext({
      hallsText: textInput,
      halls: parsedHalls,
      totalTables: totalTablesCount,
    })
  }

  return (
    <Card className="p-6 max-w-3xl mx-auto shadow-xl border-[#C89B5E]/30 bg-[#1e1112]">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Grid3X3 className="text-[#C89B5E] w-6 h-6" />
            3-Qadam: Zallar va stollar (Avto-generator)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Zallarni va stollar sonini matn shaklida kiriting — tizim ularni avtomatik yaratadi.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFillDemo}
          className="border-[#C89B5E]/40 text-[#C89B5E] hover:bg-[#C89B5E]/10 gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Namuna kiritish
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Zallar va stollar ro'yxati (Har bir qatorda bittadan)
          </label>
          <textarea
            rows={6}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Asosiy zal: 20 stol\nVIP zal: 5 stol\nTeras: 10 stol`}
            className="w-full bg-[#120909] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#C89B5E] font-mono leading-relaxed resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Format namunasi: <code className="text-[#C89B5E]">Zal nomi: N stol</code>
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C89B5E]" />
            Avtomatik shakllantiriladigan zallar ({parsedHalls.length} zal, {totalTablesCount} stol)
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {parsedHalls.length === 0 ? (
              <div className="text-xs text-gray-500 p-4 border border-dashed border-gray-800 rounded-xl text-center">
                Chap tomondagi maydonga zallarni kiriting.
              </div>
            ) : (
              parsedHalls.map((hall, idx) => (
                <div
                  key={idx}
                  className="bg-[#170c0d] border border border-gray-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#C89B5E]/20 text-[#C89B5E] flex items-center justify-center font-bold text-xs">
                      Z{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{hall.name}</h4>
                      <p className="text-xs text-gray-400">
                        {hall.count} ta stol ({hall.name} — 1, ... {hall.name} — {hall.count})
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium">
                    {hall.count} stol
                  </span>
                </div>
              ))
            )}
          </div>
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
          Keyingi qadam: QR paket (A4 PDF)
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
