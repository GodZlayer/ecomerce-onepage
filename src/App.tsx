import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Admin from "./pages/admin";
import ProfileLayout from "./components/profile/ProfileLayout";
import OrderHistoryPage from "./components/profile/OrderHistoryPage";
import AddressManagementPage from "./components/profile/AddressManagementPage";
// Import OrderDetailsPage when created
import OrderDetailsPage from "./components/profile/OrderDetailsPage";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
