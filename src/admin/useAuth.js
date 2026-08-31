import { useCallback, useEffect, useState } from 'react';
import { fetchSession, logout as apiLogout, requestCode, verifyCode } from '../content/api';

/**
 * Prijava urednika kodom iz SMS-a.
 *
 * Sesija živi u kolačiću koji JavaScript ne može pročitati, pa se stanje ne
 * čuva ovdje nego se pita poslužitelj. To znači i da odjava na jednom uređaju
 * stvarno gasi pristup — nema ničega u pregledniku što bi je nadživjelo.
 */
export default function useAuth() {
  const [state, setState] = useState({ loading: true, admin: null, setup: null });
  const [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await fetchSession();
      setState({ loading: false, admin: data.admin, setup: data.setup });
    } catch (err) {
      setState({ loading: false, admin: null, setup: null, offline: true });
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendCode = async (phone) => {
    setBusy(true);
    setError('');
    try {
      const data = await requestCode(phone);
      setChallenge({ id: data.challengeId, phone, devMode: data.devMode, message: data.message });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (code) => {
    if (!challenge?.id) {
      // Broj nije na popisu urednika: poslužitelj namjerno nije rekao ništa,
      // pa se ovdje ne izmišlja razlog nego se traži novi pokušaj.
      setError('Kod nije stigao. Provjeri broj i zatraži novi.');
      return false;
    }

    setBusy(true);
    setError('');
    try {
      await verifyCode(challenge.id, code);
      setChallenge(null);
      await refresh();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try {
      await apiLogout();
    } catch {
      /* i ako poziv padne, stanje se osvježava */
    }
    setChallenge(null);
    await refresh();
  };

  const reset = () => {
    setChallenge(null);
    setError('');
  };

  return { ...state, challenge, busy, error, setError, sendCode, confirmCode, signOut, reset, refresh };
}
