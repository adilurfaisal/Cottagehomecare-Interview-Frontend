import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useSearchParams } from "react-router-dom";
import { AuthContext } from "./auth";
import { api } from "./api";

export function ErrorMessage({ error }) {
  return error ? (
    <p role="alert" className="error">
      {error}
    </p>
  ) : null;
}
export function Layout() {
  const { user, logout } = useContext(AuthContext);
  return (
    <>
      <header>
        <Link className="brand" to="/notes">
          Secure Notes
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/posts">Public posts</NavLink>
          {user ? (
            <>
              <NavLink to="/notes">My notes</NavLink>
              <NavLink to="/interests">Interests</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              {user.role === "admin" && (
                <>
                  <NavLink to="/admin/users">Users</NavLink>
                  <NavLink to="/admin/notes">All notes</NavLink>
                </>
              )}
              <button className="secondary" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Create account</NavLink>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>Secure Notes</footer>
    </>
  );
}
export function useList(path, refresh = 0) {
  const { token } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const requestedPage = Number(params.get("page"));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, data: null, error: "" });
    api(`${path}?page=${page}&limit=10`, { token, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: "" });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== "AbortError")
          setState({ data: null, loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [path, page, token, refresh]);
  function setPage(nextPage) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set("page", String(nextPage));
      return next;
    });
  }

  return { ...state, setPage };
}
export function Pager({ data, setPage }) {
  if (data.totalPages <= 1 && data.page <= 1) return null;
  return (
    <div className="pager">
      <button
        className="secondary"
        disabled={data.page <= 1}
        onClick={() => setPage(data.page - 1)}
      >
        Previous
      </button>
      <span>
        Page {data.page} of {Math.max(1, data.totalPages)} · {data.total}{" "}
        results
      </span>
      <button
        className="secondary"
        disabled={data.page >= data.totalPages}
        onClick={() => setPage(data.page + 1)}
      >
        Next
      </button>
    </div>
  );
}
export function ListState({ state, children, emptyMessage = "Nothing here yet." }) {
  if (state.loading) return <p role="status">Loading…</p>;
  if (state.error) return <ErrorMessage error={state.error} />;
  if (!state.data) return <p className="empty">No data available.</p>;
  return (
    <>
      {state.data.results.length ? (
        children
      ) : (
        <p className="empty">{emptyMessage}</p>
      )}
      <Pager data={state.data} setPage={state.setPage} />
    </>
  );
}
export function UserFields({ user, admin = false }) {
  return (
    <>
      <label>
        Name
        <input
          name="name"
          defaultValue={user?.name || ""}
          required
          maxLength={100}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          name="email"
          defaultValue={user?.email || ""}
          required
          maxLength={254}
        />
      </label>
      <label>
        Interests
        <input
          name="interests"
          placeholder="reading, cooking, travel"
          defaultValue={user?.interests?.join(", ") || ""}
        />
        <small>Separate each interest with a comma.</small>
      </label>
      {admin && (
        <>
          <label>
            {user ? "New password (optional)" : "Password"}
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required={!user}
              minLength={8}
            />
          </label>
          <label>
            Role
            <select name="role" defaultValue={user?.role || "user"}>
              <option value="user">Member</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
        </>
      )}
    </>
  );
}
