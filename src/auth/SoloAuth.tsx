import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getEnv, getRequiredEnv } from '../lib/env';

const SOLO_USERNAME = getEnv('VITE_SOLO_USERNAME', 'whole2swole');
const SOLO_EMAIL = getEnv('VITE_SOLO_EMAIL', 'whole2swole@local.app');

type Props = {
  onSignedIn: () => void;
};

function isFourDigits(pin: string) {
  return /^\d{4}$/.test(pin);
}

export default function SoloAuth({ onSignedIn }: Props) {
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // sanity: throws a nice error early if env missing
  useEffect(() => {
    try {
      getRequiredEnv('VITE_SUPABASE_URL');
      getRequiredEnv('VITE_SUPABASE_PUBLISHABLE_KEY');
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const signIn = async () => {
    setError(null);

    if (!isFourDigits(pin)) {
      setError('PIN must be exactly 4 digits (like 1234).');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: SOLO_EMAIL,
        password: pin,
      });

      if (error) {
        setError(error.message);
        return;
      }

      onSignedIn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="title">whole2swole • Workout Tracker</h1>
          <p className="sub">Personal-only login (Username + 4-digit PIN).</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <div className="row">
          <div>
            <label className="small">Username</label>
            <input value={SOLO_USERNAME} disabled />
            <div className="small" style={{ marginTop: 6 }}>
              (This is fixed to your personal username.)
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <label className="small">4-digit PIN</label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            placeholder="1234"
          />
          <div className="small" style={{ marginTop: 6 }}>
            Under the hood this signs in as <b>{SOLO_EMAIL}</b>.
          </div>
        </div>

        <div style={{ marginTop: 12 }} className="row">
          <button onClick={signIn} disabled={busy}>
            {busy ? 'Signing in…' : 'Log In'}
          </button>
        </div>

        <div className="small" style={{ marginTop: 10 }}>
          If login fails: make sure you created the user in Supabase (Auth → Users) and set minimum password length to 4.
        </div>
      </div>
    </div>
  );
}
