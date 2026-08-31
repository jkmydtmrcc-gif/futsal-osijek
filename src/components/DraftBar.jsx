import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { discardDraft, hasDraft, subscribe } from '../content/store';

/**
 * Traka koja se javi kad u ovom pregledniku postoji neobjavljena skica.
 *
 * Bez nje urednik gleda vlastite izmjene i misli da su javne — a posjetitelji
 * vide nešto drugo. Zato traka stoji na vrhu i jasno kaže tko što vidi.
 */
export default function DraftBar() {
  const [visible, setVisible] = useState(hasDraft);

  useEffect(() => subscribe(() => setVisible(hasDraft())), []);

  if (!visible) return null;

  return (
    <div className="draftbar" role="status">
      <span className="draftbar__dot" aria-hidden="true" />
      <span className="draftbar__text">
        Gledaš <b>skicu</b> — posjetitelji i dalje vide objavljenu inačicu.
      </span>
      <Link className="draftbar__link" to="/admin">
        Objavi u administraciji
      </Link>
      <button type="button" className="draftbar__btn" onClick={discardDraft}>
        Odbaci skicu
      </button>
    </div>
  );
}
