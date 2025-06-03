import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen.jsx";

function Layout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // To replace this with real loading logic (e.g., images, data)
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
