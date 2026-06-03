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
  TrendAnnotation,
  TrendAnnotationType,
} from "./types";

type Locale = "zh" | "en";

interface IndexDataState {
  latest: IndexSnapshot;
  history: HistoryEntry[];
}

interface LocaleCopy {
  appName: string;
  nav: {
    ariaLabel: string;
    overview: string;
    trends: string;
  };
  language: {
    label: string;
    zhLabel: string;
    enLabel: string;
  };
  loading: {
    title: string;
    message: string;
  };
  error: {
    title: string;
    suffix: string;
  };
  viewTabs: {
    overview: string;
    trends: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    latestPeriod: string;
    updated: string;
    methodology: string;
  };
  headlines: {
    siliconWorld: {
      label: string;
      description: string;
    };
    capability: {
      label: string;
      description: string;
    };
    autonomy: {
      label: string;
      description: string;
    };
    governance: {
      label: string;
      description: string;
    };
  };
  categories: {
    capability: string;
    autonomy: string;
    governance: string;
  };
  trend: {
    eyebrow: string;
    title: string;
    description: string;
  };
  trendsPage: {
    eyebrow: string;
    title: string;
    description: string;
    metricCurrentIndex: string;
    metricMonthChange: string;
    metricTrackedModules: string;
    metricHistoryPeriods: string;
    chartEyebrow: string;
    chartTitle: string;
    chartDescription: string;
    modulesHeatmapTitle: string;
    modulesHeatmapDescription: string;
    changeDriversEyebrow: string;
    changeDriversTitle: string;
    modulesGroupTitle: string;
    criteriaGroupTitle: string;
    annotationTitle: string;
    annotationHeading: string;
    annotationDescription: string;
  };
  moduleSection: {
    eyebrow: string;
    title: string;
    tip: string;
  };
  moduleCard: {
    confidence: string;
    confidenceUnknown: string;
    bottleneckUnknown: string;
  };
  moduleDetail: {
    categoryEyebrow: string;
    weight: string;
    confidence: string;
    automation: string;
    source: string;
  };
  methodology: {
    eyebrow: string;
    title: string;
    capabilityLabel: string;
    autonomyLabel: string;
    governanceLabel: string;
    weightLabel: string;
    capabilityBody: string;
    autonomyBody: string;
    governanceBody: string;
  };
  sources: {
    eyebrow: string;
    title: string;
    description: string;
    module: string;
    criterion: string;
    source: string;
    status: string;
    accessed: string;
  };
  chart: {
    na: string;
  };
  criteriaMeta: {
    module: string;
    manual: string;
    semiAutomatic: string;
    automatic: string;
    from: string;
    periodSeparator: string;
  };
  moduleNames: Record<string, string>;
  criterionNames: Record<string, string>;
  moduleSummary: Record<string, string>;
  moduleBottleneck: Record<string, string>;
  criterionNotes: Record<string, string>;
  annotations: Record<
    TrendAnnotationType,
    {
      title: string;
      note: string;
    }
  >;
  status: {
    manual: string;
    semi_automatic: string;
    automatic: string;
  };
}

