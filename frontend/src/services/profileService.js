import { api } from './api'

export async function getMyProfile() {
  return api.get('/profile')
}
