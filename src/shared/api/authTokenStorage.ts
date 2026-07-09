import { storageKeys } from '../constants/storageKeys'

export const authTokenStorage = {
  getToken: () =>
    typeof window === 'undefined' ? null : window.sessionStorage.getItem(storageKeys.accessToken),
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(storageKeys.accessToken, token)
    }
  },
  clearToken: () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(storageKeys.accessToken)
    }
  },
}
