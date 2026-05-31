import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  GitBranch,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { loadIndexData } from "./lib/data";
import type { Criterion, HistoryEntry, IndexModule, IndexSnapshot } from "./types";

interface IndexDataState {
  latest: IndexSnapshot;
  history: HistoryEntry[];
}

const headlineMeta = [
  {
    key: "siliconWorld",
    label: "Silicon World Index",
    description: "Weighted view of capability, autonomy, and governance.",
    icon: Gauge,
  },
  {
    key: "capability",
    label: "Capability Index",
    description: "How strong AI systems are as technical tools.",
    icon: TrendingUp,
  },
  {
    key: "autonomy",
    label: "Autonomy Index",
    description: "How much AI closes loops in real workflows.",
    icon: Bot,
  },
  {
    key: "governance",
    label: "Governance Index",
    description: "How ready audit, safety, and controls are.",
    icon: ShieldAlert,
  },
] as const;

const categoryLabels = {
  capability: "Capability",
  autonomy: "Autonomy",
  governance: "Governance",
};

const moduleIcons = [Sparkles, Bot, GitBranch, Activity, Database, CheckCircle2];

export function App() {
  const [data, setData] = useState<IndexDataState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  useEffect(() => {
    loadIndexData()
      .then((nextData) => {
        setData(nextData);
        setSelectedModuleId(nextData.latest.modules[0]?.id ?? null);
      })
      .catch((nextError: Error) => setError(nextError.message));
  }, []);

  const selectedModule = useMemo(() => {
    if (!data) return null;
    return (
      data.latest.modules.find((module) => module.id === selectedModuleId) ??
      data.latest.modules[0] ??
      null
    );
  }, [data, selectedModuleId]);

  if (error) {
    return (
      <main className="app-shell">
        <section className="empty-state">
          <h1>Unable to load index data.</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="app-shell">
        <section className="empty-state">
          <h1>Loading Silicon World Index...</h1>
          <p>Reading latest snapshot and historical trend data.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Hero latest={data.latest} />
      <HeadlineGrid latest={data.latest} />
      <TrendSection history={data.history} />
      <ModuleSection
        modules={data.latest.modules}
        selectedModule={selectedModule}
        onSelect={setSelectedModuleId}
      />
      <Methodology latest={data.latest} />
      <SourceTable modules={data.latest.modules} />
    </main>
  );
}

function Hero({ latest }: { latest: IndexSnapshot }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Silicon World Index</p>
        <h1>Tracking AI capability separately from AI-led autonomy.</h1>
        <p>
          A skeptical progress map for the AI-led world: every score ties back to
          a criterion, source, confidence level, and automation status.
        </p>
      </div>
      <div className="hero-panel">
        <div>
          <span className="panel-label">Latest period</span>
          <strong>{latest.metadata.period}</strong>
        </div>
        <div>
          <span className="panel-label">Updated</span>
          <strong>{latest.metadata.updatedAt}</strong>
        </div>
        <div>
          <span className="panel-label">Methodology</span>
          <strong>{latest.metadata.methodologyVersion}</strong>
        </div>
      </div>
    </section>
  );
}

function HeadlineGrid({ latest }: { latest: IndexSnapshot }) {
  return (
    <section className="score-grid" aria-label="Headline scores">
      {headlineMeta.map((item) => {
        const Icon = item.icon;
        const score = latest.headlines[item.key];
        return (
          <article className="score-card" key={item.key}>
            <div className="score-card-header">
              <Icon aria-hidden="true" size={20} />
              <span>{item.label}</span>
            </div>
            <strong>{score.toFixed(1)}</strong>
            <p>{item.description}</p>
          </article>
        );
      })}
    </section>
  );
}

