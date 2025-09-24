import React, { useEffect, useState } from 'react';
import { VulnerabilityList } from '../components/VulnerabilityList/VulnerabilityList';
import { RequestEditor } from '../components/RequestEditor/RequestEditor';
import { ResponseViewer } from '../components/ResponseViewer/ResponseViewer';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { SimulationGuide } from '../components/SimulationGuide/SimulationGuide';
import { ApiScenario, HttpRequestModel, HttpResponseModel } from '../types/api';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ApiScenario[]>([]);
  const [selected, setSelected] = useState<ApiScenario | null>(null);
  const [requestModel, setRequestModel] = useState<HttpRequestModel>({ method: 'GET', url: '/api/user/profile', headers: { 'User-Agent': 'Mozilla/5.0' }, body: '' });
  const [responseModel, setResponseModel] = useState<HttpResponseModel | null>(null);
  const [history, setHistory] = useState<HttpRequestModel[]>([]);

  useEffect(() => {
    fetch('/api/simulations/list').then(r => r.json()).then(d => setScenarios(d.scenarios));
  }, []);

  function handleSelect(s: ApiScenario) {
    setSelected(s);
    // prefill
    if (s.id === 'sqli-user-agent') {
      setRequestModel({ method: 'GET', url: '/api/user/profile', headers: { 'User-Agent': "Mozilla/5.0' AND 1=1 --" }, body: '' });
    } else if (s.id === 'path-traversal-translations') {
      setRequestModel({ method: 'GET', url: '/api/translations/en', headers: {}, body: '' });
    } else if (s.id === 'path-traversal-download') {
      setRequestModel({ method: 'POST', url: '/api/documents/download', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'user_docs/report.pdf' }, null, 2) });
    }
  }

  async function sendRequest() {
    const { method, url, headers, body } = requestModel;
    const init: RequestInit = { method, headers: headers as any };
    if (method !== 'GET' && body) init.body = body;
    const resp = await fetch(url, init);
    const text = await resp.text();
    setResponseModel({ status: resp.status, headers: Object.fromEntries(resp.headers.entries()), body: text });
    setHistory(h => [{ ...requestModel }, ...h].slice(0, 25));
  }

  function insertPayload(payload: string) {
    if (!selected) return;
    if (selected.id === 'sqli-user-agent') {
      setRequestModel(prev => ({ ...prev, headers: { ...prev.headers, 'User-Agent': `Mozilla/5.0${payload}` } }));
    } else if (selected.id === 'path-traversal-translations') {
      setRequestModel(prev => ({ ...prev, url: `/api/translations/${payload}` }));
    } else if (selected.id === 'path-traversal-download') {
      setRequestModel(prev => ({ ...prev, body: JSON.stringify({ file: payload }, null, 2) }));
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh' }}>
      <aside style={{ borderRight: '1px solid #eee', padding: '12px', overflow: 'auto' }}>
        <h3>Scenarios</h3>
        <VulnerabilityList scenarios={scenarios} selectedId={selected?.id || ''} onSelect={handleSelect} />
        <h3>Upload</h3>
        <FileUpload onLoaded={(content) => setRequestModel(prev => ({ ...prev, body: content }))} />
        <div style={{ fontSize: 12, marginTop: 16 }}>
          <strong>Warnings</strong>
          <ul>
            <li>FOR EDUCATIONAL USE ONLY</li>
            <li>DO NOT DEPLOY ON PUBLIC NETWORKS</li>
            <li>ALL DATA IS SIMULATED</li>
          </ul>
        </div>
      </aside>
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12 }}>
        <section>
          <SimulationGuide scenario={selected || undefined} onInsertPayload={insertPayload} />
          <RequestEditor value={requestModel} onChange={setRequestModel} onSend={sendRequest} history={history} />
        </section>
        <section>
          <ResponseViewer response={responseModel} />
        </section>
      </main>
    </div>
  );
};
