// Demo ma'lumotlar — backend javob bermasa oshxona panelini sinash uchun.
// Shakl real backend kontraktiga mos: items = [{ product, quantity }], notes.
import { ORDER_STATUS } from '../../constants/roles'

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString()

export const MOCK_ORDERS = [
  {
    id: 'ord_1042',
    table: '4',
    waiter: 'Aziza',
    status: ORDER_STATUS.NEW,
    createdAt: minutesAgo(2),
    items: [
      { product: "Lag'mon", quantity: 2 },
      { product: 'Choy', quantity: 2 },
    ],
    notes: '',
  },
  {
    id: 'ord_1041',
    table: '7',
    waiter: 'Bekzod',
    status: ORDER_STATUS.NEW,
    createdAt: minutesAgo(6),
    items: [{ product: 'Osh', quantity: 1 }],
    notes: 'Piyozsiz',
  },
  {
    id: 'ord_1038',
    table: '2',
    waiter: 'Aziza',
    status: ORDER_STATUS.IN_KITCHEN,
    createdAt: minutesAgo(9),
    items: [
      { product: 'Shashlik', quantity: 3 },
      { product: 'Salat', quantity: 1 },
    ],
    notes: '',
  },
  {
    id: 'ord_1035',
    table: '12',
    waiter: 'Nodira',
    status: ORDER_STATUS.IN_KITCHEN,
    createdAt: minutesAgo(15),
    items: [{ product: 'Manti', quantity: 4 }],
    notes: 'Tezroq, mijoz shoshilmoqda',
  },
  {
    id: 'ord_1030',
    table: '9',
    waiter: 'Bekzod',
    status: ORDER_STATUS.READY,
    createdAt: minutesAgo(20),
    items: [{ product: 'Norin', quantity: 2 }],
    notes: '',
  },
]
