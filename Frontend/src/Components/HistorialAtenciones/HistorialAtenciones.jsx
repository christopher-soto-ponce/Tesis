import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { Menu } from "../Navbar/Menu";
import { Container, Table, Card, Button } from "react-bootstrap";

const HistorialAtenciones = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paciente } = location.state;
  const [atenciones, setAtenciones] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  const GetAtenciones = async () => {
    try {
      const response = await api.get(`/atencion/${paciente.id_usuario}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = response.data;

      // Ordenar por fecha de mayor a menor
      const sortedData = data.sort(
        (a, b) => new Date(b.fecha_atencion) - new Date(a.fecha_atencion)
      );

      setAtenciones(sortedData);
    } catch (err) {
      Swal.fire(
        "Error",
        "Error al obtener las atenciones del paciente",
        "error"
      );
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleVerMas = (id_cita) => {
    navigate("/DetalleCita", { state: { id_cita } });
  };

  useEffect(() => {
    GetAtenciones();
  }, []);

  return (
    <Container fluid className="px-0">
      <Menu />
      <h2 className="my-4 text-center">Historial de Atenciones</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Fecha de Atención</th>
            <th>Tipo de Atención</th>
            <th>Especialista</th>
          </tr>
        </thead>
        <tbody>
          {atenciones.map((atencion) => (
            <React.Fragment key={atencion.id_atencion}>
              <tr
                onClick={() => toggleRow(atencion.id_atencion)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    expandedRow === atencion.id_atencion ? "#f8f9fa" : "white",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f1f1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    expandedRow === atencion.id_atencion ? "#f8f9fa" : "white")
                }
              >
                <td>{new Date(atencion.fecha_atencion).toLocaleString()}</td>
                <td>{atencion.tipo_atencion}</td>
                <td>{atencion.especialista.nombre}</td>
              </tr>
              {expandedRow === atencion.id_atencion && (
                <tr>
                  <td colSpan="3">
                    <Card>
                      <Card.Body>
                        <Card.Title>Detalles de la Atención</Card.Title>
                        <Card.Text>
                          <div style={styles.detailsContainer}>
                            <div style={styles.detailItem}>
                              <strong>Descripción:</strong>{" "}
                              {atencion.descripcion}
                            </div>
                            <div style={styles.detailItem}>
                              <strong>Resumen:</strong> {atencion.resumen}
                            </div>
                            <div style={styles.detailItem}>
                              <strong>Fecha de Atención:</strong>{" "}
                              {new Date(
                                atencion.fecha_atencion
                              ).toLocaleString()}
                            </div>
                            <div style={styles.detailItem}>
                              <strong>Tipo de Atención:</strong>{" "}
                              {atencion.tipo_atencion}
                            </div>
                            <div style={styles.detailItem}>
                              <strong>Especialista:</strong>{" "}
                              {atencion.especialista.nombre} (
                              {atencion.especialista.email})
                            </div>
                            <div style={styles.detailItem}>
                              <strong>RUT del Especialista:</strong>{" "}
                              {atencion.especialista.rut}
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            onClick={() => handleVerMas(atencion.id_cita)}
                          >
                            Ver más
                          </Button>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
const styles = {
  detailsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)", // 2 columnas
    gap: "15px", // Espaciado entre columnas
    marginBottom: "15px",
  },
  detailItem: {
    fontSize: "14px",
    marginBottom: "10px",
  },
};
export default HistorialAtenciones;
