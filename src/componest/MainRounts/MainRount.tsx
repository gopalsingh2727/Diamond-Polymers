import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import { isTokenExpired } from "../redux/utils/auth";

// Direct imports for Electron app
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
import MasterSettings from "../settings/MasterSettings";

const MainRount = () => {
  const { isAuthenticated, userData, token } = useSelector(
    (state: RootState) => state.auth
  );

  // Check if we have a valid, non-expired token
  const hasValidAuth = Boolean(isAuthenticated && token && !isTokenExpired(token));

  // Master admin and admin need to create/select branch first
  const hasSelectedBranch =
    (userData?.role !== "master_admin" && userData?.role !== "admin") || !!userData?.selectedBranch;

  return (
    <Routes>
      <Route
        path="/login"
        element={hasValidAuth ? <Navigate to="/" replace /> : <LoginForm />}
      />

      <Route
        path="/signup"
        element={hasValidAuth ? <Navigate to="/" replace /> : <UnifiedAuthPage />}
      />

      <Route
        path="/forgot-password"
        element={hasValidAuth ? <Navigate to="/" replace /> : <ForgotPassword />}
      />

      <Route
        path="/"
        element={
          hasValidAuth ? (
            hasSelectedBranch ? (
              <IndexComponentes />
            ) : (
              <Navigate to="/create-branch" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/menu/*"
        element={
          hasValidAuth ? (
            hasSelectedBranch ? (
              <IndexMenuRoute />
            ) : (
              <Navigate to="/create-branch" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/select-branch"
        element={
          hasValidAuth && userData?.role === "admin" ? (
            <BranchSelect />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/create-branch"
        element={
          hasValidAuth && (userData?.role === "master_admin" || userData?.role === "admin") ? (
            <CreateBranch />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Settings Pages */}
      <Route
        path="/settings/branches"
        element={
          hasValidAuth && (userData?.role === "master_admin" || userData?.role === "admin") ? (
            <SecretBranches />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings/managers"
        element={
          hasValidAuth && (userData?.role === "master_admin" || userData?.role === "admin") ? (
            <SecretManager />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings/all"
        element={
          hasValidAuth && (userData?.role === "master_admin" || userData?.role === "admin") ? (
            <SeeAll />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings/api-keys"
        element={
          hasValidAuth && userData?.role === "master_admin" ? (
            <ExternalAPIKeys />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings/master"
        element={
          hasValidAuth && userData?.role === "master_admin" ? (
            <MasterSettings />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all route - redirect unknown URLs */}
      <Route
        path="*"
        element={<Navigate to={hasValidAuth ? "/" : "/login"} replace />}
      />
    </Routes>
  );
};

export default MainRount;
