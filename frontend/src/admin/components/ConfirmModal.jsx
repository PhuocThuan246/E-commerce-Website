import React from "react";

export default function ConfirmModal({ show, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Xác nhận</h3>
        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          <button style={styles.okBtn} onClick={onConfirm}>
            OK
          </button>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "white",
    width: 380,
    padding: "24px 26px",
    borderRadius: 20,
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
  },
  message: {
    marginTop: 14,
    fontSize: 15,
    color: "#374151",
    lineHeight: "22px",
  },
  actions: {
    marginTop: 24,
    display: "flex",
    justifyContent: "flex-end",
    gap: 14,
  },
  okBtn: {
    background: "#0f766e",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#e5e7eb",
    border: "none",
    padding: "10px 20px",
    borderRadius: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