const COPY: Record<Locale, LocaleCopy> = {
  zh: {
    appName: "硅世界指数",
    nav: {
      ariaLabel: "仪表盘视图",
      overview: "总览",
      trends: "趋势",
    },
    language: {
      label: "语言",
      zhLabel: "中文",
      enLabel: "English",
    },
    loading: {
      title: "正在加载硅世界指数...",
      message: "读取最新快照和历史趋势数据。",
    },
    error: {
      title: "无法加载指数数据。",
      suffix: "状态码：",
    },
    viewTabs: {
      overview: "总览",
      trends: "趋势",
    },
    hero: {
      eyebrow: "硅世界指数",
      title: "把 AI 能力和 AI 主导自主性分开来观察。",
      description:
        "构建可追溯的 AI 进展地图：每个得分都对应具体指标、来源、可信度和自动化状态。",
      latestPeriod: "最新周期",
      updated: "更新时间",
      methodology: "方法版本",
    },
    headlines: {
      siliconWorld: {
        label: "硅世界指数",
        description: "综合测量技术能力、自主性和治理能力。",
      },
      capability: {
        label: "能力指数",
        description: "AI 在技术能力上有多强：模型、模态、科学与算力的综合表现。",
      },
      autonomy: {
        label: "自主性指数",
        description: "AI 在真实工作流中闭环执行的程度：代理、流程、记忆与控制能力。",
      },
      governance: {
        label: "治理指数",
        description: "安全、审计、事故响应与制度是否能跟得上 AI 的应用速度。",
      },
    },
    categories: {
      capability: "能力",
      autonomy: "自主性",
      governance: "治理",
    },
    trend: {
      eyebrow: "趋势",
      title: "尽量避免虚假的精确感。",
      description: "第一版为半自动更新：手工整合输入生成可追溯快照，后续可逐条接入可自动化来源。",
    },
    trendsPage: {
      eyebrow: "趋势",
      title: "不仅是“改了多少”，更要看“为什么会改”。",
      description:
        "趋势历史保留了头部指数、各模块评分、指标驱动项、来源状态和方法/数据注释。",
      metricCurrentIndex: "当前指数",
      metricMonthChange: "月度变化",
      metricTrackedModules: "追踪模块数",
      metricHistoryPeriods: "历史期数",
      chartEyebrow: "指数历史",
      chartTitle: "能力与自主性不总是同步变化。",
      chartDescription: "每个时间点会保留方法版本和快照期。",
      modulesHeatmapTitle: "按模块与月份的得分变化",
      modulesHeatmapDescription: "模块热力图",
      changeDriversEyebrow: "变化驱动",
      changeDriversTitle: "模块与指标最大波动项",
      modulesGroupTitle: "模块",
      criteriaGroupTitle: "指标",
      annotationTitle: "注释",
      annotationHeading: "数据与方法变化保持可见。",
      annotationDescription: "这些记录用于区分真实分数波动与口径或流程调整。",
    },
    moduleSection: {
      eyebrow: "模块",
      title: "能力仍领先，而自主性在追赶。",
      tip: "点击模块可查看其指标与来源链路。",
    },
    moduleCard: {
      confidence: "可信度",
      confidenceUnknown: "信心",
      bottleneckUnknown: "瓶颈：",
    },
    moduleDetail: {
      categoryEyebrow: "类别",
      weight: "权重",
      confidence: "可信度",
      automation: "自动化",
      source: "来源",
    },
    methodology: {
      eyebrow: "方法",
      title: "让自主性分数保持谨慎与保守。",
      capabilityLabel: "能力",
      autonomyLabel: "自主性",
      governanceLabel: "治理",
      weightLabel: "总权重",
      capabilityBody:
        "关注模型、跨模态系统、科学应用和算力等技术层面的表现。",
      autonomyBody: "关注闭环执行能力：代理、工作流、记忆、机器人与企业控制。",
      governanceBody: "关注安全、可审计性、事故响应和政策是否匹配。",
    },
    sources: {
      eyebrow: "来源",
      title: "可追溯优先于自动化。",
      description: "首版数据中，大部分源是手工或半自动获取；状态会主动展示。",
      module: "模块",
      criterion: "指标",
      source: "来源",
      status: "状态",
      accessed: "获取时间",
    },
    chart: {
      na: "无",
    },
    criteriaMeta: {
      module: "模块",
      manual: "手工",
      semiAutomatic: "半自动",
      automatic: "自动",
      from: "|",
      periodSeparator: "：",
    },
    moduleNames: {
      "model-intelligence": "模型能力",
      "multimodal-content": "多模态内容",
      "scientific-discovery": "科学发现",
      "compute-infrastructure": "算力基础设施",
      "agent-execution": "代理执行",
      "tools-workflows": "工具与工作流",
      "data-memory": "数据与记忆",
      "robotics-physical-world": "机器人与物理世界",
      "enterprise-economy": "企业经济",
      "safety-governance": "安全与治理",
    },
    criterionNames: {
      "general-benchmarks": "通用基准测试表现",
      "code-reasoning": "代码与推理表现",
      "truthfulness": "事实可靠性与自我校验",
      "long-context": "长上下文一致性",
      "image-document-understanding": "图像与文档理解",
      "video-audio-generation": "视频与音频生成",
      "content-production-control": "端到端内容生产控制",
      "research-assistance": "研究辅助能力",
      "lab-automation-loop": "闭环实验室自动化",
      "validation-reproducibility": "验证与可复现性",
      "frontier-compute": "前沿训练算力",
      "inference-cost": "推理可负担性",
      "energy-capacity": "能源与数据中心容量",
      "supply-chain": "芯片与内存供应链",
      "issue-repair": "单任务修复",
      "time-horizon": "长任务时间窗",
      "tool-recovery": "工具故障恢复",
      "low-supervision": "低监督执行",
      "tool-use": "工具使用成熟度",
      "workflow-integration": "工作流集成",
      "verification": "验证基础设施",
      "orchestration": "自主编排",
      "public-knowledge": "公共知识覆盖率",
      "enterprise-data-readiness": "企业数据就绪度",
      "persistent-memory": "持久项目记忆",
      "provenance": "可追溯性与可审计性",
      "industrial-robot-density": "工业机器人部署",
      "general-embodiment": "通用具身智能",
      "safety-certification": "物理安全认证",
      "supply-and-cost": "机器人供应与成本",
      "organizational-adoption": "组织 AI 采用率",
      "core-production-control": "核心生产控制",
      "roi-at-scale": "大规模 ROI 证据",
      "labor-substitution": "关键流程劳动力替代",
      "incident-monitoring": "事故监控",
      "safety-benchmarks": "安全基准成熟度",
      "regulatory-readiness": "法规准备度",
      "auditability": "系统可审计性",
    },
    moduleSummary: {
      "model-intelligence": "前沿模型在语言、代码和推理上表现出色，但事实准确性和自检能力仍限制了世界级委托场景。",
      "multimodal-content": "图像、音频、视频和文档模型在生产环境中可用，但人类仍在意图定义、质控和分发环节主导。",
      "scientific-discovery": "AI 在研究流程中显著提速，尤其在生物学和材料领域，但自主发现闭环仍处于早期阶段。",
      "compute-infrastructure": "训练与推理算力仍快速扩展，但电力、芯片、内存和数据中心产能仍是增长瓶颈。",
      "agent-execution": "代理可以完成受限任务（尤其是编码类），但持续自主执行仍不稳定。",
      "tools-workflows": "工具调用与 IDE 集成在辅助场景已成熟，但端到端工作流仍依赖人工验证。",
      "data-memory": "AI 在公共知识覆盖方面表现广，但在持久记忆、来源溯源与企业级受控状态访问上仍薄弱。",
      "robotics-physical-world": "机器人在很多场景已经落地，但多数仍是专用自动化而非通用具身智能。",
      "enterprise-economy": "企业中的 AI 使用已普及，但大部分价值仍是“增强”而非 AI 独立接管核心生产流程。",
      "safety-governance": "安全评估、事故追踪与政策建设持续成熟，但全场景 AI 自主性的审计与控制机制尚不健全。",
    },
    moduleBottleneck: {
      "model-intelligence": "可靠性仍滞后于基准测试表现",
      "multimodal-content": "生成能力较强，但生产控制仍以人为主",
      "scientific-discovery": "AI 更多是辅助科学研究而非完全自主发现",
      "compute-infrastructure": "能源与供应链继续限制扩展速度",
      "agent-execution": "长周期可靠性仍偏低",
      "tools-workflows": "验证基础设施不均衡",
      "data-memory": "世界状态与企业记忆仍然碎片化",
      "robotics-physical-world": "通用物理自主能力仍然稀缺",
      "enterprise-economy": "AI 采用仍未转化为 AI 控制",
      "safety-governance": "治理成熟度仍落后于部署速度",
    },
    criterionNotes: {
      "general-benchmarks": "有助于评估通用技术能力，但并不直接代表自主性。",
      "code-reasoning": "表现强，但在非基准场景下仍然脆弱。",
      "truthfulness": "可靠性是能力未能转化为领导地位的主要原因。",
      "long-context": "长上下文窗口有帮助，但稳定的全局推理仍不均衡。",
      "image-document-understanding": "适用于分析流程，但在高风险抽取场景仍不够可靠。",
      "video-audio-generation": "创作效果出色，但流程控制仍非自主完成。",
      "content-production-control": "落地广泛，但人工仍保留编辑判断权。",
      "research-assistance": "擅长协作，较弱于独立研究者角色。",
      "lab-automation-loop": "有前景的系统已出现，但大规模可靠自主尚未普及。",
      "validation-reproducibility": "验证仍是以人为主的瓶颈。",
      "frontier-compute": "供给端扩展较快。",
      "inference-cost": "成本持续改善，但对长期自治仍有影响。",
      "energy-capacity": "电力供给越来越决定部署能力。",
      "supply-chain": "扩展不只受限于算法。",
      "issue-repair": "当前最有实践价值的证据是代理完成编码问题。",
      "time-horizon": "这是判断代理是否能长时间无监督运行的核心指标。",
      "tool-recovery": "恢复能力很大程度上依赖项目级验证基础设施。",
      "low-supervision": "大多数真实部署仍需高频人工复核。",
      "tool-use": "工具调用已普及，但工具输出仍需检查。",
      "workflow-integration": "已有采用，但部署质量差异明显。",
      "verification": "限制因素常常是运行环境，而不仅是模型。",
      "orchestration": "框架改进速度快于生产稳定性。",
      "public-knowledge": "公共知识丰富，但不一定及时或有充分依据。",
      "enterprise-data-readiness": "数据治理仍是采纳的主要阻碍之一。",
      "persistent-memory": "持久运营记忆仍处于产品和研究前沿。",
      "provenance": "高风险任务委托需要可追溯性。",
      "industrial-robot-density": "部署已经存在，但多数系统仍是窄场景。",
      "general-embodiment": "从演示到可靠通用机器人，差距仍然较大。",
      "safety-certification": "安全认证拖慢物理世界规模化自主化。",
      "supply-and-cost": "成本与维护仍约束物理世界规模化。",
      "organizational-adoption": "采用已不再是小众现象。",
      "core-production-control": "AI 通常是内嵌辅助而非最终决策者。",
      "roi-at-scale": "许多组织仍在试点与规模化价值之间徘徊。",
      "labor-substitution": "替代存在于局部场景，但未形成广泛结构性转变。",
      "incident-monitoring": "监测能力在提升，但完整性和分类仍有挑战。",
      "safety-benchmarks": "基准在提升，但仍落后于前沿部署。",
      "regulatory-readiness": "框架已存在，但落地执行因地区差异大。",
      "auditability": "审计能力尚未在 AI 工作流中普及。",
    },
    annotations: {
      data_update: {
        title: "快照重建",
        note: "已基于人工筛选的种子数据更新 {period} 期快照。",
      },
      methodology_change: {
        title: "方法更新",
        note: "更新了 {period} 期的计算口径或规则。",
      },
      source_change: {
        title: "来源更新",
        note: "更新了 {period} 期的来源映射与获取方式。",
      },
    },
    status: {
      manual: "手工",
      semi_automatic: "半自动",
      automatic: "自动",
    },
  },
  en: {
    appName: "Silicon World Index",
    nav: {
      ariaLabel: "Dashboard views",
      overview: "Overview",
      trends: "Trends",
    },
    language: {
      label: "Language",
      zhLabel: "中文",
      enLabel: "English",
    },
    loading: {
      title: "Loading Silicon World Index...",
      message: "Reading latest snapshot and historical trend data.",
    },
    error: {
      title: "Unable to load index data.",
      suffix: "Status: ",
    },
    viewTabs: {
      overview: "Overview",
      trends: "Trends",
    },
    hero: {
      eyebrow: "Silicon World Index",
      title: "Tracking AI capability separately from AI-led autonomy.",
      description:
        "A skeptical progress map for the AI-led world: every score ties back to a criterion, source, confidence level, and automation status.",
      latestPeriod: "Latest period",
      updated: "Updated",
      methodology: "Methodology",
    },
    headlines: {
      siliconWorld: {
        label: "Silicon World Index",
        description: "Weighted view of capability, autonomy, and governance.",
      },
      capability: {
        label: "Capability Index",
        description: "How strong AI systems are as technical tools.",
      },
      autonomy: {
        label: "Autonomy Index",
        description: "How much AI closes loops in real workflows.",
      },
      governance: {
        label: "Governance Index",
        description: "How ready audit, safety, and controls are.",
      },
    },
    categories: {
      capability: "Capability",
      autonomy: "Autonomy",
      governance: "Governance",
    },
    trend: {
      eyebrow: "Trend",
      title: "Monthly movement without false precision.",
      description:
        "The first release is semi-automatic: local curated inputs generate traceable JSON snapshots. Automation can replace criteria one source at a time.",
    },
    trendsPage: {
      eyebrow: "Trends",
      title: "Not just what changed, but why it changed.",
      description:
        "Trend history stores headline scores, module scores, criterion drivers, source automation status, and annotations for methodology or data changes.",
      metricCurrentIndex: "Current index",
      metricMonthChange: "Month change",
      metricTrackedModules: "Tracked modules",
      metricHistoryPeriods: "History periods",
      chartEyebrow: "Headline history",
      chartTitle: "Capability can move differently from autonomy.",
      chartDescription: "Each point keeps the methodology version and generated snapshot period.",
      modulesHeatmapTitle: "Score by module and month",
      modulesHeatmapDescription: "Module heatmap",
      changeDriversEyebrow: "Change drivers",
      changeDriversTitle: "Largest module and criterion movements",
      modulesGroupTitle: "Modules",
      criteriaGroupTitle: "Criteria",
      annotationTitle: "Annotations",
      annotationHeading: "Data and methodology changes stay visible.",
      annotationDescription: "These notes separate real score movement from source or process changes.",
    },
    moduleSection: {
      eyebrow: "Modules",
      title: "Where capability is ahead, autonomy is still catching up.",
      tip: "Click a module to inspect its criteria and source trail.",
    },
    moduleCard: {
      confidence: "confidence",
      confidenceUnknown: "confidence",
      bottleneckUnknown: "bottleneck:",
    },
    moduleDetail: {
      categoryEyebrow: "Category",
      weight: "Weight",
      confidence: "Confidence",
      automation: "Automation",
      source: "Source",
    },
    methodology: {
      eyebrow: "Methodology",
      title: "Strict enough to keep the autonomy score low.",
      capabilityLabel: "Capability",
      autonomyLabel: "Autonomy",
      governanceLabel: "Governance",
      weightLabel: "Aggregate weight",
      capabilityBody:
        "Measures technical performance: models, multimodal systems, science, and compute.",
      autonomyBody: "Measures closed-loop execution: agents, workflows, memory, robotics, and enterprise control.",
      governanceBody: "Measures whether safety, auditability, incident response, and policy can keep up.",
    },
    sources: {
      eyebrow: "Sources",
      title: "Traceability before automation.",
      description:
        "Most first-release inputs are manual or semi-automatic. That status is displayed on purpose.",
      module: "Module",
      criterion: "Criterion",
      source: "Source",
      status: "Status",
      accessed: "Accessed",
    },
    chart: {
      na: "n/a",
    },
    criteriaMeta: {
      module: "Module",
      manual: "manual",
      semiAutomatic: "semi automatic",
      automatic: "automatic",
      from: "|",
      periodSeparator: ":",
    },
    moduleNames: {
      "model-intelligence": "Model intelligence",
      "multimodal-content": "Multimodal content",
      "scientific-discovery": "Scientific discovery",
      "compute-infrastructure": "Compute infrastructure",
      "agent-execution": "Agent execution",
      "tools-workflows": "Tools and workflows",
      "data-memory": "Data and memory",
      "robotics-physical-world": "Robotics and physical world",
      "enterprise-economy": "Enterprise economy",
      "safety-governance": "Safety and governance",
    },
    criterionNames: {
      "general-benchmarks": "General benchmark strength",
      "code-reasoning": "Code and reasoning performance",
      "truthfulness": "Factual reliability and self-checking",
      "long-context": "Long-context consistency",
      "image-document-understanding": "Image and document understanding",
      "video-audio-generation": "Video and audio generation",
      "content-production-control": "End-to-end content production control",
      "research-assistance": "Research assistance capability",
      "lab-automation-loop": "Closed-loop lab automation",
      "validation-reproducibility": "Validation and reproducibility",
      "frontier-compute": "Frontier training compute",
      "inference-cost": "Inference affordability",
      "energy-capacity": "Energy and data center capacity",
      "supply-chain": "Chip and memory supply chain",
      "issue-repair": "Single issue repair",
      "time-horizon": "Long task time horizon",
      "tool-recovery": "Tool failure recovery",
      "low-supervision": "Low-supervision execution",
      "tool-use": "Tool use maturity",
      "workflow-integration": "Workflow integration",
      "verification": "Verification infrastructure",
      "orchestration": "Autonomous orchestration",
      "public-knowledge": "Public knowledge coverage",
      "enterprise-data-readiness": "Enterprise data readiness",
      "persistent-memory": "Persistent project memory",
      "provenance": "Provenance and auditability",
      "industrial-robot-density": "Industrial robot deployment",
      "general-embodiment": "General embodied intelligence",
      "safety-certification": "Physical safety certification",
      "supply-and-cost": "Robot cost and supply readiness",
      "organizational-adoption": "Organizational AI adoption",
      "core-production-control": "Core production control",
      "roi-at-scale": "Scaled ROI evidence",
      "labor-substitution": "Labor substitution in critical workflows",
      "incident-monitoring": "Incident monitoring",
      "safety-benchmarks": "Safety benchmark maturity",
      "regulatory-readiness": "Regulatory readiness",
      "auditability": "System auditability",
    },
    moduleSummary: {
      "model-intelligence": "Frontier models are strong at language, code, and reasoning, but factuality and self-verification remain limits for world-level delegation.",
      "multimodal-content": "Image, audio, video, and document models are useful in production, but humans still drive intent, quality control, and distribution.",
      "scientific-discovery": "AI meaningfully accelerates research workflows, especially in biology and materials, but autonomous discovery loops remain early.",
      "compute-infrastructure": "Training and inference infrastructure continues to scale quickly, but power, chips, memory, and data center capacity are binding constraints.",
      "agent-execution": "Agents can complete constrained tasks, especially coding issues, but sustained autonomous execution remains fragile.",
      "tools-workflows": "Tool calling and IDE integration are mature enough for assistance, but end-to-end workflows still rely on human-owned verification.",
      "data-memory": "AI has broad public knowledge but weak durable memory, provenance, and controlled access to private operational state.",
      "robotics-physical-world": "Robotics adoption is real, but most robots are specialized automation rather than general embodied intelligence.",
      "enterprise-economy": "Enterprise use is widespread, but most value still comes from augmentation rather than AI owning core production functions.",
      "safety-governance": "Safety evaluation, incident tracking, and policy work are maturing, but the world lacks robust audit and control mechanisms for broad AI autonomy.",
    },
    moduleBottleneck: {
      "model-intelligence": "Reliability still trails benchmark performance",
      "multimodal-content": "Generation is strong, production control is still human-led",
      "scientific-discovery": "AI assists science more than it autonomously discovers",
      "compute-infrastructure": "Energy and supply chains constrain scaling",
      "agent-execution": "Long-horizon reliability remains low",
      "tools-workflows": "Verification infrastructure is uneven",
      "data-memory": "World state and enterprise memory are fragmented",
      "robotics-physical-world": "General-purpose physical autonomy is scarce",
      "enterprise-economy": "AI adoption has not become AI control",
      "safety-governance": "Governance maturity trails deployment speed",
    },
    criterionNotes: {
      "general-benchmarks": "Useful for broad technical capability, not direct autonomy.",
      "code-reasoning": "Strong but still brittle outside benchmark framing.",
      "truthfulness": "Reliability is the largest reason capability does not translate into leadership.",
      "long-context": "Large windows help, but consistent global reasoning is still uneven.",
      "image-document-understanding": "Useful for analysis workflows, less reliable for high-stakes extraction.",
      "video-audio-generation": "Creative output is impressive, but workflow control is not autonomous.",
      "content-production-control": "Adoption is broad, but humans still own editorial judgment.",
      "research-assistance": "Strong as a collaborator, weaker as an independent scientist.",
      "lab-automation-loop": "Promising systems exist, but broad reliable autonomy is not present.",
      "validation-reproducibility": "Validation remains a human-heavy bottleneck.",
      "frontier-compute": "The supply side is advancing quickly.",
      "inference-cost": "Costs are improving but remain meaningful for sustained autonomy.",
      "energy-capacity": "Power availability increasingly shapes deployment.",
      "supply-chain": "Scaling is not limited by algorithms alone.",
      "issue-repair": "Best current evidence for practical agent task completion.",
      "time-horizon": "The core metric for whether agents can work without constant supervision.",
      "tool-recovery": "Recovery depends heavily on project verification infrastructure.",
      "low-supervision": "Most real deployments still require frequent human review.",
      "tool-use": "Tool use is mainstream, but tool outcomes still need checking.",
      "workflow-integration": "Adoption exists, but deployment quality varies widely.",
      "verification": "The limiting factor is often the environment, not only the model.",
      "orchestration": "Frameworks are improving faster than production confidence.",
      "public-knowledge": "Public knowledge is abundant but not always current or grounded.",
      "enterprise-data-readiness": "Data governance remains one of the largest adoption blockers.",
      "persistent-memory": "Persistent operational memory is still a product and research frontier.",
      "provenance": "Traceability is essential for delegating high-stakes work.",
      "industrial-robot-density": "Deployment exists, but most systems are narrow.",
      "general-embodiment": "The gap between demos and reliable general robots remains large.",
      "safety-certification": "Safety certification slows broad autonomy in the physical world.",
      "supply-and-cost": "Cost and maintenance still constrain physical scale.",
      "organizational-adoption": "Adoption is no longer fringe.",
      "core-production-control": "AI is usually embedded as assistance, not final ownership.",
      "roi-at-scale": "Many organizations are still between pilot and scaled value.",
      "labor-substitution": "Substitution exists in pockets, but broad control has not shifted.",
      "incident-monitoring": "Tracking is improving, but completeness and taxonomy remain challenges.",
      "safety-benchmarks": "Benchmarks are improving but lag frontier deployment.",
      "regulatory-readiness": "Frameworks exist, but operational enforcement varies.",
      "auditability": "Auditability is not yet standard across AI workflows.",
    },
    annotations: {
      data_update: {
        title: "Snapshot regenerated",
        note: "Updated {period} from curated seed data.",
      },
      methodology_change: {
        title: "Methodology changed",
        note: "Updated methodology or scoring rules for {period}.",
      },
      source_change: {
        title: "Source changed",
        note: "Updated source mapping and retrieval method for {period}.",
      },
    },
    status: {
      manual: "manual",
      semi_automatic: "semi automatic",
      automatic: "automatic",
    },
  },
};

