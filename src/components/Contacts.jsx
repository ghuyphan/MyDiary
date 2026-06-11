import React, { useState } from "react";
import Icon from "./Icon";
import FlatList from "./FlatList";
import NativeDialog from "./NativeDialog";
import FakeCallScreen from "./FakeCallScreen";
import { getTranslatedTopicTitle } from "../constants/initialData";

export default function Contacts({ data, setData, title, goHome, t, showConfirm }) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [callingContact, setCallingContact] = useState(null);
  const [draft, setDraft] = useState({ name: "", phone: "" });
  
  const filtered = data.contacts.filter((item) => `${item.name}${item.phone}`.toLowerCase().includes(query.toLowerCase()));
  
  const save = () => {
    if (!draft.name.trim()) return;
    setData({ ...data, contacts: [...data.contacts, { ...draft, id: Date.now() }] });
    setDraft({ name: "", phone: "" });
    setAdding(false);
  };

  const deleteContact = async (contactId) => {
    if (await showConfirm(t("delete_contact_confirm"))) {
      setData({ ...data, contacts: data.contacts.filter(c => c.id !== contactId) });
    }
  };

  return (
    <main className="screen contacts-screen">
      <header className="contacts-header">
        <button className="contacts-back" onClick={goHome} aria-label="Back">‹</button>
        <span className="contacts-title">{getTranslatedTopicTitle(title, t)}</span>
        <button className="contacts-add" onClick={() => setAdding(true)} aria-label={t("add_contact")}>
          <svg viewBox="0 0 24 24" style={{ width: '22px', height: '22px', stroke: 'currentColor', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <label className="native-search"><Icon name="ic_search_white_18dp.png" /><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </header>
      <div className="letters">A<br />B<br />C<br />D<br />E<br />F<br />G<br />H<br />I<br />J<br />K<br />L<br />M<br />N<br />O<br />P<br />Q<br />R<br />S<br />T<br />U<br />V<br />W<br />X<br />Y<br />Z</div>
      <FlatList
        className="contact-list"
        data={filtered}
        keyExtractor={(contact) => contact.id}
        renderItem={({ item, index }) => (
          <div className="anim-stagger-item" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cacaca', "--stagger-i": index }}>
            <button className="contact-call-target" onClick={() => setCallingContact(item)}>
              <span className="profile-photo"><Icon name="ic_person_picture_default.png" /></span>
              <span><b>{item.name}</b><small>{item.phone}</small></span>
            </button>
            <button onClick={() => deleteContact(item.id)} style={{ background: 'transparent', padding: '10px' }} aria-label={t("delete_contact_confirm")}>
              <Icon name="ic_cancel_black_24dp.png" />
            </button>
          </div>
        )}
      />
      {adding && (
        <NativeDialog title={t("contact_dialog_title")} close={() => setAdding(false)}>
          <div className="ios-form-fields">
            <input placeholder={t("name")} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} autoFocus />
            <input placeholder={t("phone")} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} inputMode="tel" />
          </div>
          <div className="ios-form-actions">
            <button className="ios-form-cancel" onClick={() => setAdding(false)}>{t("cancel")}</button>
            <button className="ios-form-ok" onClick={save}>{t("ok")}</button>
          </div>
        </NativeDialog>
      )}
      {callingContact && (
        <FakeCallScreen
          contact={callingContact}
          close={() => setCallingContact(null)}
          t={t}
        />
      )}
    </main>
  );
}
