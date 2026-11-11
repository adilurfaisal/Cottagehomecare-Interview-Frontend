import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth";
import { api } from "../api";
import { ErrorMessage, UserFields } from "../components";
import { readUserForm } from "../formUtils";

export default function Profile() {
  const { user, token, setUser } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  async function handleSaveProfile(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    const body = readUserForm(event.currentTarget);
    try {
      setUser(await api("/auth/me", { token, method: "PATCH", body }));
      setMessage("Profile saved.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <section className="narrow">
      <h1>My profile</h1>
      <p className="muted">Update your details and the things you're interested in.</p>
      <form onSubmit={handleSaveProfile}>
        <UserFields user={user} />
        <ErrorMessage error={error} />
        <p role="status">{message}</p>
        <button disabled={isSaving}>{isSaving ? "Saving…" : "Save profile"}</button>
      </form>
      <p>
        <Link to={`/posts/user/${user._id}`}>My public posts</Link>
      </p>
    </section>
  );
}
