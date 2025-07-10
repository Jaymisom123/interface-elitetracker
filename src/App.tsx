import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';

function App() {
  return (
    <AuthProvider>
      <MantineProvider defaultColorScheme="dark">
        <Router>
          <AppRoutes />
        </Router>
      </MantineProvider>
    </AuthProvider>
  )
}

export default App
