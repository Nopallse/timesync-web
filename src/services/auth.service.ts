import type { User } from '../types/user.types';

class AuthService {
  private apiUrl = import.meta.env.VITE_API_URL;

  async loginWithGoogle(): Promise<User> {
    // Redirect to backend OAuth route
    console.log(`${this.apiUrl}/auth/google`);
    window.location.href = `${this.apiUrl}/auth/google`;
    // This will never actually return as the page redirects
    return {} as User;
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/logout`, {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/status`, {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.success ? data.user : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();