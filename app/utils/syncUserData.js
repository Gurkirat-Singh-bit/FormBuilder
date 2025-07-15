export async function syncUserDataToMongo(user) {
  const uid = user.uid;

  const forms = JSON.parse(localStorage.getItem("formBuilderForms") || "[]");
  const responses = JSON.parse(localStorage.getItem("formResponses") || "{}");
  const templates = JSON.parse(
    localStorage.getItem("customFormTemplates") || "[]"
  );

  await Promise.all([
    fetch(`${import.meta.env.VITE_API_BASE_URL}/forms/save `, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, forms }),
    }),
    fetch(`${import.meta.env.VITE_API_BASE_URL}/responses/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, responses }),
    }),
    fetch(`${import.meta.env.VITE_API_BASE_URL}/templates/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, templates }),
    }),
  ]);
}