function localText(locale: Locale): LocaleCopy {
  return COPY[locale];
}

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";

  const stored = window.localStorage.getItem("swi-locale");
  return stored === "en" ? "en" : "zh";
}

function statusText(copy: LocaleCopy, status: keyof LocaleCopy["status"]): string {
  return copy.status[status];
}

function moduleDisplayName(
  copy: LocaleCopy,
  moduleId: string,
  fallbackName: string,
): string {
  return copy.moduleNames[moduleId] ?? fallbackName;
}

function criterionDisplayName(
  copy: LocaleCopy,
  criterionId: string,
  fallbackName: string,
): string {
  return copy.criterionNames[criterionId] ?? fallbackName;
}

function moduleSummaryText(
  copy: LocaleCopy,
  moduleId: string,
  fallbackSummary: string,
): string {
  return copy.moduleSummary[moduleId] ?? fallbackSummary;
}

function moduleBottleneckText(
  copy: LocaleCopy,
  moduleId: string,
  fallbackBottleneck: string,
): string {
  return copy.moduleBottleneck[moduleId] ?? fallbackBottleneck;
}

function criterionNotesText(
  copy: LocaleCopy,
  criterionId: string,
  fallbackNotes: string,
): string {
  return copy.criterionNotes[criterionId] ?? fallbackNotes;
}

