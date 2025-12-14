import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import IndexComponentes from "../IndexComponents";
import IndexMenuRoute from "../main/sidebar/indexMenuRoute";
import LoginForm from "../login/login";
import UnifiedAuthPage from "../login/UnifiedAuthPage";
import ForgotPassword from "../login/ForgotPassword";
import BranchSelect from "../branch/BranchSelect";
import CreateBranch from "../branch/CreateBranch";
import SecretBranches from "../settings/SecretBranches";
import SecretManager from "../settings/SecretManager";
import SeeAll from "../settings/SeeAll";
import ExternalAPIKeys from "../settings/ExternalAPIKeys";
import BranchSettings from "../settings/BranchSettings";
import MasterSettings from "../settings/MasterSettings";





const MainRount = () => {
  const { isAuthenticated, userData } = useSelector(
    (state: RootState) => state.auth
  );

  // Master admin and admin need to create/select branch first
  const hasSelectedBranch =
    (userData?.role !== "master_admin" && userData?.role !== "admin") || !!userData?.selectedBranch;

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginForm />}
      />

      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" /> : <UnifiedAuthPage />}
      />

      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />}
      />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            hasSelectedBranch ? (
              <IndexComponentes />
            ) : (
              <Navigate to="/create-branch" />
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
              <Navigate to="/create-branch" />
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

      <Route
        path="/create-branch"
        element={
          isAuthenticated && (userData?.role === "master_admin" || userData?.role === "admin") ? (
            <CreateBranch />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Settings Pages */}
      <Route
        path="/settings/branches"
        element={
          isAuthenticated && (userData?.role === "master_admin" || userData?.role === "admin") ? (
            <SecretBranches />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/settings/managers"
        element={
          isAuthenticated && (userData?.role === "master_admin" || userData?.role === "admin") ? (
            <SecretManager />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/settings/all"
        element={
          isAuthenticated && (userData?.role === "master_admin" || userData?.role === "admin") ? (
            <SeeAll />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/settings/api-keys"
        element={
          isAuthenticated && userData?.role === "master_admin" ? (
            <ExternalAPIKeys />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/settings/branch-settings"
        element={
          isAuthenticated && userData?.role === "master_admin" ? (
            <BranchSettings />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/settings/master"
        element={
          isAuthenticated && userData?.role === "master_admin" ? (
            <MasterSettings />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Marketing Pages - Public Access */}
      {/* <Route path="/landing" element={<LandingPage />} /> */}

  
    </Routes>
  );
};

export default MainRount;