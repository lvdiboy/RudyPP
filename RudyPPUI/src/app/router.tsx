import { Route, Routes } from 'react-router';
import RequireAuth from '../features/auth/RequireAuth.tsx';
import AccountLayout from '../layouts/AccountLayout.tsx';
import AuthLayout from '../layouts/AuthLayout.tsx';
import DashboardLayout from '../layouts/DashboardLayout.tsx';
import SiteLayout from '../layouts/SiteLayout.tsx';
import AccountPage from '../pages/account/AccountPage.tsx';
import BookmarksPage from '../pages/bookmarks/BookmarksPage.tsx';
import DashboardPage from '../pages/dashboard/DashboardPage.tsx';
import WorkspaceNotFoundPage from '../pages/dashboard/WorkspaceNotFoundPage.tsx';
import HomePage from '../pages/home/HomePage.tsx';
import LearningPage from '../pages/learning/LearningPage.tsx';
import LoginPage from '../pages/login/LoginPage.tsx';
import NotesPage from '../pages/notes/NotesPage.tsx';
import NotFoundPage from '../pages/not-found/NotFoundPage.tsx';
import TasksPage from '../pages/tasks/TasksPage.tsx';

/*
 * URL map. When adding a route, also add it to UiRouteController and
 * SecurityConstants.STATIC_WHITELIST (backend), so opening or refreshing that URL on the
 * deployed site serves index.html. See docs/frontend/workspace-modules.md for workspace modules.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* The home page has its own header and footer, so no layout around it */}
      <Route index element={<HomePage />} />

      <Route element={<SiteLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Signed-in area: RequireAuth sends visitors to /login first */}
      <Route element={<RequireAuth />}>
        {/* The personal workspace: overview first, then one route per active module */}
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="*" element={<WorkspaceNotFoundPage />} />
        </Route>

        {/* Opened from the user menu in the top-right corner */}
        <Route element={<AccountLayout />}>
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
