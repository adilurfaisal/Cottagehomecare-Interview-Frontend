import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth";
import { api } from "../api";
import { ErrorMessage, UserFields, useList, ListState } from "../components";
import { readUserForm } from "../formUtils";

export default function AdminUsers() {
  const { token } = useContext(AuthContext);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const usersList = useList("/admin/users", refreshVersion);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  async function handleEditUser(id) {
    setError("");
    setIsSaving(true);
    try {
      setSelectedUser(await api(`/admin/users/${id}`, { token }));
      setIsFormOpen(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }
  async function handleSaveUser(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    const body = readUserForm(event.currentTarget);
    try {
      await api(`/admin/users${selectedUser ? `/${selectedUser._id}` : ""}`, {
        token,
        method: selectedUser ? "PATCH" : "POST",
        body,
      });
      setIsFormOpen(false);
      setSelectedUser(null);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }
  async function handleDeleteUser(user) {
    if (!window.confirm(`Delete ${user.name} and all their notes and posts?`))
      return;
    setIsSaving(true);
    setError("");
    try {
      await api(`/admin/users/${user._id}`, { token, method: "DELETE" });
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <>
      <div className="heading">
        <h1>Users</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsFormOpen(true);
            setError("");
          }}
        >
          Add user
        </button>
      </div>
      <ErrorMessage error={error} />
      {isFormOpen && (
        <section className="panel">
          <h2>{selectedUser ? "Edit user" : "Create user"}</h2>
          <form key={selectedUser?._id || "new"} onSubmit={handleSaveUser}>
            <UserFields user={selectedUser} admin />
            <div className="actions">
              <button disabled={isSaving}>{isSaving ? "Saving…" : "Save user"}</button>
              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      <ListState state={usersList}>
        <div className="cards">
          {usersList.data?.results.map((user) => (
            <article key={user._id}>
              <h2>{user.name}</h2>
              <p>
                {user.email} · {user.role === "admin" ? "Administrator" : "Member"}
              </p>
              <p>{(user.interests || []).join(", ")}</p>
              <div className="actions">
                <button
                  disabled={isSaving}
                  className="secondary"
                  onClick={() => handleEditUser(user._id)}
                >
                  Edit details
                </button>
                <button
                  disabled={isSaving}
                  className="danger"
                  onClick={() => handleDeleteUser(user)}
                >
                  Delete
                </button>
                <Link to={`/posts/user/${user._id}`}>Posts</Link>
              </div>
            </article>
          ))}
        </div>
      </ListState>
    </>
  );
}
