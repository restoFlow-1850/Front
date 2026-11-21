import api from './axios'
import { normalizeSubscriptionStatus } from '../lib/subscription'

export async function getBillingStatus() {
  const response = await api.get('/billing/status')
  return normalizeSubscriptionStatus(response?.data?.data ?? response?.data ?? {})
}
