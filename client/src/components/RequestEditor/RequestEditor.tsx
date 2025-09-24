import React, { useMemo, useState } from 'react';
import { HttpRequestModel } from '../../types/api';

interface Props {
  value: HttpRequestModel;
  onChange: (v: HttpRequestModel) => void;
  onSend: () => void;
  history: HttpRequestModel[];
}

export const RequestEditor: React.FC<Props> = ({ value, onChange, onSend, history }) => {
  const [headerKey, setHeaderKey] = useState('');
  const [headerVal, setHeaderVal] = useState('');

  const headersString = useMemo(() => Object.entries(value.headers).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n'), [value.headers]);

  function setHeader(k: string, v: string) {
    const next = { ...value.headers };
    if (v) next[k] = v; else delete next[k];
    onChange({ ...value, headers: next });
  }

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div className="row">
        <select value={value.method} onChange={e => onChange({ ...value, method: e.target.value })}>
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input style={{ flex: 1 }} value={value.url} onChange={e => onChange({ ...value, url: e.target.value })} placeholder="/api/..." />
        <button className="btn" onClick={onSend}>Send</button>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <input placeholder="Header name" value={headerKey} onChange={e => setHeaderKey(e.target.value)} />
        <input placeholder="Header value" value={headerVal} onChange={e => setHeaderVal(e.target.value)} />
        <button className="btn secondary" onClick={() => { if (headerKey) { setHeader(headerKey, headerVal); setHeaderKey(''); setHeaderVal(''); } }}>Add/Set</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600 }}>Headers</div>
        <pre className="code" style={{ background: '#f7f7f7', padding: 8, borderRadius: 8 }}>{headersString || '(none)'}</pre>
      </div>
      <div className="col" style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600 }}>Body</div>
        <textarea className="code" rows={12} value={value.body || ''} onChange={e => onChange({ ...value, body: e.target.value })} placeholder="JSON/XML or raw text"></textarea>
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600 }}>History</div>
        <div style={{ maxHeight: 140, overflow: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
          {history.map((h, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <button className="btn secondary" onClick={() => onChange(h)}>{h.method} {h.url}</button>
            </div>
          ))}
          {!history.length && <div style={{ opacity: .6 }}>(empty)</div>}
        </div>
      </div>
    </div>
  );
};
