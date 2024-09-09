import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import PrivacyPolicy from "./PrivacyPolicy.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Terms from "./Terms.tsx";
import Layout from "./Layout.tsx"; // Import Layout component

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Use Layout component
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "privacy",
        element: <PrivacyPolicy />,
      },
      {
        path: "terms",
        element: <Terms />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
