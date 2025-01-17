import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Swal from "sweetalert2"; // Importa SweetAlert2
import moment from "moment";
import { Menu } from "../Navbar/Menu";
import { Container } from "react-bootstrap";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import localization from "moment/locale/es";
moment.locale("es");
moment.updateLocale("es", {
  months:
    "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split(
      "_"
    ),
  weekdays: "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),
});
console.log(moment().toLocaleString());
const DetalleCita = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id_cita } = location.state;
  const [cita, setCita] = useState(null);

  const GetDataCita = async () => {
    try {
      const response = await api.get(`/citas/${id_cita}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCita(response.data);
    } catch (err) {
      Swal.fire("Error", "Error al obtener la información de la cita", "error");
    }
  };

  useEffect(() => {
    GetDataCita();
  }, []);

  if (!cita) {
    return "Cargando...";
  }

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    margin: "10px 0",
    padding: "15px",
  };

  const sectionStyle = {
    marginBottom: "20px",
  };

  const titleStyle = {
    color: "#00796b",
    fontSize: "1.5rem",
    fontWeight: "bold",
  };

  const itemCardStyle = {
    ...cardStyle,
    backgroundColor: "#f0f4f7",
    border: "1px solid #d1e7dd",
  };

  return (
    <Container fluid>
      <Menu />
      <div style={{ padding: "20px", backgroundColor: "#e3f2fd" }}>
        <h2 style={titleStyle}>Detalles de la Cita</h2>
        <PDFDownloadLink
          document={<MyDocument cita={cita} />}
          fileName={`detalle_cita_${cita.id_cita}.pdf`}
          style={{
            textDecoration: "none",
            padding: "10px 20px",
            backgroundColor: "#00796b",
            color: "#fff",
            borderRadius: "5px",
            margin: "10px 0",
            display: "inline-block",
          }}
        >
          {({ loading }) => (loading ? "Generando PDF..." : "Descargar PDF")}
        </PDFDownloadLink>

        <div style={cardStyle}>
          <h5 style={titleStyle}>Información General</h5>
          <p>
            <strong>Fecha de la Cita:</strong>{" "}
            {moment(cita.fecha_cita).format(
              "dddd, D [de] MMMM [de] YYYY, h:mm A"
            )}
          </p>
          <p>
            <strong>Estado:</strong> {cita.estado}
          </p>
          <p>
            <strong>Especialista:</strong> {cita.Especialista?.nombre} -{" "}
            {cita.Especialista?.especialidad}
          </p>
          <p>
            <strong>Paciente:</strong> {cita.Paciente?.nombre} (
            {cita.Paciente?.rut})
          </p>
        </div>

        <div style={sectionStyle}>
          <h5 style={titleStyle}>Atenciones</h5>
          {cita.atencions?.length > 0 ? (
            cita.atencions.map((atencion) => (
              <div key={atencion.id_atencion} style={itemCardStyle}>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {moment(atencion.fecha_atencion).format(
                    "dddd, D [de] MMMM [de] YYYY, h:mm A"
                  )}
                </p>
                <p>
                  <strong>Tipo de Atención:</strong> {atencion.tipo_atencion}
                </p>
                <p>
                  <strong>Resumen:</strong> {atencion.resumen}
                </p>
                <p>
                  <strong>Descripción:</strong> {atencion.descripcion}
                </p>
              </div>
            ))
          ) : (
            <p>No hay atenciones registradas para esta cita.</p>
          )}
        </div>

        <div style={sectionStyle}>
          <h5 style={titleStyle}>Diagnósticos</h5>
          {cita.atencions?.map((atencion) =>
            atencion.diagnosticos?.length > 0
              ? atencion.diagnosticos.map((diagnostico) => (
                  <div key={diagnostico.id_diagnostico} style={itemCardStyle}>
                    <p>
                      <strong>Descripción:</strong> {diagnostico.descripcion}
                    </p>
                    <p>
                      <strong>Fecha de Diagnóstico:</strong>{" "}
                      {moment(diagnostico.fecha_diagnostico).format(
                        "dddd, D [de] MMMM [de] YYYY, h:mm A"
                      )}
                    </p>
                    <h6>Tratamientos</h6>
                    {diagnostico.tratamientos?.length > 0 ? (
                      diagnostico.tratamientos.map((tratamiento) => (
                        <div
                          key={tratamiento.id_tratamiento}
                          style={{
                            ...itemCardStyle,
                            marginTop: "10px",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <p>
                            <strong>Descripción:</strong>{" "}
                            {tratamiento.descripcion}
                          </p>
                          <p>
                            <strong>Fecha de Inicio:</strong>{" "}
                            {moment(tratamiento.fecha_inicio).format(
                              "dddd, D [de] MMMM [de] YYYY, h:mm A"
                            )}
                          </p>
                          <p>
                            <strong>Fecha de Fin:</strong>{" "}
                            {moment(tratamiento.fecha_fin).format(
                              "dddd, D [de] MMMM [de] YYYY, h:mm A"
                            )}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>No hay tratamientos registrados.</p>
                    )}
                  </div>
                ))
              : null
          )}
        </div>
      </div>
    </Container>
  );
};

const MyDocument = ({ cita }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Detalles de la Cita</Text>

        {/* Sección de Información General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Fecha de la Cita: </Text>
            {moment(cita.fecha_cita).format(
              "dddd, D [de] MMMM [de] YYYY, h:mm A"
            )}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Estado: </Text>
            {cita.estado}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Especialista: </Text>
            {cita.Especialista?.nombre} - {cita.Especialista?.especialidad}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Paciente: </Text>
            {cita.Paciente?.nombre} ({cita.Paciente?.rut})
          </Text>
        </View>

        {/* Sección de Atenciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atenciones</Text>
          {cita.atencions?.length > 0 ? (
            cita.atencions.map((atencion) => (
              <View key={atencion.id_atencion} style={styles.subSection}>
                <Text style={styles.subSectionTitle}>
                  <Text style={styles.bold}>Fecha: </Text>
                  {moment(atencion.fecha_atencion).format(
                    "dddd, D [de] MMMM [de] YYYY, h:mm A"
                  )}
                </Text>
                <Text style={styles.subSectionText}>
                  <Text style={styles.bold}>Tipo de Atención: </Text>
                  {atencion.tipo_atencion}
                </Text>
                <Text style={styles.subSectionText}>
                  <Text style={styles.bold}>Resumen: </Text>
                  {atencion.resumen}
                </Text>
                <Text style={styles.subSectionText}>
                  <Text style={styles.bold}>Descripción: </Text>
                  {atencion.descripcion}
                </Text>
              </View>
            ))
          ) : (
            <Text>No hay atenciones registradas.</Text>
          )}
        </View>

        {/* Sección de Diagnósticos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnósticos</Text>
          {cita.atencions?.map((atencion) =>
            atencion.diagnosticos?.length > 0
              ? atencion.diagnosticos.map((diagnostico) => (
                  <View
                    key={diagnostico.id_diagnostico}
                    style={styles.subSection}
                  >
                    <Text style={styles.subSectionTitle}>
                      <Text style={styles.bold}>Descripción: </Text>
                      {diagnostico.descripcion}
                    </Text>
                    <Text style={styles.subSectionText}>
                      <Text style={styles.bold}>Fecha de Diagnóstico: </Text>
                      {moment(diagnostico.fecha_diagnostico).format(
                        "dddd, D [de] MMMM [de] YYYY, h:mm A"
                      )}
                    </Text>
                    <Text style={styles.subSectionText}>
                      <Text style={styles.bold}>Tratamientos:</Text>
                    </Text>
                    {diagnostico.tratamientos?.length > 0 ? (
                      diagnostico.tratamientos.map((tratamiento) => (
                        <Text
                          key={tratamiento.id_tratamiento}
                          style={styles.tratamientoText}
                        >
                          - {tratamiento.descripcion}
                        </Text>
                      ))
                    ) : (
                      <Text>No hay tratamientos registrados.</Text>
                    )}
                  </View>
                ))
              : null
          )}
        </View>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
    color: "#00796b",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#e0f7fa",
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#00796b",
  },
  subSection: {
    padding: 10,
    backgroundColor: "#f0f4f7",
    borderRadius: 5,
    border: "1px solid #d1e7dd",
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#00796b",
  },
  subSectionText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  tratamientoText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 10,
    marginBottom: 5,
  },
});

export default DetalleCita;
