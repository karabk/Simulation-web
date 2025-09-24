import React, { useMemo } from 'react';
import { HttpResponseModel } from '../../types/api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props { response: HttpResponseModel | null }

export const ResponseViewer: React.FC<Props> = ({ response }) => {
  const pretty = useMemo(() => {
    if (!response) return '';
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      return response.body;
    }
  }, [response]);

  if (!response) return <div className="panel">No response yet.</div>;

  return (
    <div className="panel">
      <div style={{ marginBottom: 8 }}>
        <strong>Status:</strong> {response.status}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Headers:</strong>
        <pre className="code" style={{ background: '#f7f7f7', padding: 8, borderRadius: 8 }}>{Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}</pre>
      </div>
      <div>
        <strong>Body:</strong>
        <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ borderRadius: 8, maxHeight: 400 }}>
          {pretty}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