function annotationDisplayText(
  copy: LocaleCopy,
  annotation: TrendAnnotation,
  period: string,
): { title: string; note: string } {
  const template = copy.annotations[annotation.type];
  if (!template) return { title: annotation.title, note: annotation.note };
  return {
    title: template.title,
    note: template.note.replace("{period}", period),
  };
}

const headlineMeta = [
  {
    key: "siliconWorld",
    icon: Gauge,
  },
  {
    key: "capability",
    icon: TrendingUp,
  },
  {
    key: "autonomy",
    icon: Bot,
  },
  {
    key: "governance",
    icon: ShieldAlert,
  },
] as const;

const headlineMetaKeys = [
  "siliconWorld",
  "capability",
  "autonomy",
  "governance",
] as const;

const moduleIcons = [Sparkles, Bot, GitBranch, Activity, Database, CheckCircle2];

export function App() {
  const [locale, setLocale] = useState<Locale>(getStoredLocale);
  const [data, setData] = useState<IndexDataState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [view, setView] = useState<"overview" | "trends">("overview");

  const copy = useMemo(() => localText(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en-US";
    document.title = copy.appName;
    window.localStorage.setItem("swi-locale", locale);
  }, [locale]);

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
          <h1>{copy.error.title}</h1>
          <p>
            {copy.error.suffix}
            {error}
          </p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="app-shell">
        <section className="empty-state">
          <h1>{copy.loading.title}</h1>
          <p>{copy.loading.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="toolbar-row">
        <span className="language-switch" aria-label={copy.language.label}>
          <button
            type="button"
            onClick={() => setLocale("zh")}
            className={locale === "zh" ? "active" : ""}
            aria-pressed={locale === "zh"}
          >
            {copy.language.zhLabel}
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={locale === "en" ? "active" : ""}
            aria-pressed={locale === "en"}
          >
            {copy.language.enLabel}
          </button>
        </span>
      </div>
      <Hero latest={data.latest} copy={copy} />
      <ViewTabs view={view} onChange={setView} copy={copy} />
      {view === "overview" ? (
        <>
          <HeadlineGrid latest={data.latest} copy={copy} />
          <TrendSection history={data.history} copy={copy} />
          <ModuleSection
            modules={data.latest.modules}
            selectedModule={selectedModule}
            copy={copy}
            onSelect={setSelectedModuleId}
          />
          <Methodology latest={data.latest} copy={copy} />
          <SourceTable modules={data.latest.modules} copy={copy} />
        </>
      ) : (
        <TrendsPage history={data.history} latest={data.latest} copy={copy} />
      )}
    </main>
  );
}

