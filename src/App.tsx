import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
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
import type {
  Criterion,
  HistoryCriterion,
  HistoryEntry,
  HistoryModule,
  IndexModule,
  IndexSnapshot,
} from "./types";

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
  const [view, setView] = useState<"overview" | "trends">("overview");

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
      <ViewTabs view={view} onChange={setView} />
      {view === "overview" ? (
        <>
          <HeadlineGrid latest={data.latest} />
          <TrendSection history={data.history} />
          <ModuleSection
            modules={data.latest.modules}
            selectedModule={selectedModule}
            onSelect={setSelectedModuleId}
          />
          <Methodology latest={data.latest} />
          <SourceTable modules={data.latest.modules} />
        </>
      ) : (
        <TrendsPage history={data.history} latest={data.latest} />
      )}
    </main>
  );
}

function ViewTabs({
  view,
  onChange,
}: {
  view: "overview" | "trends";
  onChange: (view: "overview" | "trends") => void;
}) {
  return (
    <nav className="view-tabs" aria-label="Dashboard views">
      <button
        className={view === "overview" ? "active" : ""}
        onClick={() => onChange("overview")}
        type="button"
      >
        Overview
      </button>
      <button
        className={view === "trends" ? "active" : ""}
        onClick={() => onChange("trends")}
        type="button"
      >
        Trends
      </button>
    </nav>
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
  const chartData = toHeadlineChartData(history);
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
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: -24, bottom: 8 }}>
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

function TrendsPage({
  history,
  latest,
}: {
  history: HistoryEntry[];
  latest: IndexSnapshot;
}) {
  const chartData = toHeadlineChartData(history);
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const headlineDelta = current && previous
    ? roundDelta(current.headlines.siliconWorld - previous.headlines.siliconWorld)
    : 0;
  const topModules = current ? rankByAbsoluteDelta(current.modules).slice(0, 4) : [];
  const drivers = current ? rankByAbsoluteDelta(current.criteria).slice(0, 8) : [];

  return (
    <>
      <section className="section trends-hero">
        <div>
          <p className="eyebrow">Trends</p>
          <h2>Not just what changed, but why it changed.</h2>
          <p>
            Trend history stores headline scores, module scores, criterion
            drivers, source automation status, and annotations for methodology or
            data changes.
          </p>
        </div>
        <div className="trend-summary-grid">
          <TrendMetric label="Current index" value={latest.headlines.siliconWorld} />
          <TrendMetric label="Month change" value={headlineDelta} signed />
          <TrendMetric label="Tracked modules" value={latest.modules.length} compact />
          <TrendMetric label="History periods" value={history.length} compact />
        </div>
      </section>

      <section className="section chart-panel trend-chart">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Headline history</p>
            <h2>Capability can move differently from autonomy.</h2>
          </div>
          <p>Each point keeps the methodology version and generated snapshot period.</p>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData} margin={{ top: 8, right: 18, left: -18, bottom: 8 }}>
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
      </section>

      <section className="section trend-grid-layout">
        <ModuleHeatmap history={history} />
        <TrendDrivers modules={topModules} criteria={drivers} />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Annotations</p>
            <h2>Data and methodology changes stay visible.</h2>
          </div>
          <p>These notes separate real score movement from source or process changes.</p>
        </div>
        <div className="annotation-list">
          {history.flatMap((entry) =>
            entry.annotations.map((annotation) => (
              <article className="annotation-card" key={`${entry.period}-${annotation.title}`}>
                <span>{entry.period}</span>
                <h3>{annotation.title}</h3>
                <p>{annotation.note}</p>
              </article>
            )),
          )}
        </div>
      </section>
    </>
  );
}

function TrendMetric({
  label,
  value,
  signed = false,
  compact = false,
}: {
  label: string;
  value: number;
  signed?: boolean;
  compact?: boolean;
}) {
  const formatted = signed
    ? `${value > 0 ? "+" : ""}${value.toFixed(1)}`
    : compact
      ? String(value)
      : value.toFixed(1);
  return (
    <article className="trend-metric">
      <span>{label}</span>
      <strong className={signed ? deltaClassName(value) : ""}>{formatted}</strong>
    </article>
  );
}

