import { Route } from 'react-router-dom';
import { AnamnesesPage } from './pages/Anamneses';

// ... dentro do seu RouterProvider ou Routes ...
<Route path="/pacientes/:pacienteId/anamneses" element={<AnamnesesPage />} /> 