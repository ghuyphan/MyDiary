import React, { useState } from "react";
import Icon from "./Icon";
import FlatList from "./FlatList";
import { getTranslatedTopicTitle } from "../constants/initialData";

export default function Home({ data, setData, openTopic, openSettings, editMode, setEditMode, getTopicCount, t, showConfirm, showPrompt, onBodySwap }) {
  const [query, setQuery] = useState("");
  const topics = data.topics.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  const handleDeleteTopic = async (topic) => {
    if (await showConfirm(t("delete_topic_confirm", topic.title))) {
      setData({
        ...data,
        topics: data.topics.filter(t => t.id !== topic.id),
        memos: data.memos.filter(m => m.topicId !== topic.id)
      });
    }
  };

  const handleRenameTopic = async (topic) => {
    const newName = await showPrompt(t("rename_topic_prompt", topic.title), topic.title);
    if (newName && newName.trim()) {
      setData({
        ...data,
        topics: data.topics.map(t => t.id === topic.id ? { ...t, title: newName.trim() } : t)
      });
    }
  };

  return (
    <main className="screen home-screen">
      <div className="profile-header-container">
        <button className="profile-header" onClick={openSettings} aria-label={t("settings_btn")}>
          <span className="profile-photo"><Icon name="ic_person_picture_default.png" /></span>
          <span className="profile-name">{data.userName}</span>
        </button>
        <button className="body-swap-btn" onClick={onBodySwap} title={t("swap_body")}>
          <Icon name="ic_memo_swap_vert_black_24dp.png" className="swap-icon" />
          <span>{t("swap_body")}</span>
        </button>
      </div>
      <FlatList
        className="topic-list"
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TopicRow
            item={item}
            count={getTopicCount(item)}
            onClick={() => openTopic(item)}
            editMode={editMode}
            onDelete={handleDeleteTopic}
            onRename={handleRenameTopic}
            index={index}
            t={t}
          />
        )}
      />
      <div className="home-search-bar">
        <label className="native-search">
          <Icon name="ic_search_white_18dp.png" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={t("search_topics")} placeholder={t("search_topics")} />
        </label>
        <button onClick={() => setEditMode(!editMode)} aria-label={t("edit_topics")} style={{ marginRight: '5px' }}>
          <Icon name={editMode ? "ic_mode_edit_cancel_white_24dp.png" : "ic_mode_edit_white_24dp.png"} style={{ filter: "invert(1)" }} />
        </button>
        <button onClick={openSettings} aria-label={t("settings_btn")}><Icon name="ic_settings_black_24dp.png" /></button>
      </div>
    </main>
  );
}

const TopicRow = React.memo(function TopicRow({ item, onClick, count, editMode, onDelete, onRename, index = 0, t }) {
  const icon = item.type === "diary" ? "ic_topic_diary.png" : item.type === "contacts" ? "ic_topic_contacts.png" : "ic_topic_memo.png";
  return (
    <div className="topic-row-wrapper anim-stagger-item" style={{ "--stagger-i": index }}>
      <button className="topic-row" onClick={editMode ? undefined : onClick} style={{ flex: 1 }}>
        <Icon name={icon} />
        <span>{getTranslatedTopicTitle(item.title, t)}</span>
        <small>{count}</small>
        {!editMode && <Icon name="ic_keyboard_arrow_right_black_24dp.png" />}
      </button>
      {editMode && (
        <div className="topic-edit-actions" style={{ display: 'flex', gap: '5px', paddingRight: '15px' }}>
          <button onClick={() => onRename(item)} aria-label="Rename topic" style={{ background: 'transparent', padding: '5px' }}>
            <Icon name="ic_mode_edit_white_24dp.png" style={{ filter: 'invert(1)' }} />
          </button>
          <button onClick={() => onDelete(item)} aria-label="Delete topic" style={{ background: 'transparent', padding: '5px' }}>
            <Icon name="ic_cancel_black_24dp.png" />
          </button>
        </div>
      )}
    </div>
  );
});
