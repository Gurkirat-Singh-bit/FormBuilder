import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { ClientOnly } from "../components/ClientOnly";
import FormBuilder from "../components/FormBuilderMain";
import FormFiller from "../components/FormFiller";
import ResponseViewer from "../components/ResponseViewer";

export default function Index() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const formId = searchParams.get("form");
  const viewResponses = searchParams.get("responses");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      else {
        setUser(u);
        setChecking(false);
      }
    });
    return () => unsub();
  }, []);

  if (checking) return <div>Checking Auth...</div>;

  const handleBack = () => {
    navigate("/");
  };

  if (viewResponses === "true") {
    return (
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => <ResponseViewer darkMode={darkMode} setDarkMode={setDarkMode} onBack={handleBack} />}
      </ClientOnly>
    );
  }

  if (formId) {
    return (
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => <FormFiller formId={formId} darkMode={darkMode} />}
      </ClientOnly>
    );
  }

  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      {() => <FormBuilder setAppDarkMode={setDarkMode} />}
    </ClientOnly>
  );
}
