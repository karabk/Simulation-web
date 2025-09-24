import React, { useState } from 'react';

interface Props { onLoaded: (content: string) => void }

export const FileUpload: React.FC<Props> = ({ onLoaded }) => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await resp.json();
      if (data?.preview) {
        onLoaded(typeof data.preview === 'string' ? data.preview : JSON.stringify(data.preview, null, 2));
      }
      setMessage('Uploaded: ' + (data?.meta?.originalName || file.name));
    } catch (e) {
      setMessage('Upload failed: ' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <input type="file" accept=".json,.png,.csv" onChange={handleChange} disabled={busy} />
      <div style={{ fontSize: 12, opacity: .7, marginTop: 6 }}>JSON, PNG, CSV supported</div>
      {message && <div style={{ fontSize: 12, marginTop: 6 }}>{message}</div>}
    </div>
  );
};
