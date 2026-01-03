import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/SearchableSelect.css";

const normalize = (str) => str.toString().toLowerCase();

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
  allowAll = true,
  searchable = true,
  multiple = false,
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? "");
  const [query, setQuery] = useState("");

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

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
    document.addEventListener("click", onDocMouseDown);
    return () => document.removeEventListener("click", onDocMouseDown);
  }, []);

  // Support options as strings OR {value,label}
    const opts = useMemo(() => {
    // supports strings or {value,label}
    return (options || []).map((o) => {
      if (o && typeof o === "object") {
        const v = (o.value ?? o.label ?? "").toString();
        const l = (o.label ?? o.value ?? "").toString();
        return { value: v, label: l };
      }
      return { value: (o ?? "").toString(), label: (o ?? "").toString() };
    });
  }, [options]);

  // Filter options only when searchable is enabled
  const filtered = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return opts;
    return opts.filter((o) => normalize(o.label).includes(q) || normalize(o.value).includes(q));
  }, [opts, query]);

  const selectedValues = useMemo(() => {
    if (multiple) return Array.isArray(value) ? value.map(String) : [];
    return value ? [String(value)] : [];
  }, [value, multiple]);

   const selectedLabel = useMemo(() => {
    if (multiple) {
      if (!selectedValues.length) return "";
      // show "3 selected" style to keep UI compact
      if (selectedValues.length === 1) {
        const one = selectedValues[0];
        const found = opts.find((x) => x.value === one);
        return found?.label ?? one;
      }
      return `${selectedValues.length} selected`;
    }
    const v = selectedValues[0];
    if (!v) return "";
    const found = opts.find((x) => x.value === v);
    return found?.label ?? v;
  }, [multiple, selectedValues, opts]);
  
  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isSelected = (val) => selectedValues.includes(String(val));

  const pickSingle = (val) => {
    onChange?.(String(val));
    close();
  };

  const toggleMulti = (val) => {
    const s = String(val);
    const next = isSelected(s)
      ? selectedValues.filter((x) => x !== s)
      : [...selectedValues, s];
    onChange?.(next);
    // keep open for multi
    if (inputRef.current) inputRef.current.focus();
  };
  
  const selectOption = (opt) => {
    setText(opt.label);
    onChange(opt.value);
    setOpen(false);
  };

  const clearAll = () => {
    onChange?.(multiple ? [] : "");
    close();
  };

  const handleInput = (e) => {
    if (!searchable) return;
    const v = e.target.value;
    setText(v);
    setOpen(true);
    // live filter the table as you type
    onChange(v);
  };

  return (
    <div className="ss-field" ref={wrapRef}>
      {label ? <label className="ss-label">{label}</label> : null}

      <div 
        className="ss-control"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <input
          ref={inputRef}
          className="ss-input"
          value={open && searchable ? query : selectedLabel}
          placeholder={selectedLabel ? "" : placeholder}
          readOnly={!searchable}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
        />

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
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearAll}
            >
              {multiple ? "Clear Selection" : "All"}
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="ss-empty">No matches</div>
          ) : (
            filtered.map((opt) => {
              const checked = isSelected(opt.value);
              return (
                <button
                  key={`${opt.value}-${opt.label}`}
                  type="button"
                  className={`ss-option ${checked ? 'is-selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (multiple) toggleMulti(opt.value);
                    else pickSingle(opt.value);
                  }}
                >
                  {multiple && <span className="ss-check" aria-hidden="true">{checked ? "☑" : "☐"}</span>}
                  <span className="ss-option-text">{opt.label}</span>
                </button>
              );
              
            })
          )}
        </div>
      )}
    </div>
  );
}
