import { create } from 'zustand'


/**
 * auth.store.ts
 *
 * Simple authentication store responsible for retrieving and caching a
 * local JWT used to authenticate requests to the local backend. The token
 * is stored in `localStorage` under `knemos_jwt` and retrieved via either
 * direct access or a Tauri `get_auth_token` invocation when necessary.
 *
 * `authenticatedFetch` is a helper that ensures the token is available and
 * attaches it to the `Authorization` header for outbound HTTP requests.
 */

interface AuthState {
  token: string
  fetchToken: () => Promise<void>
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: '',
  fetchToken: async () => {
    try {
      let token = localStorage.getItem('knemos_jwt') || ''
      if (!token) {
        const { invoke } = await import('@tauri-apps/api/core')
        token = await invoke('get_auth_token')
        if (token) {
          localStorage.setItem('knemos_jwt', token)
        }
      }
      set({ token })
    } catch (e) {
      console.error('[Auth] Failed to get auth token', e)
    }
  },
  setToken: (token: string) => {
    localStorage.setItem('knemos_jwt', token)
    set({ token })
  }
}))

// Helper to attach token to fetch requests
/**
 * Perform a fetch with the stored auth token attached when available.
 * This helper will attempt to fetch the token from the store if it is
 * missing before making the request.
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  let { token } = useAuthStore.getState()
  
  if (!token) {
    await useAuthStore.getState().fetchToken()
    token = useAuthStore.getState().token
  }
  
  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  return fetch(url, { ...options, headers })
}
