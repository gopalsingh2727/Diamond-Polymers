import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import IndexComponentes from "../IndexComponents";
import IndexMenuRoute from "../main/sidebar/indexMenuRoute";
import Login from "../login/login";
import BranchSelect from "../branch/BranchSelect"; 

const MainRount = () => {
  const { isAuthenticated, userData } = useSelector(
    (state: RootState) => state.auth
  );

  const hasSelectedBranch =
    userData?.role !== "admin" || !!userData?.selectedBranch;

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
      />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            hasSelectedBranch ? (
              <IndexComponentes />
            ) : (
              <Navigate to="/select-branch" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/menu/*"
        element={
          isAuthenticated ? (
            hasSelectedBranch ? (
              <IndexMenuRoute />
            ) : (
              <Navigate to="/select-branch" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/select-branch"
        element={
          isAuthenticated && userData?.role === "admin" ? (
            <BranchSelect />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
};

export default MainRount;