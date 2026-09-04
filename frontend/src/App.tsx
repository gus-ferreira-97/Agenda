import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PublicBooking from './pages/PublicBooking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/agendar" element={<PublicBooking />} />
        <Route path="*" element={<PublicBooking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;