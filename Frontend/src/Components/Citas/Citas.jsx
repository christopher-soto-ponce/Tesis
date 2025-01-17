import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { Menu } from "../Navbar/Menu";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Table,
} from "react-bootstrap";

const Citas = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null); // Para almacenar la cita seleccionada
  const [citas, setCitas] = useState([]);
  const [citasShow, setCitasShow] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState();
  const [filtroCitas, setFiltroCitas] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Terminado");

  const usuario = localStorage.getItem("usuario");
  const navigate = useNavigate();
  let userId = null;

  if (usuario) {
    try {
      const user = JSON.parse(usuario);
      userId = user?.id_usuario || null;
    } catch (error) {
      console.error("Error al analizar el JSON del usuario:", error);
    }
  } else {
    console.warn("No se encontró el usuario en el localStorage");
  }
  const fetchCitas = async () => {
    try {
      const response = await api.get(`/citas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const citasDelDia = response.data.filter(
        (cita) => cita.id_especialista === userId
      );
      setCitas(citasDelDia);
      setCitasShow(citasDelDia);

      if (citasDelDia.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin citas",
          text: "No hay citas programadas para hoy.",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      console.error("Error al obtener las citas:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las citas.",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtrarPorTextos = (cita) => {
    const siCumple =
      new Date(cita.fecha_cita)
        .toLocaleDateString()
        .includes(filtroCitas.toLowerCase()) ||
      new Date(cita.fecha_cita)
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        .includes(filtroCitas.toLowerCase()) ||
      cita.Paciente?.nombre.toLowerCase().includes(filtroCitas.toLowerCase()) ||
      cita.title.toLowerCase().includes(filtroCitas.toLowerCase());

    return siCumple;
  };

  useEffect(() => {
    if (filtroEstado && filtroCitas) {
      setCitasShow(
        citas.filter(
          (cita) =>
            cita.estado.toLowerCase().includes(filtroEstado.toLowerCase()) &&
            filtrarPorTextos(cita)
        )
      );
    } else if (filtroCitas) {
      setCitasShow(citas.filter(filtrarPorTextos));
    } else if (filtroEstado) {
      setCitasShow(
        citas.filter((cita) =>
          cita.estado.toLowerCase().includes(filtroEstado.toLowerCase())
        )
      );
    } else {
      setCitasShow(citas);
    }
  }, [filtroCitas, filtroEstado, citas]);

  useEffect(() => {
    if (userId) fetchCitas();
  }, [userId]);

  const eliminarCita = async (idCita) => {
    try {
      Swal.fire({
        title: "¿Está seguro?",
        text: "Se eliminarán los datos.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await api.delete(`/citas/${idCita}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          Swal.fire("Eliminada", "La cita ha sido eliminada", "success");
          fetchCitas();
        }
      });
    } catch (err) {
      console.error("Error al eliminar la cita:", err);
      Swal.fire("Error", "No se pudo eliminar la cita", "error");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCita(null);
  };
  const abrirModalActualizar = (cita) => {
    const fechaHora = new Date(cita.fecha_cita); // Convertir la fecha y hora a objeto Date
    const fecha = fechaHora.toISOString().split("T")[0]; // Obtener solo la fecha
    const hora = fechaHora.toTimeString().split(":").slice(0, 2).join(":"); // Obtener solo la hora en formato HH:mm

    setFecha(fecha + " " + hora);
    setSelectedCita({
      id: cita.id_cita,
      titulo: cita.title,
      fecha, // Solo fecha
      hora, // Solo hora
    });
    setShowModal(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;

    setSelectedCita((prev) => ({ ...prev, [name]: value }));
  };

  const actualizarCita = async () => {
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(selectedCita.hora)) {
      Swal.fire("Error", "Formato de hora inválido (HH:mm).", "error");
      return;
    }

    const [hora] = selectedCita.hora.split(":").map(Number);
    if (hora === 17) {
      if (selectedCita.hora.split(":")[1] !== "00") {
        Swal.fire(
          "Error",
          "La hora debe estar entre las 08:00 y las 17:00.",
          "error"
        );
        return;
      }
    }
    if (hora < 8 || hora > 17) {
      Swal.fire(
        "Error",
        "La hora debe estar entre las 08:00 y las 17:00.",
        "error"
      );
      return;
      alert("kk");
    }

    // Obtén solo la fecha de la variable fecha_cita
    //const fechaCitaCompleta = fecha.fecha_cita; // Supongo que esto contiene el valor completo "YYYY-MM-DD HH:mm:ss"
    const newFecha = fecha.split(" ")[0]; // Divide la cadena y toma solo la parte de la fecha
    try {
      await api.put(
        `/citas/${selectedCita.id}`,
        {
          title: selectedCita.titulo,
          fecha: newFecha, // Usa solo la fecha extraída
          hora: selectedCita.hora, // Mantén la hora
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      Swal.fire("Éxito", "Cita actualizada correctamente.", "success");
      fetchCitas();
      handleModalClose();
    } catch (err) {
      console.error("Error al actualizar la cita:", err);
      Swal.fire("Error", "No se pudo actualizar la cita.", "error");
    }
  };

  const terminarCita = async (cita) => {
    const fechaHora = new Date(cita.fecha_cita); // Convertir la fecha y hora a objeto Date
    const fecha = fechaHora.toISOString().split("T")[0];
    navigate("/finalizarAtencion", {
      state: {
        id_cita: cita.id_cita,
        id_paciente: cita.id_paciente,
        id_especialista: cita.id_especialista,
        fecha,
        Paciente: cita.Paciente,
        estado: cita.estado,
      },
    });
  };
  const verDetalle = async (cita) => {
    const fechaHora = new Date(cita.fecha_cita); // Convertir la fecha y hora a objeto Date
    const fecha = fechaHora.toISOString().split("T")[0];
    navigate("/DetalleCita", {
      state: {
        id_cita: cita.id_cita,
        id_paciente: cita.id_paciente,
        id_especialista: cita.id_especialista,
        fecha,
        Paciente: cita.Paciente,
      },
    });
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <Container fluid className="px-0">
      <Menu />
      <h3 className="text-center mb-4">Historial de Citas</h3>
      <Row className="px-4">
        <Col className="d-flex justify-content-end mb-3">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar"
              value={filtroCitas}
              onChange={({ target: { value } }) => setFiltroCitas(value)}
            />
          </Form.Group>
          <Form.Group className="mx-3 gap-2">
            <Button
              variant="danger"
              onClick={() => setFiltroEstado("Terminado")}
              disabled={filtroEstado === "Terminado"}
            >
              Terminado
            </Button>
            <Button
              variant="success"
              onClick={() => setFiltroEstado("Creado")}
              disabled={filtroEstado === "Creado"}
            >
              Creado
            </Button>
          </Form.Group>
        </Col>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Título</th>
              <th>Paciente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citasShow.map((cita) => (
              <tr key={cita.id_cita}>
                <td>{new Date(cita.fecha_cita).toLocaleDateString()}</td>
                <td>
                  {new Date(cita.fecha_cita).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>{cita.estado}</td>
                <td>{cita.title}</td>
                <td>{cita.Paciente?.nombre}</td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    style={{ marginRight: "5px" }}
                    onClick={() => verDetalle(cita)}
                    disabled={!cita?.estado?.startsWith("T")}
                  >
                    Ver detalle
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarCita(cita.id_cita)}
                  >
                    Eliminar
                  </Button>{" "}
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => abrirModalActualizar(cita)}
                  >
                    Actualizar
                  </Button>{" "}
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => terminarCita(cita)}
                  >
                    {cita?.estado?.startsWith("T")
                      ? "Agregar Diagnostico"
                      : "Generar atencion"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>

      {/* Modal para actualizar cita */}
      {selectedCita && (
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Actualizar Cita</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  value={selectedCita.titulo}
                  onChange={handleUpdateChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Hora</Form.Label>
                <Form.Control
                  type="time"
                  name="hora"
                  value={selectedCita.hora}
                  onChange={handleUpdateChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={actualizarCita}>
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Citas;