function ViewTabs({
  view,
  onChange,
  copy,
}: {
  view: "overview" | "trends";
  onChange: (view: "overview" | "trends") => void;
  copy: LocaleCopy;
}) {
  return (
    <nav className="view-tabs" aria-label={copy.nav.ariaLabel}>
      <button
        className={view === "overview" ? "active" : ""}
        onClick={() => onChange("overview")}
        type="button"
      >
        {copy.viewTabs.overview}
      </button>
      <button
        className={view === "trends" ? "active" : ""}
        onClick={() => onChange("trends")}
        type="button"
      >
        {copy.viewTabs.trends}
      </button>
    </nav>
  );
}

function Hero({ latest, copy }: { latest: IndexSnapshot; copy: LocaleCopy }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">{copy.hero.eyebrow}</p>
        <h1>{copy.hero.title}</h1>
        <p>{copy.hero.description}</p>
      </div>
      <div className="hero-panel">
        <div>
          <span className="panel-label">{copy.hero.latestPeriod}</span>
          <strong>{latest.metadata.period}</strong>
        </div>
        <div>
          <span className="panel-label">{copy.hero.updated}</span>
          <strong>{latest.metadata.updatedAt}</strong>
        </div>
        <div>
          <span className="panel-label">{copy.hero.methodology}</span>
          <strong>{latest.metadata.methodologyVersion}</strong>
        </div>
      </div>
    </section>
  );
}

