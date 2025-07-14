import ProtectedRoute from "../components/ProtectedRoute";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  return (
    <ProtectedRoute>
      {user ? (
        <div className="p-6">
          <h2 className="text-xl font-semibold">Welcome, {user.email}</h2>
          <button
            onClick={() => {
              auth.signOut();
              navigate("/login");
            }}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </ProtectedRoute>
  );
}
