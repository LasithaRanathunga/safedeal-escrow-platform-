import { createBrowserRouter, RouterProvider } from "react-router";

import LandingPage from "./containers/LandingPage";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";

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
      {
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        path: "/log-in",
        element: <LogIn />,
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
