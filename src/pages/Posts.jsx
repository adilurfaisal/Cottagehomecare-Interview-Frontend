import React, { useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../auth";
import { api } from "../api";
import { ErrorMessage, useList, ListState } from "../components";

export default function Posts() {
  const { userId } = useParams();
  const { user, token } = useContext(AuthContext);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const postsList = useList(userId ? `/posts/user/${userId}` : "/posts", refreshVersion);
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  async function handlePublishPost(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsPublishing(true);
    setError("");
    try {
      await api("/posts", {
        token,
        method: "POST",
        body: Object.fromEntries(new FormData(form)),
      });
      form.reset();
      postsList.setPage(1);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsPublishing(false);
    }
  }
  return (
    <>
      <h1>
        {userId ? `${postsList.data?.user?.name || "User"}’s posts` : "Public posts"}
      </h1>
      <p className="muted">Posts are visible to everyone.</p>
      {user && !userId && (
        <details>
          <summary>Write a post</summary>
          <form onSubmit={handlePublishPost}>
            <label>
              Title
              <input name="title" required maxLength={200} />
            </label>
            <label>
              Content
              <textarea name="content" required rows={4} maxLength={20000} />
            </label>
            <ErrorMessage error={error} />
            <button disabled={isPublishing}>
              {isPublishing ? "Publishing…" : "Publish post"}
            </button>
          </form>
        </details>
      )}
      <ListState state={postsList} emptyMessage="No posts yet. Published posts will appear here.">
        <div className="cards">
          {postsList.data?.results.map((post) => (
            <article key={post._id}>
              <h2>{post.title}</h2>
              <p className="content">{post.content}</p>
              <small>{new Date(post.createdAt).toLocaleString()}</small>
              <p>
                <Link to={`/posts/user/${post.userId}`}>
                  All posts by this author
                </Link>
              </p>
            </article>
          ))}
        </div>
      </ListState>
    </>
  );
}
