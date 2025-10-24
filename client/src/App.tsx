import { createBrowserRouter, RouterProvider, Navigate } from "react-router";

import LandingPage from "./containers/LandingPage";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Dashboard from "./pages/Dashboard";
import ContractsList from "./containers/ContractsList";
import Contract from "./containers/Contract";

import {
  fetchContract,
  fetchContractsList,
} from "./dataLoaders/contractLoaders";

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
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "contracts",
        element: <ContractsList />,
        loader: fetchContractsList,
      },
      {
        path: ":contractId",
        element: <Contract />,
        loader: fetchContract,
      },
    ],
  },
  // {
  //   path: "/dashboard",
  //   element: <Navigate to="/dashboard/contracts" replace />,
  // },
  // {
  //   path: "/contracts",
  //   element: <ContractsList />,
  // },

  // {
  //   path: "/dashboard/:contractId",
  //   element: <Dashboard />,
  //   loader: fetchContract,
  // },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
