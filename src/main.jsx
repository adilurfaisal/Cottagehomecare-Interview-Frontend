import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./auth";
import { Layout } from "./components";
import AccountForm from "./pages/AccountForm";
import Notes from "./pages/Notes";
import NoteEditor from "./pages/NoteEditor";
import Interests from "./pages/Interests";
import Posts from "./pages/Posts";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/notes" replace />} />
            <Route path="login" element={<AccountForm key="login" />} />
            <Route
              path="register"
              element={<AccountForm key="register" register />}
            />
            <Route path="posts" element={<Posts />} />
            <Route path="posts/user/:userId" element={<Posts />} />
            <Route element={<ProtectedRoute />}>
              <Route path="notes" element={<Notes />} />
              <Route path="notes/new" element={<NoteEditor key="new" />} />
              <Route path="notes/:id/edit" element={<NoteEditor />} />
              <Route path="interests" element={<Interests />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route element={<ProtectedRoute admin />}>
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/notes" element={<Notes admin />} />
            </Route>
            <Route
              path="*"
              element={
                <>
                  <h1>Page not found</h1>
                  <Link to="/notes">Go home</Link>
                </>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")).render(<App />);