function ModuleHeatmap({ history }: { history: HistoryEntry[] }) {
  const moduleIds = history[history.length - 1]?.modules.map((module) => module.id) ?? [];
  const moduleNames = new Map(
    history.flatMap((entry) => entry.modules.map((module) => [module.id, module.name] as const)),
  );

  return (
    <section className="heatmap-panel">
      <div className="panel-heading">
        <p className="eyebrow">Module heatmap</p>
        <h3>Score by module and month</h3>
      </div>
      <div className="heatmap-scroll">
        <div
          className="heatmap"
          style={{ gridTemplateColumns: `minmax(180px, 1.2fr) repeat(${history.length}, 76px)` }}
        >
          <div className="heatmap-label">Module</div>
          {history.map((entry) => (
            <div className="heatmap-label" key={entry.period}>
              {entry.period}
            </div>
          ))}
          {moduleIds.map((moduleId) => (
            <HeatmapRow
              history={history}
              key={moduleId}
              moduleId={moduleId}
              moduleName={moduleNames.get(moduleId) ?? moduleId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeatmapRow({
  history,
  moduleId,
  moduleName,
}: {
  history: HistoryEntry[];
  moduleId: string;
  moduleName: string;
}) {
  return (
    <>
      <div className="heatmap-module-name">{moduleName}</div>
      {history.map((entry) => {
        const module = entry.modules.find((item) => item.id === moduleId);
        return (
          <div
            className="heatmap-cell"
            key={`${entry.period}-${moduleId}`}
            style={{ background: heatmapColor(module?.score ?? 0) }}
            title={`${moduleName}: ${module?.score.toFixed(1) ?? "n/a"}`}
          >
            {module?.score.toFixed(1) ?? "-"}
          </div>
        );
      })}
    </>
  );
}

function TrendDrivers({
  modules,
  criteria,
}: {
  modules: HistoryModule[];
  criteria: HistoryCriterion[];
}) {
  return (
    <section className="driver-panel">
      <div className="panel-heading">
        <p className="eyebrow">Change drivers</p>
        <h3>Largest module and criterion movements</h3>
      </div>
      <div className="driver-group">
        <h4>Modules</h4>
        {modules.map((module) => (
          <DeltaRow
            key={module.id}
            label={module.name}
            meta={module.bottleneck}
            value={module.score}
            delta={module.delta}
          />
        ))}
      </div>
      <div className="driver-group">
        <h4>Criteria</h4>
        {criteria.map((criterion) => (
          <DeltaRow
            key={`${criterion.moduleId}-${criterion.id}`}
            label={criterion.name}
            meta={`${criterion.moduleName} | ${criterion.sourceAutomationStatus.replace("_", " ")}`}
            value={criterion.score}
            delta={criterion.delta}
          />
        ))}
      </div>
    </section>
  );
}

function DeltaRow({
  label,
  meta,
  value,
  delta,
}: {
  label: string;
  meta: string;
  value: number;
  delta: number;
}) {
  const Icon = delta >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <article className="delta-row">
      <div>
        <strong>{label}</strong>
        <span>{meta}</span>
      </div>
      <div className="delta-values">
        <span>{value.toFixed(1)}</span>
        <span className={deltaClassName(delta)}>
          <Icon aria-hidden="true" size={16} />
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)}
        </span>
      </div>
    </article>
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

function toHeadlineChartData(history: HistoryEntry[]) {
  return history.map((entry) => ({
    period: entry.period,
    capability: entry.headlines.capability,
    autonomy: entry.headlines.autonomy,
    governance: entry.headlines.governance,
    siliconWorld: entry.headlines.siliconWorld,
  }));
}

function rankByAbsoluteDelta<T extends { delta: number }>(items: T[]) {
  return [...items].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

function roundDelta(value: number) {
  return Math.round(value * 10) / 10;
}

function deltaClassName(delta: number) {
  if (delta > 0) return "delta-positive";
  if (delta < 0) return "delta-negative";
  return "delta-flat";
}

function heatmapColor(score: number) {
  const normalized = Math.max(0, Math.min(100, score)) / 100;
  const hue = 24 + normalized * 112;
  const lightness = 92 - normalized * 38;
  return `hsl(${hue} 42% ${lightness}%)`;
}
