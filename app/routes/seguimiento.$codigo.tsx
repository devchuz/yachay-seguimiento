import {
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
  Link,
} from "react-router";
import type { CSSProperties } from "react";

import { turso } from "~/lib/turso.server";

// Pasos del proceso (lineales). El final (admitido/rechazado) se agrega dinámicamente.
const PROCESO = ["recibida", "derivada", "observada", "evaluada"];
const FINALES = ["admitido", "rechazado"];

const ETIQUETAS: Record<string, string> = {
  recibida: "Recibida",
  derivada: "Derivada",
  observada: "Observada",
  evaluada: "Evaluada",
  admitido: "Admitida",
  rechazado: "No admitida",
};

const DESC: Record<string, string> = {
  recibida: "Tu solicitud llegó a la universidad.",
  derivada: "Fue asignada a una facultad responsable.",
  observada: "Necesitamos información adicional.",
  evaluada: "Se está evaluando su viabilidad.",
  admitido: "¡Tu solicitud fue admitida! La universidad coordinará contigo.",
  rechazado: "Tu solicitud no fue admitida en esta convocatoria.",
};

const COLOR: Record<string, string> = {
  recibida: "#3FA37A",
  derivada: "#3FA37A",
  observada: "#A7793D",
  evaluada: "#3FA37A",
  admitido: "#3FA37A",
  rechazado: "#C0564B",
};

const TIPO: Record<string, string> = {
  capacitacion: "Capacitación",
  salud: "Campaña de salud",
  asesoria: "Asesoría técnica",
  educacion: "Talleres educativos",
  voluntariado: "Voluntariado",
  turismo: "Visibilidad turística",
  otro: "Otro",
};

export async function loader({ params }: { params: { codigo?: string } }) {
  const codigo = params.codigo?.toUpperCase();

  if (!codigo) {
    throw new Response("Código no enviado", { status: 400 });
  }

  const solRes = await turso.execute({
    sql: `
      SELECT codigo, comunidad, tipo_proyecto, estado, facultad_asignada
      FROM solicitudes
      WHERE codigo = ?
    `,
    args: [codigo],
  });

  if (solRes.rows.length === 0) {
    throw new Response("Solicitud no encontrada", { status: 404 });
  }

  const histRes = await turso.execute({
    sql: `
      SELECT estado_nuevo, comentario, fecha
      FROM historial_estados
      WHERE codigo = ?
      ORDER BY fecha ASC
    `,
    args: [codigo],
  });

  return {
    solicitud: solRes.rows[0] as any,
    historial: histRes.rows as any[],
  };
}

