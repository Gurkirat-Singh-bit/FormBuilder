import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { useNavigate } from "@remix-run/react";

export default function MyForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return navigate("/login");

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forms/my-forms/${user.uid}`);
        if (!res.ok) throw new Error("Failed to fetch forms");

        const data = await res.json();
        setForms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📄 My Forms</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : forms.length === 0 ? (
        <p className="text-gray-500">No forms yet.</p>
      ) : (
        <ul className="space-y-4">
          {forms.map((form) => (
            <li key={form._id} className="p-4 border rounded shadow bg-white">
              <h3 className="text-lg font-semibold">{form.title}</h3>
              <p className="text-sm text-gray-600">
                Created: {new Date(form.createdAt).toLocaleString()}
              </p>
              <button
                onClick={() => navigate(`/?form=${form.shareId || form._id}`)}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                View Form
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