function TrendSection({ history }: { history: HistoryEntry[] }) {
  return (
    <section className="section two-column">
      <div>
        <p className="eyebrow">Trend</p>
        <h2>Monthly movement without false precision.</h2>
        <p>
          The first release is semi-automatic: local curated inputs generate
          traceable JSON snapshots. Automation can replace criteria one source at
          a time.
        </p>
      </div>
      <div className="chart-panel">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={history} margin={{ top: 8, right: 16, left: -24, bottom: 8 }}>
            <CartesianGrid stroke="#d9dfd6" strokeDasharray="4 4" />
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="capability" stroke="#1f7a56" strokeWidth={2} dot />
            <Line type="monotone" dataKey="autonomy" stroke="#4257a6" strokeWidth={2} dot />
            <Line type="monotone" dataKey="governance" stroke="#a15f2b" strokeWidth={2} dot />
            <Line type="monotone" dataKey="siliconWorld" stroke="#101812" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ModuleSection({
  modules,
  selectedModule,
  onSelect,
}: {
  modules: IndexModule[];
  selectedModule: IndexModule | null;
  onSelect: (moduleId: string) => void;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Modules</p>
          <h2>Where capability is ahead, autonomy is still catching up.</h2>
        </div>
        <p>Click a module to inspect its criteria and source trail.</p>
      </div>

      <div className="module-layout">
        <div className="module-grid">
          {modules.map((module, index) => {
            const Icon = moduleIcons[index % moduleIcons.length];
            const isSelected = module.id === selectedModule?.id;
            return (
              <button
                className={`module-card ${isSelected ? "selected" : ""}`}
                key={module.id}
                onClick={() => onSelect(module.id)}
                type="button"
              >
                <span className="module-icon">
                  <Icon aria-hidden="true" size={18} />
                </span>
                <span className="module-title">{module.name}</span>
                <strong>{module.score.toFixed(1)}</strong>
                <span className="module-meta">
                  {categoryLabels[module.category]} | confidence{" "}
                  {Math.round(module.confidence * 100)}%
                </span>
                <span className="module-bottleneck">{module.bottleneck}</span>
              </button>
            );
          })}
        </div>

        {selectedModule ? <ModuleDetail module={selectedModule} /> : null}
      </div>
    </section>
  );
}

function ModuleDetail({ module }: { module: IndexModule }) {
  return (
    <aside className="module-detail">
      <div className="detail-header">
        <div>
          <p className="eyebrow">{categoryLabels[module.category]}</p>
          <h3>{module.name}</h3>
        </div>
        <strong>{module.score.toFixed(1)}</strong>
      </div>
      <p>{module.summary}</p>
      <div className="criteria-list">
        {module.criteria.map((criterion) => (
          <CriterionRow criterion={criterion} key={criterion.id} />
        ))}
      </div>
    </aside>
  );
}

function CriterionRow({ criterion }: { criterion: Criterion }) {
  return (
    <details className="criterion">
      <summary>
        <span>{criterion.name}</span>
        <strong>{criterion.score.toFixed(1)}</strong>
      </summary>
      <dl>
        <div>
          <dt>Weight</dt>
          <dd>{Math.round(criterion.weight * 100)}%</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{Math.round(criterion.confidence * 100)}%</dd>
        </div>
        <div>
          <dt>Automation</dt>
          <dd>{criterion.source.automationStatus.replace("_", " ")}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            <a href={criterion.source.url} target="_blank" rel="noreferrer">
              {criterion.source.label}
            </a>
          </dd>
        </div>
      </dl>
      <p>{criterion.notes}</p>
    </details>
  );
}

function Methodology({ latest }: { latest: IndexSnapshot }) {
  return (
    <section className="section methodology">
      <div>
        <p className="eyebrow">Methodology</p>
        <h2>Strict enough to keep the autonomy score low.</h2>
      </div>
      <div className="method-grid">
        <MethodCard
          title="Capability"
          weight={latest.headlineWeights.capability}
          body="Measures technical performance: models, multimodal systems, science, and compute."
        />
        <MethodCard
          title="Autonomy"
          weight={latest.headlineWeights.autonomy}
          body="Measures closed-loop execution: agents, workflows, memory, robotics, and enterprise control."
        />
        <MethodCard
          title="Governance"
          weight={latest.headlineWeights.governance}
          body="Measures whether safety, auditability, incident response, and policy can keep up."
        />
      </div>
    </section>
  );
}

function MethodCard({ title, weight, body }: { title: string; weight: number; body: string }) {
  return (
    <article className="method-card">
      <span>{Math.round(weight * 100)}% aggregate weight</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function SourceTable({ modules }: { modules: IndexModule[] }) {
  const sources = modules.flatMap((module) =>
    module.criteria.map((criterion) => ({
      module: module.name,
      criterion: criterion.name,
      ...criterion.source,
    })),
  );

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Sources</p>
          <h2>Traceability before automation.</h2>
        </div>
        <p>
          Most first-release inputs are manual or semi-automatic. That status is
          displayed on purpose.
        </p>
      </div>
      <div className="source-table-wrap">
        <table className="source-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Criterion</th>
              <th>Source</th>
              <th>Status</th>
              <th>Accessed</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={`${source.module}-${source.criterion}`}>
                <td>{source.module}</td>
                <td>{source.criterion}</td>
                <td>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                </td>
                <td>{source.automationStatus.replace("_", " ")}</td>
                <td>{source.accessedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
