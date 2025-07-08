import { Route, Routes } from 'react-router-dom'
import Auth from '../pages/auth'
import Focus from '../pages/focus'
import Habits from '../pages/habits'
import Login from '../pages/login'
import ProtectedRoute from './ProtectedRoute'
import { ROUTES } from './paths'

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Login />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.AUTH} element={<Auth />} />
      <Route
        path={ROUTES.HABITS}
        element={
          <ProtectedRoute>
            <Habits />
          </ProtectedRoute>
        } 
      />
      <Route
        path={ROUTES.FOCUS}
        element={
          <ProtectedRoute>
            <Focus />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