export default function Seguimiento() {
  const { solicitud, historial } = useLoaderData<typeof loader>();

  const porEstado = new Map(historial.map((h) => [h.estado_nuevo, h]));
  const estadoActual = solicitud.estado;
  const esFinal = FINALES.includes(estadoActual);

  // Construye los pasos a mostrar: los 4 del proceso + 1 final dinámico
  const finalAMostrar = esFinal ? estadoActual : "admitido";
  const PASOS = [...PROCESO, finalAMostrar];

  // Índice del estado actual dentro de los pasos mostrados
  const idxActual = PASOS.indexOf(estadoActual);
  const progreso = Math.max(idxActual + 1, 1);

  return (
    <main style={S.page}>
      <section style={S.wrapper}>
        <div style={S.card}>
          <div style={S.topRow}>
            <div style={{ ...S.badge, background: COLOR[estadoActual] }}>
              {ETIQUETAS[estadoActual]}
            </div>

            <div style={S.stepText}>
              Paso {progreso} de {PASOS.length}
            </div>
          </div>

          <h1 style={S.titulo}>{solicitud.codigo}</h1>

          <p style={S.sub}>{solicitud.comunidad}</p>

          <p style={S.meta}>
            {TIPO[solicitud.tipo_proyecto] ?? solicitud.tipo_proyecto}
            {solicitud.facultad_asignada
              ? ` · ${solicitud.facultad_asignada}`
              : ""}
          </p>

          <div style={S.progressOuter}>
            <div
              style={{
                ...S.progressInner,
                width: `${(progreso / PASOS.length) * 100}%`,
                background: COLOR[estadoActual],
              }}
            />
          </div>

          <div style={{ ...S.resumen, borderColor: COLOR[estadoActual] }}>
            <span style={S.resumenLabel}>Estado actual</span>
            <p style={S.resumenText}>{DESC[estadoActual]}</p>
          </div>
        </div>

        <div style={S.timeline}>
          {PASOS.map((e, i) => {
            const h = porEstado.get(e);
            const alcanzado = i <= idxActual;
            const esActual = e === estadoActual;
            const esRechazo = e === "rechazado";

            return (
              <div key={e} style={S.fila}>
                <div style={S.col}>
                  <div
                    style={{
                      ...S.punto,
                      background: alcanzado ? COLOR[e] : "#08110E",
                      borderColor: alcanzado ? COLOR[e] : "#3A4A44",
                      boxShadow: esActual
                        ? `0 0 0 5px ${COLOR[e]}22`
                        : "none",
                    }}
                  />

                  {i < PASOS.length - 1 && (
                    <div
                      style={{
                        ...S.linea,
                        background: i < idxActual ? "#3FA37A" : "#263A32",
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    ...S.timelineContent,
                    opacity: alcanzado ? 1 : 0.45,
                  }}
                >
                  <div
                    style={{
                      ...S.timelineTitle,
                      color: alcanzado
                        ? esRechazo ? "#E9B4AD" : "#E8F3EE"
                        : "#778A82",
                    }}
                  >
                    {ETIQUETAS[e]}
                  </div>

                  <div style={S.descTxt}>{h?.comentario ?? DESC[e]}</div>

                  {h?.fecha && <div style={S.fecha}>{formatFecha(h.fecha)}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <Link to="/seguimiento" style={S.volver}>
          ← Consultar otra solicitud
        </Link>
      </section>
    </main>
  );
}

function formatFecha(f: string) {
  const d = new Date(f.replace(" ", "T"));

  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ErrorBoundary() {
  const error = useRouteError();
  const noEncontrada = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main style={S.page}>
      <section style={S.wrapper}>
        <div style={S.card}>
          <div style={S.errorIcon}>!</div>

          <h1 style={S.titulo}>
            {noEncontrada ? "No encontramos esa solicitud" : "Algo salió mal"}
          </h1>

          <p style={S.errorText}>
            {noEncontrada
              ? "Revisa que el código esté bien escrito. Tiene un formato similar a UNCP-2026-00118."
              : "Intenta consultar nuevamente en unos segundos."}
          </p>

          <Link to="/seguimiento" style={S.errorButton}>
            Volver a buscar
          </Link>
        </div>
      </section>
    </main>
  );
}

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "32px 20px",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#E8F3EE",
    background: "#08110E",
    display: "flex",
    justifyContent: "center",
  },

  wrapper: {
    width: "100%",
    maxWidth: 520,
  },

  card: {
    width: "100%",
    boxSizing: "border-box",
    padding: 28,
    borderRadius: 22,
    background: "#101A16",
    border: "1px solid #22352D",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.35)",
    marginBottom: 22,
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  badge: {
    display: "inline-block",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 12px",
    borderRadius: 999,
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },

  stepText: {
    color: "#9CAFA6",
    fontSize: 12,
    fontWeight: 700,
  },

  titulo: {
    fontSize: 26,
    fontWeight: 850,
    margin: "18px 0 6px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    color: "#F3FAF6",
    letterSpacing: "-.03em",
  },

  sub: {
    color: "#D7E5DE",
    margin: "0 0 4px",
    fontWeight: 700,
  },

  meta: {
    color: "#9CAFA6",
    fontSize: 14,
    margin: 0,
  },

  progressOuter: {
    width: "100%",
    height: 9,
    borderRadius: 999,
    background: "#263A32",
    overflow: "hidden",
    marginTop: 22,
  },

  progressInner: {
    height: "100%",
    borderRadius: 999,
    background: "#3FA37A",
  },

  resumen: {
    marginTop: 20,
    padding: "15px 17px",
    borderLeft: "4px solid",
    borderRadius: 14,
    background: "#13231D",
  },

  resumenLabel: {
    display: "block",
    color: "#9CCFB8",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".08em",
    marginBottom: 6,
  },

  resumenText: {
    margin: 0,
    color: "#E8F3EE",
    fontSize: 15,
    lineHeight: 1.5,
  },

  timeline: {
    width: "100%",
    boxSizing: "border-box",
    background: "#101A16",
    border: "1px solid #22352D",
    borderRadius: 22,
    padding: "28px 28px 6px",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.35)",
  },

  fila: {
    display: "flex",
    gap: 16,
  },

  col: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  punto: {
    width: 17,
    height: 17,
    borderRadius: "50%",
    border: "3px solid",
    flexShrink: 0,
    zIndex: 1,
  },

  linea: {
    width: 3,
    flex: 1,
    minHeight: 34,
    marginTop: 4,
    borderRadius: 999,
  },

  timelineContent: {
    paddingBottom: 24,
  },

  timelineTitle: {
    fontWeight: 800,
    fontSize: 15,
  },

  descTxt: {
    fontSize: 14,
    color: "#9CAFA6",
    marginTop: 4,
    lineHeight: 1.45,
  },

  fecha: {
    fontSize: 12,
    color: "#778A82",
    marginTop: 6,
  },

  volver: {
    display: "inline-block",
    marginTop: 22,
    color: "#9CCFB8",
    fontWeight: 750,
    textDecoration: "none",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#A7793D",
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: 900,
  },

  errorText: {
    color: "#B8C8C0",
    fontSize: 15,
    lineHeight: 1.6,
  },

  errorButton: {
    display: "inline-block",
    marginTop: 10,
    padding: "13px 18px",
    borderRadius: 14,
    background: "#3FA37A",
    color: "#FFFFFF",
    fontWeight: 800,
    textDecoration: "none",
  },
};