export async function syncUserDataToMongo(user) {
  const uid = user.uid;

  const forms = JSON.parse(localStorage.getItem("formBuilderForms") || "[]");
  const responses = JSON.parse(localStorage.getItem("formResponses") || "{}");
  const templates = JSON.parse(
    localStorage.getItem("customFormTemplates") || "[]"
  );

  await Promise.all([
    fetch("http://localhost:5000/api/forms/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, forms }),
    }),
    fetch("http://localhost:5000/api/responses/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, responses }),
    }),
    fetch("http://localhost:5000/api/templates/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, templates }),
    }),
  ]);
}
