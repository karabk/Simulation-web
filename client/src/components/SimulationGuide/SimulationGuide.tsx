import React from 'react';
import { ApiScenario } from '../../types/api';

interface Props {
  scenario?: ApiScenario;
  onInsertPayload: (payload: string) => void;
}

export const SimulationGuide: React.FC<Props> = ({ scenario, onInsertPayload }) => {
  if (!scenario) return <div className="panel">Select a scenario to see guidance.</div>;
  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0 }}>{scenario.name}</h3>
        <code className="code">{scenario.endpoint}</code>
      </div>
      <p style={{ marginTop: 8 }}>
        This interactive demo simulates vulnerabilities in a safe, sandboxed environment. Try the payloads below.
      </p>
      <div>
        <strong>One-click payloads</strong>
        <div className="row" style={{ flexWrap: 'wrap', marginTop: 6 }}>
          {scenario.payloads.map((p, idx) => (
            <button key={idx} className="btn secondary" onClick={() => onInsertPayload(p)}>{p}</button>
          ))}
        </div>
      </div>
      <details style={{ marginTop: 8 }}>
        <summary><strong>Background & Mitigation</strong></summary>
        <ul>
          <li>Use parameterized queries and ORM query builders.</li>
          <li>Normalize and validate file paths; do not concatenate user input.</li>
          <li>Run services with least privilege and sandbox file access.</li>
        </ul>
      </details>
      <details>
        <summary><strong>Quiz</strong></summary>
        <ol>
          <li>Which input leads to a SQL syntax error?</li>
          <li>Why does <code className="code">../</code> allow traversal?</li>
          <li>How do prepared statements prevent injection?</li>
        </ol>
      </details>
    </div>
  );
};
