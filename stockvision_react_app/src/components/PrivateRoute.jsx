import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ element }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? element : <Navigate to="/" />;
};

export default PrivateRoute;
