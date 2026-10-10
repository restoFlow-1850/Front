import { useState } from 'react'
import { Building2, MapPin, Phone, Globe, Navigation, Sparkles, ArrowRight } from 'lucide-react'
import { Button, Card, Input } from '../../../components/ui'

export default function Step1RestaurantInfo({ data, onNext }) {
  const [form, setForm] = useState({
    name: data.name || '',
    city: data.city || 'Toshkent',
    address: data.address || '',
    phone: data.phone || '+998 90 ',
    coords: data.coords || '41.311081, 69.240562',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFillDemo = () => {
    setForm({
      name: 'Rayhon Milliy Taomlari',
      city: 'Toshkent',
      address: 'Chilonzor tumani, 14-mavze, 24-uy',
      phone: '+998 90 123 45 67',
      coords: '41.311081, 69.240562',
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onNext(form)
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto shadow-xl border-[#C89B5E]/30 bg-[#1e1112]">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-[#C89B5E] w-6 h-6" />
            1-Qadam: Restoran ma'lumotlari
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Restoraningizning asosiy revizitsion rekvizitlari va joylashuv ma'lumotlarini kiriting.
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
          Demo ma'lumotlar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Restoran nomi <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masalan: Rayhon Milliy Taomlari"
              required
              className="pl-10"
            />
            <Building2 className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Shahar / Viloyat <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Toshkent"
                required
                className="pl-10"
              />
              <Globe className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Telefon raqami <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+998 90 123 45 67"
                required
                className="pl-10"
              />
              <Phone className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Manzil <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Chilonzor tumani, 14-mavze, 24-uy"
              required
              className="pl-10"
            />
            <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Xaritaning GPS koordinatasi (Kenglik, Uzunlik)
          </label>
          <div className="relative">
            <Input
              name="coords"
              value={form.coords}
              onChange={handleChange}
              placeholder="41.311081, 69.240562"
              className="pl-10"
            />
            <Navigation className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mehmonlar uchun menyuda xaritada ko'rsatish maqsadida ishlatiladi.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <Button
            type="submit"
            className="bg-[#C89B5E] hover:bg-[#b08449] text-[#1e1112] font-semibold px-6 gap-2"
          >
            Keyingi qadam: Menyu
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
