import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import ToDo from "./pages/todo/ToDo";
import Calendar from "./pages/calendar/Calendar";
import Grocery from "./pages/grocery/Grocery";
import Forum from "./pages/forum/Forum";
import Register from "./pages/register/Register";
import SiteDoc from "./pages/siteDoc/SiteDoc.jsx";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useContext } from "react";
import Navbar from "./components/navbar/Navbar.jsx";
import { AuthContext } from "./context/authContext.js";
import ParentControl from "./pages/parentControl/ParentControl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const { currentUser } = useContext(AuthContext);
  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    //ако не съществува currentUser, връша към siteDoc
    if (!currentUser) {
      return <Navigate to="/siteDoc" />;
    }
    return children;
  };
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/", element: <Home /> },
        { path: "/forum", element: <Forum /> },
        { path: "/todo", element: <ToDo /> },
        { path: "/grocery", element: <Grocery /> },
        { path: "/householdControl", element: <ParentControl /> },
        { path: "/calendar", element: <Calendar /> },
      ],
    },
    {
      path: "/siteDoc",
      element: <SiteDoc />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
