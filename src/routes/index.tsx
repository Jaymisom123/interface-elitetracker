import { Route, Routes } from 'react-router-dom'
import Habits from '../pages/habits'
import Login from '../pages/login'
import ProtectedRoute from './ProtectedRoute'
import { ROUTES } from './paths'

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Login />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route
        path={ROUTES.HABITS}
        element={
          <ProtectedRoute>
            <Habits />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
