import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SearchableSelect.css";

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
  allowAll = true,
  searchable = true,
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? "");
  const wrapRef = useRef(null);

  // Keep input text in sync if parent changes it
  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // Support options as strings OR {value,label}
  const normalizedOptions = useMemo(() => {
    const list = (options || [])
      .map((opt) => {
        if (typeof opt === "string") return { value: opt, label: opt };
        return { value: opt?.value ?? "", label: opt?.label ?? "" };
      })
      .filter((x) => x.value);

    // unique by value
    const seen = new Set();
    const uniq = [];
    for (const item of list) {
      if (!seen.has(item.value)) {
        seen.add(item.value);
        uniq.push(item);
      }
    }
    return uniq;
  }, [options]);

  // Filter options only when searchable is enabled
  const filteredOptions = useMemo(() => {
    if (!searchable) return normalizedOptions;

    const q = (text ?? "").toString().trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [normalizedOptions, searchable, text]);

  const selectOption = (opt) => {
    setText(opt.label);
    onChange(opt.value);
    setOpen(false);
  };

  const clear = () => {
    setText("");
    onChange("");
    setOpen(false);
  };

  const handleInput = (e) => {
    if (!searchable) return;
    const v = e.target.value;
    setText(v);
    setOpen(true);
    // live filter the table as you type (your original behavior)
    onChange(v);
  };

  return (
    <div className="ss-field" ref={wrapRef}>
      {label ? <label className="ss-label">{label}</label> : null}

      <div className={`ss-control ${open ? "is-open" : ""}`}>
        <input
          className="ss-input"
          value={text}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          readOnly={!searchable}
        />

        {searchable && !!text && (
          <button type="button" className="ss-clear" onClick={clear} aria-label="Clear">
            ×
          </button>
        )}

        <button
          type="button"
          className="ss-caret"
          onClick={() => setOpen((p) => !p)}
          aria-label="Toggle options"
        >
          ▾
        </button>
      </div>

      {open && (
        <div className="ss-menu" role="listbox">
          {allowAll && (
            <button
              type="button"
              className="ss-option"
              onClick={() => selectOption({ value: "", label: "All" })}
            >
              All
            </button>
          )}

          {filteredOptions.length === 0 ? (
            <div className="ss-empty">No matches</div>
          ) : (
            filteredOptions.map((opt) => (
              <button
                type="button"
                className="ss-option"
                key={opt.value}
                onClick={() => selectOption(opt)}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
