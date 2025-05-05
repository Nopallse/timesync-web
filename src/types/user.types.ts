export interface User {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
    createdAt: Date;
    googleId?: string;
  }
  
  export interface GoogleOAuthToken {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  }