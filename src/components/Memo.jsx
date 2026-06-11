import React, { useState } from "react";
import NativeTitle from "./NativeTitle";
import Icon from "./Icon";
import FlatList from "./FlatList";
import { getTranslatedTopicTitle, getTranslatedMemoText } from "../constants/initialData";

export default function Memo({ data, setData, topicId, title, goHome, t }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const activeTopicId = topicId || "rules";
  const topicMemos = data.memos.filter((memo) => (memo.topicId || "rules") === activeTopicId);

  const add = () => {
    if (!text.trim()) return;
    setData({ ...data, memos: [...data.memos, { id: Date.now(), text, checked: false, topicId: activeTopicId }] });
    setText("");
  };

  return (
    <main className="screen memo-screen">
      <NativeTitle title={getTranslatedTopicTitle(title, t)} goHome={goHome}>
        <button onClick={() => setEditing(!editing)}><Icon name={editing ? "ic_mode_edit_cancel_white_24dp.png" : "ic_mode_edit_white_24dp.png"} /></button>
      </NativeTitle>
      {editing && (
        <div className="memo-add">
          <input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && add()} placeholder={t("add")} />
          <button onClick={add}><Icon name="ic_add_white_24dp.png" /></button>
        </div>
      )}
      <FlatList
        className="memo-list"
        data={topicMemos}
        keyExtractor={(memo) => memo.id}
        renderItem={({ item, index }) => (
          <label className={`${item.checked ? "checked" : ""} anim-stagger-item`} style={{ "--stagger-i": index }}>
            <Icon name="ic_memo_dot_24dp.png" />
            <input type="checkbox" checked={item.checked} onChange={() => setData({ ...data, memos: data.memos.map((m) => m.id === item.id ? { ...m, checked: !m.checked } : m) })} />
            <span>{getTranslatedMemoText(item.text, t)}</span>
            {editing && <button onClick={() => setData({ ...data, memos: data.memos.filter((m) => m.id !== item.id) })}><Icon name="ic_cancel_black_24dp.png" /></button>}
          </label>
        )}
      />
    </main>
  );
}
