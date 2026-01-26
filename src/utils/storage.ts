/**
 * Abstracted Storage Layer
 * * WEB: Uses localStorage
 * MOBILE: Will use Expo SecureStore (Async)
 * * We treat everything as async (Promise) right now so the 
 * switch to Mobile later is seamless.
 */

export const storage = {
  getToken: async (): Promise<string | null> => {
    // Check if we are in a browser environment
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  setToken: async (token: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  removeToken: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
};