function HeadlineGrid({ latest, copy }: { latest: IndexSnapshot; copy: LocaleCopy }) {
  return (
    <section className="score-grid" aria-label={copy.nav.overview}>
      {headlineMeta.map((item) => {
        const Icon = item.icon;
        const score = latest.headlines[item.key];
        return (
          <article className="score-card" key={item.key}>
            <div className="score-card-header">
              <Icon aria-hidden="true" size={20} />
              <span>{copy.headlines[item.key].label}</span>
            </div>
            <strong>{score.toFixed(1)}</strong>
            <p>{copy.headlines[item.key].description}</p>
          </article>
        );
      })}
    </section>
  );
}

function TrendSection({ history, copy }: { history: HistoryEntry[]; copy: LocaleCopy }) {
  const chartData = toHeadlineChartData(history);
  return (
    <section className="section two-column">
      <div>
        <p className="eyebrow">{copy.trend.eyebrow}</p>
        <h2>{copy.trend.title}</h2>
        <p>{copy.trend.description}</p>
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
  copy,
}: {
  history: HistoryEntry[];
  latest: IndexSnapshot;
  copy: LocaleCopy;
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
          <p className="eyebrow">{copy.trendsPage.eyebrow}</p>
          <h2>{copy.trendsPage.title}</h2>
          <p>{copy.trendsPage.description}</p>
        </div>
        <div className="trend-summary-grid">
          <TrendMetric label={copy.trendsPage.metricCurrentIndex} value={latest.headlines.siliconWorld} />
          <TrendMetric label={copy.trendsPage.metricMonthChange} value={headlineDelta} signed />
          <TrendMetric label={copy.trendsPage.metricTrackedModules} value={latest.modules.length} compact />
          <TrendMetric label={copy.trendsPage.metricHistoryPeriods} value={history.length} compact />
        </div>
      </section>

      <section className="section chart-panel trend-chart">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.trendsPage.chartEyebrow}</p>
            <h2>{copy.trendsPage.chartTitle}</h2>
          </div>
          <p>{copy.trendsPage.chartDescription}</p>
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
        <ModuleHeatmap history={history} copy={copy} />
        <TrendDrivers modules={topModules} criteria={drivers} copy={copy} />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.trendsPage.annotationTitle}</p>
            <h2>{copy.trendsPage.annotationHeading}</h2>
          </div>
          <p>{copy.trendsPage.annotationDescription}</p>
        </div>
        <div className="annotation-list">
          {history.flatMap((entry) =>
            entry.annotations.map((annotation) => (
              <article className="annotation-card" key={`${entry.period}-${annotation.title}`}>
                <span>{entry.period}</span>
                <h3>{annotationDisplayText(copy, annotation, entry.period).title}</h3>
                <p>{annotationDisplayText(copy, annotation, entry.period).note}</p>
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

function ModuleHeatmap({ history, copy }: { history: HistoryEntry[]; copy: LocaleCopy }) {
  const moduleIds = history[history.length - 1]?.modules.map((module) => module.id) ?? [];
  const moduleNames = new Map(
    history.flatMap((entry) => entry.modules.map((module) => [module.id, module.name] as const)),
  );

  return (
    <section className="heatmap-panel">
      <div className="panel-heading">
        <p className="eyebrow">{copy.trendsPage.modulesHeatmapTitle}</p>
        <h3>{copy.trendsPage.modulesHeatmapDescription}</h3>
      </div>
      <div className="heatmap-scroll">
        <div
          className="heatmap"
          style={{ gridTemplateColumns: `minmax(180px, 1.2fr) repeat(${history.length}, 76px)` }}
        >
          <div className="heatmap-label">{copy.criteriaMeta.module}</div>
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
              moduleName={moduleDisplayName(copy, moduleId, moduleNames.get(moduleId) ?? moduleId)}
              copy={copy}
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
  copy,
}: {
  history: HistoryEntry[];
  moduleId: string;
  moduleName: string;
  copy: LocaleCopy;
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
            title={`${moduleName}: ${module?.score.toFixed(1) ?? copy.chart.na}`}
          >
            {module?.score.toFixed(1) ?? copy.chart.na}
          </div>
        );
      })}
    </>
  );
}

