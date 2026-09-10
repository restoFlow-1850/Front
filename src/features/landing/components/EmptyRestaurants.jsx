import { FiInbox } from 'react-icons/fi'

export default function EmptyRestaurants() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2a1315]">
        <FiInbox className="h-8 w-8 text-[#8a7373]" />
      </div>
      <h3 className="text-lg font-bold text-[#E6DCDC]">Restoranlar topilmadi</h3>
      <p className="mt-2 max-w-sm text-sm text-[#9a8080]">
        Hozircha ro'yxatda restoranlar mavjud emas. Tez orada qo'shiladi!
      </p>
    </div>
  )
}
