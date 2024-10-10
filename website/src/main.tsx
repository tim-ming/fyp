import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import PrivacyPolicy from "./PrivacyPolicy.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Terms from "./Terms.js";
import Layout from "./Layout.js"; // Import Layout component

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