function TrendDrivers({
  modules,
  criteria,
  copy,
}: {
  modules: HistoryModule[];
  criteria: HistoryCriterion[];
  copy: LocaleCopy;
}) {
  return (
    <section className="driver-panel">
      <div className="panel-heading">
        <p className="eyebrow">{copy.trendsPage.changeDriversEyebrow}</p>
        <h3>{copy.trendsPage.changeDriversTitle}</h3>
      </div>
      <div className="driver-group">
        <h4>{copy.trendsPage.modulesGroupTitle}</h4>
        {modules.map((module) => (
          <DeltaRow
            key={module.id}
            label={moduleDisplayName(copy, module.id, module.name)}
            meta={moduleBottleneckText(copy, module.id, module.bottleneck)}
            value={module.score}
            delta={module.delta}
          />
        ))}
      </div>
      <div className="driver-group">
        <h4>{copy.trendsPage.criteriaGroupTitle}</h4>
        {criteria.map((criterion) => (
          <DeltaRow
            key={`${criterion.moduleId}-${criterion.id}`}
            label={criterionDisplayName(copy, criterion.id, criterion.name)}
            meta={`${moduleDisplayName(copy, criterion.moduleId, criterion.moduleName)} ${copy.criteriaMeta.from} ${statusText(copy, criterion.sourceAutomationStatus)}`}
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
  copy,
  onSelect,
}: {
  modules: IndexModule[];
  selectedModule: IndexModule | null;
  copy: LocaleCopy;
  onSelect: (moduleId: string) => void;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.moduleSection.eyebrow}</p>
          <h2>{copy.moduleSection.title}</h2>
        </div>
        <p>{copy.moduleSection.tip}</p>
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
                <span className="module-title">{moduleDisplayName(copy, module.id, module.name)}</span>
                <strong>{module.score.toFixed(1)}</strong>
                <span className="module-meta">
                  {copy.categories[module.category]} | {copy.moduleCard.confidence}
                  {" "}
                  {Math.round(module.confidence * 100)}%
                </span>
                <span className="module-bottleneck">
                  {copy.moduleCard.bottleneckUnknown} {moduleBottleneckText(copy, module.id, module.bottleneck)}
                </span>
              </button>
            );
          })}
        </div>

        {selectedModule ? <ModuleDetail module={selectedModule} copy={copy} /> : null}
      </div>
    </section>
  );
}

