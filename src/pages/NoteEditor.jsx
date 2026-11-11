import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../auth";
import { api } from "../api";
import { ErrorMessage } from "../components";

export default function NoteEditor() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [note, setNote] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    api(`/notes/${id}`, { token, signal: controller.signal })
      .then((savedNote) => {
        if (!controller.signal.aborted) setNote(savedNote);
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== "AbortError") {
          setError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, token]);
  async function handleSaveNote(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await api(id ? `/notes/${id}` : "/notes", {
        token,
        method: id ? "PUT" : "POST",
        body: { title: note.title, content: note.content },
      });
      navigate("/notes");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }
  if (loading) return <p>Loading note…</p>;
  return (
    <section className="narrow">
      <h1>{id ? "Edit note" : "Create note"}</h1>
      <form onSubmit={handleSaveNote}>
        <label>
          Title
          <input
            required
            maxLength={200}
            value={note.title}
            onChange={(event) => setNote({ ...note, title: event.target.value })}
          />
        </label>
        <label>
          Content
          <textarea
            required
            maxLength={20000}
            rows={12}
            value={note.content}
            onChange={(event) => setNote({ ...note, content: event.target.value })}
          />
        </label>
        <ErrorMessage error={error} />
        <div className="actions">
          <button disabled={isSaving}>{isSaving ? "Saving…" : "Save note"}</button>
          <Link to="/notes">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
