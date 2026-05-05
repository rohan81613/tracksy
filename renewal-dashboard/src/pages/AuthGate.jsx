import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';

export default function AuthGate({ children }) {
  const { currentUser, authLoading } = useAuth();
  const [view, setView] = useState('login');

  if (authLoading) return null;
  if (currentUser) return children;

  return view === 'login'
    ? <Login onSwitch={() => setView('signup')} />
    : <Signup onSwitch={() => setView('login')} />;
}
