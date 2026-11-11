// The API stores interests as an array, while the forms use comma-separated text.
export function parseInterests(value = "") {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function readUserForm(form) {
  const values = Object.fromEntries(new FormData(form));
  values.interests = parseInterests(values.interests);

  // Leave a user's existing password alone when editing their details.
  if (!values.password) delete values.password;
  return values;
}
