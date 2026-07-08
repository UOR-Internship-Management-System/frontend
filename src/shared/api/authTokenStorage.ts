import { storageKeys } from '../constants/storageKeys'

export const authTokenStorage = {
  getToken: () => window.sessionStorage.getItem(storageKeys.accessToken),
  setToken: (token: string) => window.sessionStorage.setItem(storageKeys.accessToken, token),
  clearToken: () => window.sessionStorage.removeItem(storageKeys.accessToken),
}
