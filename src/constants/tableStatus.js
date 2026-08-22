export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning'
};

export const TABLE_STATUS_LABELS = {
  [TABLE_STATUS.AVAILABLE]: "Bo'sh",
  [TABLE_STATUS.OCCUPIED]: 'Band',
  [TABLE_STATUS.RESERVED]: 'Bron qilingan',
  [TABLE_STATUS.CLEANING]: 'Tozalanmoqda',
};

export const TABLE_STATUS_COLORS = {
  [TABLE_STATUS.AVAILABLE]: '#22C55E',
  [TABLE_STATUS.OCCUPIED]: '#EF4444',
  [TABLE_STATUS.RESERVED]: '#F59E0B',
  [TABLE_STATUS.CLEANING]: '#94A3B8',
};

// Only tables in these statuses can receive a transferred order
export const TRANSFERABLE_TARGET_STATUSES = [TABLE_STATUS.AVAILABLE];