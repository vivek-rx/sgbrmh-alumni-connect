export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  batch?: string;
  profession?: string;
  company?: string;
  location?: string;
  bio?: string;
  role: 'admin' | 'alumni' | 'student';
  createdAt: Date;
  updatedAt: Date;
}