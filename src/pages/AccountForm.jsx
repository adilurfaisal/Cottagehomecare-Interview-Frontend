import React, { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth";
import { api } from "../api";
import { ErrorMessage } from "../components";
import { parseInterests } from "../formUtils";

export default function AccountForm({ register = false }) {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (user) return <Navigate to="/notes" replace />;
  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    if (register) body.interests = parseInterests(body.interests);
    try {
      login(
        await api(`/auth/${register ? "register" : "login"}`, {
          method: "POST",
          body,
        }),
      );
      navigate("/notes");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }
  const buttonLabel = register ? "Create account" : "Log in";
  const pendingLabel = register ? "Creating account…" : "Logging in…";
  return (
    <section className="narrow account-panel">
      <h1>{register ? "Create your account" : "Welcome back"}</h1>
      <p className="muted">
        {register ? "A place for your notes and everyday ideas." : "Log in to pick up where you left off."}
      </p>
      <form onSubmit={handleSubmit}>
        {register && (
          <label>
            Name
            <input name="name" autoComplete="name" required maxLength={100} />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete={register ? "new-password" : "current-password"}
            required
            minLength={register ? 8 : 1}
          />
        </label>
        {register && (
          <>
            <small>Use at least 8 characters for your password.</small>
            <label>
              Interests (comma separated)
              <input name="interests" placeholder="reading, cooking, travel" />
            </label>
          </>
        )}
        <ErrorMessage error={error} />
        <button disabled={isSubmitting}>
          {isSubmitting ? pendingLabel : buttonLabel}
        </button>
      </form>
      <p>
        <Link to={register ? "/login" : "/register"}>
          {register ? "Already have an account? Log in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
