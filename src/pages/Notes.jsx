import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth";
import { api } from "../api";
import { ErrorMessage, useList, ListState } from "../components";

export default function Notes({ admin = false }) {
  const { token } = useContext(AuthContext);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  useEffect(() => {
    if (!admin) return;
    const controller = new AbortController();
    async function loadMembers() {
      setMembersLoading(true);
      try {
        const allMembers = [];
        let page = 1;
        let totalPages = 1;
        do {
          const userPage = await api(`/admin/users?page=${page}&limit=100`, {
            token,
            signal: controller.signal,
          });
          allMembers.push(...userPage.results);
          totalPages = userPage.totalPages;
          page += 1;
        } while (page <= totalPages);
        if (!controller.signal.aborted) {
          setMembers(allMembers.sort((first, second) => first.name.localeCompare(second.name)));
        }
      } catch (error) {
        if (error.name !== "AbortError") setError(error.message);
      } finally {
        if (!controller.signal.aborted) setMembersLoading(false);
      }
    }
    loadMembers();
    return () => controller.abort();
  }, [admin, token]);
  const notesList = useList(
    admin ? `/admin/notes${selectedUserId ? `/user/${selectedUserId}` : ""}` : "/notes",
    refreshVersion,
  );
  async function handleDeleteNote(id) {
    if (!window.confirm("Delete this note?")) return;
    setError("");
    try {
      await api(`/notes/${id}`, { token, method: "DELETE" });
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setError(error.message);
    }
  }
  return (
    <>
      <div className="heading">
        <h1>{admin ? "All notes" : "My notes"}</h1>
        {!admin && (
          <Link className="button" to="/notes/new">
            New note
          </Link>
        )}
      </div>
      <p className="muted">{admin ? "Review notes across member accounts." : "Keep your plans, reminders, and unfinished ideas here."}</p>
      {admin && (
        <form
          className="inline"
          onSubmit={(event) => {
            event.preventDefault();
            notesList.setPage(1);
            setSelectedUserId(new FormData(event.currentTarget).get("userId").trim());
          }}
        >
          <label>
            Notes by
            <select name="userId" disabled={membersLoading}>
              <option value="">{membersLoading ? "Loading members…" : "Everyone"}</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </label>
          <button disabled={membersLoading}>Show notes</button>
        </form>
      )}
      <ErrorMessage error={error} />
      <ListState state={notesList} emptyMessage={admin ? "No notes from this member yet." : "No notes yet. Start with a reminder or an idea you want to keep."}>
        <div className="cards">
          {notesList.data?.results.map((note) => (
            <article key={note._id}>
              <h2>{note.title}</h2>
              <p className="content">{note.content}</p>
              <small>{new Date(note.createdAt).toLocaleString()}</small>
              {admin ? (
                <p className="muted">By {members.find((member) => member._id === note.userId)?.name || "Member"}</p>
              ) : (
                <div className="actions">
                  <Link to={`/notes/${note._id}/edit`}>Edit</Link>
                  <button className="danger" onClick={() => handleDeleteNote(note._id)}>
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </ListState>
    </>
  );
}
