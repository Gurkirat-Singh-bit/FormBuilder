import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { useNavigate } from "@remix-run/react";

export default function ProtectedRoute({ children }) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        navigate("/login");
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) return <div>Loading...</div>;

  return isAuthenticated ? children : null;
}
