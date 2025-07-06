import { createBrowserRouter, RouterProvider } from "react-router";

import LandingPage from "./containers/LandingPage";
import Home from "./pages/Home";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
