import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/auth.jsx";
import Calendario from "./Components/Calendario/calendario.jsx";
import Login from "./Components/Login/Login.jsx";
import Registro from "./Components/Registro/Registro.jsx";
import PrivateRoute from "./Components/PrivateRoute/privateRoute.jsx";
import Home from "./Components/Home/home.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import Atenciones from "./Components/Atenciones/atenciones.jsx";
import HistorialAtenciones from "./Components/HistorialAtenciones/HistorialAtenciones.jsx";
import Perfil from "./Components/Perfil/perfil.jsx";
import Citas from "./Components/Citas/Citas.jsx";
import FinalizarAtencion from "./Components/FinalizarAtencion/FinalizarAtencion.jsx";
import Pacientes from "./Components/Paciente/Pacientes.jsx";
import DetalleCita from "./Components/DetalleCita/DetalleCita.jsx";
import Reagendamiento from "./Components/Reagendamiento/Reagendamiento.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          {/* Protegemos la ruta de Calendario con PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/atenciones" element={<Atenciones />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/finalizarAtencion" element={<FinalizarAtencion />} />
            <Route path="/detalleCita" element={<DetalleCita />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route
              path="/HistorialAtenciones"
              element={<HistorialAtenciones />}
            />
            <Route path="/Reagendamiento" element={<Reagendamiento />} />
          </Route>
          <Route path="*" element={<h1>404 sin ruta</h1>}></Route>
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
