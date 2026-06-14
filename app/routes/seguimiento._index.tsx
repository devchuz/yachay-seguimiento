import { useNavigate } from "react-router";
import { useState, type CSSProperties } from "react";

export default function BuscarSeguimiento() {
  const [codigo, setCodigo] = useState("");
  const navigate = useNavigate();

  const codigoLimpio = codigo.trim().toUpperCase();
  const puedeBuscar = codigoLimpio.length > 0;

  function buscar() {
    if (!puedeBuscar) return;
    navigate(`/seguimiento/${codigoLimpio}`);
  }

  return (
    <main style={S.page}>
      <section style={S.card}>
        <div style={S.header}>
          <div style={S.logo}>Y</div>

          <div>
            <p style={S.kicker}>Yachay Seguimiento</p>
            <h1 style={S.title}>Consulta tu solicitud</h1>
          </div>
        </div>

        <p style={S.description}>
          Ingresa el código que te enviamos por WhatsApp para conocer el estado
          actual de tu solicitud.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            buscar();
          }}
          style={S.form}
        >
          <label htmlFor="codigo" style={S.label}>
            Código de solicitud
          </label>

          <input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="UNCP-2026-00118"
            autoComplete="off"
            style={S.input}
          />

          <button
            type="submit"
            disabled={!puedeBuscar}
            style={{
              ...S.button,
              opacity: puedeBuscar ? 1 : 0.55,
              cursor: puedeBuscar ? "pointer" : "not-allowed",
            }}
          >
            Ver estado
          </button>
        </form>

        <div style={S.infoBox}>
          <span style={S.infoDot} />
          <p style={S.infoText}>
            El código tiene un formato similar a{" "}
            <strong style={S.strong}>UNCP-2026-00118</strong>.
          </p>
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
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: 500,
    boxSizing: "border-box",
    padding: 28,
    borderRadius: 22,
    background: "#101A16",
    border: "1px solid #22352D",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.35)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 22,
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: "#3FA37A",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 900,
  },

  kicker: {
    margin: "0 0 4px",
    color: "#9CCFB8",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".1em",
  },

  title: {
    margin: 0,
    color: "#F3FAF6",
    fontSize: 28,
    lineHeight: 1.1,
    fontWeight: 850,
    letterSpacing: "-.03em",
  },

  description: {
    margin: "0 0 24px",
    color: "#B8C8C0",
    fontSize: 15,
    lineHeight: 1.6,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  label: {
    color: "#D7E5DE",
    fontSize: 13,
    fontWeight: 800,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 18px",
    borderRadius: 14,
    border: "1px solid #335247",
    outline: "none",
    background: "#08110E",
    color: "#F3FAF6",
    fontSize: 18,
    fontWeight: 800,
    textAlign: "center",
    letterSpacing: 1,
  },

  button: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: 14,
    border: "none",
    background: "#3FA37A",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: 800,
  },

  infoBox: {
    marginTop: 22,
    padding: "14px 16px",
    borderRadius: 14,
    background: "#13231D",
    border: "1px solid #22352D",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },

  infoDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#3FA37A",
    marginTop: 5,
    flexShrink: 0,
  },

  infoText: {
    margin: 0,
    color: "#9CAFA6",
    fontSize: 13,
    lineHeight: 1.5,
  },

  strong: {
    color: "#E8F3EE",
  },
};