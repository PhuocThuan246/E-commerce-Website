// src/components/SearchBar.jsx
import { useEffect, useState } from "react";
import "./styles.css";

export default function SearchBar({ value, onSubmit }) {
  const [q, setQ] = useState(value || "");
  useEffect(() => setQ(value || ""), [value]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit?.(q.trim());
  };

  return (
    <form onSubmit={submit} className="sb-row">
      <input
        className="sb-input"
        placeholder="Tìm sản phẩm… (vd: iphone, samsung)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button className="btn-primary">Tìm kiếm</button>
    </form>
  );
}