function ModuleDetail({ module, copy }: { module: IndexModule; copy: LocaleCopy }) {
  return (
    <aside className="module-detail">
      <div className="detail-header">
        <div>
          <p className="eyebrow">
            {copy.moduleDetail.categoryEyebrow}: {copy.categories[module.category]}
          </p>
          <h3>{moduleDisplayName(copy, module.id, module.name)}</h3>
        </div>
        <strong>{module.score.toFixed(1)}</strong>
      </div>
      <p>{moduleSummaryText(copy, module.id, module.summary)}</p>
      <div className="criteria-list">
        {module.criteria.map((criterion) => (
          <CriterionRow criterion={criterion} copy={copy} key={criterion.id} />
        ))}
      </div>
    </aside>
  );
}

function CriterionRow({ criterion, copy }: { criterion: Criterion; copy: LocaleCopy }) {
  return (
      <details className="criterion">
      <summary>
          <span>{criterionDisplayName(copy, criterion.id, criterion.name)}</span>
        <strong>{criterion.score.toFixed(1)}</strong>
      </summary>
      <dl>
        <div>
          <dt>{copy.moduleDetail.weight}</dt>
          <dd>{Math.round(criterion.weight * 100)}%</dd>
        </div>
        <div>
          <dt>{copy.moduleDetail.confidence}</dt>
          <dd>{Math.round(criterion.confidence * 100)}%</dd>
        </div>
        <div>
          <dt>{copy.moduleDetail.automation}</dt>
          <dd>{statusText(copy, criterion.source.automationStatus)}</dd>
        </div>
        <div>
          <dt>{copy.moduleDetail.source}</dt>
          <dd>
            <a href={criterion.source.url} target="_blank" rel="noreferrer">
              {criterion.source.label}
            </a>
          </dd>
        </div>
      </dl>
      <p>{criterionNotesText(copy, criterion.id, criterion.notes)}</p>
    </details>
  );
}

function Methodology({ latest, copy }: { latest: IndexSnapshot; copy: LocaleCopy }) {
  return (
    <section className="section methodology">
      <div>
        <p className="eyebrow">{copy.methodology.eyebrow}</p>
        <h2>{copy.methodology.title}</h2>
      </div>
      <div className="method-grid">
        <MethodCard
          title={copy.methodology.capabilityLabel}
          weight={latest.headlineWeights.capability}
          body={copy.methodology.capabilityBody}
          weightLabel={copy.methodology.weightLabel}
        />
        <MethodCard
          title={copy.methodology.autonomyLabel}
          weight={latest.headlineWeights.autonomy}
          body={copy.methodology.autonomyBody}
          weightLabel={copy.methodology.weightLabel}
        />
        <MethodCard
          title={copy.methodology.governanceLabel}
          weight={latest.headlineWeights.governance}
          body={copy.methodology.governanceBody}
          weightLabel={copy.methodology.weightLabel}
        />
      </div>
    </section>
  );
}

function MethodCard({
  title,
  weight,
  body,
  weightLabel,
}: {
  title: string;
  weight: number;
  body: string;
  weightLabel: string;
}) {
  return (
    <article className="method-card">
      <span>
        {Math.round(weight * 100)}% {weightLabel}
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function SourceTable({ modules, copy }: { modules: IndexModule[]; copy: LocaleCopy }) {
  const sources = modules.flatMap((module) =>
    module.criteria.map((criterion) => ({
      module: moduleDisplayName(copy, module.id, module.name),
      ...criterion,
      criterion: criterionDisplayName(copy, criterion.id, criterion.name),
      ...criterion.source,
    })),
  );

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.sources.eyebrow}</p>
          <h2>{copy.sources.title}</h2>
        </div>
        <p>{copy.sources.description}</p>
      </div>
      <div className="source-table-wrap">
        <table className="source-table">
          <thead>
            <tr>
              <th>{copy.sources.module}</th>
              <th>{copy.sources.criterion}</th>
              <th>{copy.sources.source}</th>
              <th>{copy.sources.status}</th>
              <th>{copy.sources.accessed}</th>
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
                <td>{statusText(copy, source.automationStatus)}</td>
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
