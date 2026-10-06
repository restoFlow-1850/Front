import { useEffect, useState } from 'react'
import { PackagePlus, Pencil } from 'lucide-react'
import { Modal, Button, Input, Select } from '../../../components/ui'

const UNITS = [
  { value: 'kg', label: 'Kilogramm (kg)' },
  { value: 'l', label: 'Litr (l)' },
  { value: 'dona', label: 'Dona' },
]

export default function IngredientModal({ isOpen, onClose, onSave, ingredient, submitting }) {
  const isEdit = Boolean(ingredient)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('kg')
  const [minStock, setMinStock] = useState('')
  const [lastPrice, setLastPrice] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setName(ingredient?.name ?? '')
    setUnit(ingredient?.unit ?? 'kg')
    setMinStock(ingredient?.minStock != null ? String(ingredient.minStock) : '')
    setLastPrice(ingredient?.lastPrice != null ? String(ingredient.lastPrice) : '')
  }, [isOpen, ingredient])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      unit,
      minStock: Number(minStock) || 0,
      lastPrice: Number(lastPrice) || 0,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit ? (
          <span className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-[#F97316]" /> Xomashyoni tahrirlash
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-[#F97316]" /> Yangi xomashyo
          </span>
        )
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting}>
            {isEdit ? 'Saqlash' : 'Qo‘shish'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Xomashyo nomi *"
          placeholder="Masalan: Guruch"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <Select
          label="O‘lchov birligi *"
          value={unit}
          options={UNITS}
          onChange={(e) => setUnit(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Minimum qoldiq (ogohlantirish)"
            type="number"
            step="any"
            min="0"
            placeholder="Masalan: 5"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
          <Input
            label="Oxirgi sotib olish narxi (so'm)"
            type="number"
            step="100"
            min="0"
            placeholder="Masalan: 12000"
            value={lastPrice}
            onChange={(e) => setLastPrice(e.target.value)}
          />
        </div>
        {isEdit && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Joriy qoldiqni o‘zgartirmang — buning uchun «Kirim» / «Inventarizatsiya» dan foydalaning.
          </p>
        )}
      </form>
    </Modal>
  )
}