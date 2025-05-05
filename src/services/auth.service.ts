import type { User } from '../types/user.types';

// Mock auth service using local storage for demo
class AuthService {
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async loginWithGoogle(): Promise<User> {
    // Simulate API call
    await this.delay(1000);
    
    const mockUser: User = {
      id: '1',
      email: 'user@example.com',
      name: 'John Doe',
      photoURL: 'https://via.placeholder.com/32',
      createdAt: new Date(),
      googleId: 'google-123',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isAuthenticated', 'true');
    
    return mockUser;
  }

  async logout(): Promise<void> {
    // Simulate API call
    await this.delay(500);
    
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }

  async getCurrentUser(): Promise<User | null> {
    // Simulate API call
    await this.delay(500);
    
    const userJson = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userJson && isAuthenticated === 'true') {
      return JSON.parse(userJson);
    }
    
    return null;
  }
}

export const authService = new AuthService();