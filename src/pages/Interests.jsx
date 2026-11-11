import React from "react";
import { Link } from "react-router-dom";
import { useList, ListState } from "../components";

export default function Interests() {
  const interestsList = useList("/interests");
  return (
    <>
      <h1>Shared interests</h1>
      <p className="muted">Find people who enjoy the same things you do.</p>
      <ListState state={interestsList} emptyMessage="Add a few interests to your profile to get started.">
        <div className="cards">
          {interestsList.data?.results.map((group) => (
            <article key={group.interest}>
              <h2>{group.interest}</h2>
              <ul>
                {group.users.map((user) => (
                  <li key={user._id}>
                    <Link to={`/posts/user/${user._id}`}>{user.name}</Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ListState>
    </>
  );
}
