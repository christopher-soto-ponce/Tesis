import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Modal,
  Button,
  Form,
} from "react-bootstrap";
import Swal from "sweetalert2"; // Asegúrate de tener instalado SweetAlert2
import api from "../../api/axios";
import "./pacientes.css";
import { Menu } from "../Navbar/Menu";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../utils/useDebounce";

const Pacientes = () => {
  const navigate = useNavigate();
  const [idPaciente, setIdPaciente] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [pacientesmostrar, setPacientesMostrar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detallePaciente, setDetallePaciente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filtroPaciente, setFiltroPacientes] = useState("");

  const [pacienteActualizado, setPacienteActualizado] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    email: "",
  });
  const usuario = localStorage.getItem("usuario");
  const esEspecialista = usuario && JSON.parse(usuario)?.rol === "especialista";

  //filtrar lista pacientes
  useEffect(() => {
    if (filtroPaciente) {
      if (pacientes.length > 0) {
        const filtrarPacientes = pacientes.filter(
          (paciente) =>
            paciente.nombre
              .toLowerCase()
              .includes(filtroPaciente.toLowerCase()) ||
            paciente.email
              .toLowerCase()
              .includes(filtroPaciente.toLowerCase()) ||
            paciente.telefono
              .toLowerCase()
              .includes(filtroPaciente.toLowerCase()) ||
            paciente.direccion
              .toLowerCase()
              .includes(filtroPaciente.toLowerCase()) ||
            paciente.rut.toLowerCase().includes(filtroPaciente.toLowerCase())
        );
        setPacientesMostrar(filtrarPacientes);
      }
    } else {
      setPacientesMostrar(pacientes);
    }
  }, [filtroPaciente]);

  // Obtener la lista de pacientes desde el backend
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        // Llamada al endpoint para obtener todos los usuarios
        const response = await api.get("/usuario", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Filtrar los usuarios con el rol "paciente"
        let pacientes = response.data.filter(
          (usuario) => usuario.rol === "paciente"
        );

        setPacientes(pacientes); // Actualizar el estado solo con pacientes
        setPacientesMostrar(pacientes);
      } catch (err) {
        console.error("Error al obtener los pacientes:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los pacientes.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  // Función para abrir el modal con los detalles del paciente
  const handleVerDetalles = (paciente) => {
    setDetallePaciente(paciente);
    setShowModal(true);
  };
  const handleHistorialAtenciones = (paciente) => {
    navigate("/HistorialAtenciones", { state: { paciente } });
  };
  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setDetallePaciente(null);
  };

  // Función para abrir el modal de actualización
  const handleOpenUpdateModal = (paciente) => {
    setPacienteActualizado({
      nombre: paciente.nombre,
      telefono: paciente.telefono,
      direccion: paciente.direccion,
      email: paciente.email,
    });
    setIdPaciente(paciente.id_usuario); // Guardamos el id del paciente
    setShowUpdateModal(true);
  };

  // Función para cerrar el modal de actualización
  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setPacienteActualizado({
      nombre: "",
      telefono: "",
      direccion: "",
      email: "",
    });
  };

  // Función para actualizar un paciente
  const handleActualizarPaciente = async () => {
    if (!idPaciente) {
      console.error("No se ha seleccionado un paciente.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha seleccionado un paciente para actualizar.",
      });
      return;
    }

    try {
      await api.put(`/usuario/${idPaciente}`, pacienteActualizado, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "El paciente ha sido actualizado correctamente.",
      });
      setPacientes(
        pacientes.map((p) =>
          p.id_usuario === idPaciente ? { ...p, ...pacienteActualizado } : p
        )
      );
      setShowUpdateModal(false);
    } catch (err) {
      console.error("Error al actualizar el paciente:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el paciente.",
      });
    }
  };

  // Función para eliminar un paciente
  const handleEliminarPaciente = async (id_usuario) => {
    try {
      await api.delete(`/usuario/${id_usuario}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El paciente ha sido eliminado correctamente.",
      });
      setPacientes(pacientes.filter((p) => p.id_usuario !== id_usuario));
    } catch (err) {
      console.error("Error al eliminar el paciente:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el paciente.",
      });
    }
  };

  return (
    <Container fluid className="pacientes px-0">
      {/* Navbar */}
      <Menu />

      {/* Main Content */}
      <h3 className="text-center mb-4">Pacientes</h3>
      <Row className="px-4 py-2">
        <Col className="d-flex justify-content-end mb-3">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar"
              value={filtroPaciente}
              onChange={({ target: { value } }) => setFiltroPacientes(value)}
            />
          </Form.Group>
        </Col>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Rut</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientesmostrar.map((paciente) => (
              <tr key={paciente.id_usuario}>
                <td>{paciente.rut}</td>
                <td>{paciente.nombre}</td>
                <td>{paciente.email}</td>
                <td>{paciente.telefono}</td>
                <td>{paciente.direccion}</td>
                <td>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => handleHistorialAtenciones(paciente)}
                  >
                    historial de atenciones
                  </button>
                  <button
                    className="btn btn-info me-2"
                    onClick={() => handleVerDetalles(paciente)}
                  >
                    Ver detalles
                  </button>
                  {esEspecialista && (
                    <>
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => handleOpenUpdateModal(paciente)}
                      >
                        Actualizar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          handleEliminarPaciente(paciente.id_usuario)
                        }
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>

      {/* Modal con detalles del paciente */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detallePaciente ? (
            <>
              <p>
                <strong>Nombre:</strong> {detallePaciente.nombre}
              </p>
              <p>
                <strong>Email:</strong> {detallePaciente.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {detallePaciente.telefono}
              </p>
              <p>
                <strong>Dirección:</strong> {detallePaciente.direccion}
              </p>
              <p>
                <strong>Grado de Dependencia:</strong>{" "}
                {detallePaciente.gradoDependencia}
              </p>
            </>
          ) : (
            <p>Cargando detalles...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para actualizar paciente */}
      <Modal show={showUpdateModal} onHide={handleCloseUpdateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={pacienteActualizado.nombre}
                onChange={(e) =>
                  setPacienteActualizado({
                    ...pacienteActualizado,
                    nombre: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="telefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                value={pacienteActualizado.telefono}
                onChange={(e) =>
                  setPacienteActualizado({
                    ...pacienteActualizado,
                    telefono: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="direccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                value={pacienteActualizado.direccion}
                onChange={(e) =>
                  setPacienteActualizado({
                    ...pacienteActualizado,
                    direccion: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={pacienteActualizado.email}
                onChange={(e) =>
                  setPacienteActualizado({
                    ...pacienteActualizado,
                    email: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUpdateModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleActualizarPaciente}>
            Actualizar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Pacientes;
