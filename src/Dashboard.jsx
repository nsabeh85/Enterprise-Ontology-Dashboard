import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Target,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowUpRight,
  Sparkles,
  FlaskConical,
  Info,
  Award,
  Activity,        // NEW
  UserCheck,       // NEW
  BarChart3,       // NEW
  Calendar,        // NEW
} from 'lucide-react';

// Import data from JSON files
import data from './data.json';
import adoptionData from './adoption.json';

// Color palette
const COLORS = {
  purple: 'oklch(0.488 0.243 264.376)',
  cyan: 'oklch(0.696 0.17 162.48)',
  orange: 'oklch(0.769 0.188 70.08)',
  pink: 'oklch(0.627 0.265 303.9)',
  red: 'oklch(0.645 0.246 16.439)',
  green: 'oklch(0.723 0.219 142.18)',
  background: '#0f0f1a',
  surface: '#1a1a2e',
  textPrimary: '#fafafa',
  textMuted: '#9ca3af',
};

// Tooltip descriptions
const TOOLTIPS = {
  totalQueries: "Number of unique, valid queries analyzed in the A/B test after removing duplicates.",
  treatmentGroup: "Queries processed through the Query Optimizer with entity matching and synonym expansion.",
  controlGroup: "Queries processed without the Query Optimizer, using original search behavior. Serves as the baseline for comparison.",
  avgLatency: "Average time for the Query Optimizer to process and expand a query.",
  zeroResultRate: "Percentage of queries that returned zero search results. Lower is better.",
  avgResults: "Mean number of documents returned by search. Higher indicates better recall.",
  latencyMin: "Fastest query processing time recorded.",
  latencyMax: "Slowest query processing time recorded.",
  latencyAvg: "Mean processing time across all treatment queries.",
  latencyP95: "95th percentile latency. 95% of queries complete faster than this value.",
  treatmentDetails: "Queries processed through the Query Optimizer, showing matched entities, expansion count, processing time, and results.",
  zeroResultQueries: "Queries that returned no results, indicating content gaps in the ontology.",
  headToHead: "Same query tested in both groups to show direct impact of Query Optimizer.",
  entityMatch: "Frequency of ontology entities detected across treatment queries.",
  evaluationScores: "LLM-as-judge scores (1-5 scale) evaluating answer quality. Higher is better.",
};

// Color array for entity chart
const ENTITY_COLORS = [COLORS.purple, COLORS.cyan, COLORS.orange, COLORS.pink, COLORS.red];

// Transform data for charts
const zeroResultData = [
  { name: 'Treatment', rate: data.zeroResultRates.treatment, fill: COLORS.cyan },
  { name: 'Control', rate: data.zeroResultRates.control, fill: COLORS.red },
];

const avgResultData = [
  { name: 'Treatment', results: data.avgResultCounts.treatment, fill: COLORS.cyan },
  { name: 'Control', results: data.avgResultCounts.control, fill: COLORS.purple },
];

const entityMatchData = data.entityMatchSummary.map((item, index) => ({
  name: item.entity,
  value: item.count,
  fill: ENTITY_COLORS[index % ENTITY_COLORS.length],
}));

// Info Tooltip Component
const InfoTooltip = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-flex items-center">
      <button
        className="p-1 rounded-full transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="More information"
      >
        <Info size={14} style={{ color: COLORS.textMuted }} />
      </button>
      {isVisible && (
        <div 
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none"
          style={{ minWidth: '280px', maxWidth: '280px' }}
        >
          <div
            className="px-3 py-2 rounded-md text-xs leading-relaxed"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#fafafa',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            }}
          >
            {text}
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(0, 0, 0, 0.9)',
            }}
          />
        </div>
      )}
    </div>
  );
};

// Title with Info Component
const TitleWithInfo = ({ children, tooltip, className = '', as: Tag = 'h3' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Tag className="text-xl font-semibold" style={{ color: COLORS.textPrimary }}>
      {children}
    </Tag>
    <InfoTooltip text={tooltip} />
  </div>
);

// Custom Chart Tooltip
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 rounded-lg border border-white/10" style={{ background: COLORS.surface }}>
        <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color || COLORS.textMuted }}>
            {entry.name}: {entry.value}{entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Card Component
const Card = ({ children, className = '', delay = 0 }) => (
  <div
    className={`px-6 py-6 rounded-lg border border-white/10 opacity-0 animate-fade-in-up ${className}`}
    style={{
      background: COLORS.surface,
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
      animationDelay: `${delay}ms`,
      animationFillMode: 'forwards',
    }}
  >
    {children}
  </div>
);

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendLabel, delay = 0, tooltip }) => (
  <Card delay={delay}>
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>{title}</p>
          <InfoTooltip text={tooltip} />
        </div>
        <p className="text-4xl font-extrabold tracking-tight mt-2" style={{ color: COLORS.textPrimary }}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>{subtitle}</p>
        )}
        {trend && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ 
              background: trend === 'positive' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: trend === 'positive' ? '#22c55e' : '#ef4444',
            }}>
            {trend === 'positive' ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
            {trendLabel}
          </div>
        )}
      </div>
      <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <Icon size={24} style={{ color: COLORS.purple }} />
      </div>
    </div>
  </Card>
);

// Badge Component
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { bg: 'rgba(255,255,255,0.1)', color: COLORS.textPrimary },
    success: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    warning: { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' },
    danger: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
    info: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  };
  
  return (
    <span 
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={variants[variant]}
    >
      {children}
    </span>
  );
};

// Latency Stat Card Component
const LatencyStatCard = ({ label, value, unit, color, tooltip }) => (
  <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
    <div className="flex items-center justify-center gap-1.5">
      <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>{label}</p>
      <InfoTooltip text={tooltip} />
    </div>
    <p className="text-3xl font-extrabold tracking-tight mt-2" style={{ color }}>
      {value}<span className="text-lg font-normal">{unit}</span>
    </p>
  </div>
);

// Score Bar Component for Evaluation Scores
const ScoreBar = ({ score, maxScore = 5, color }) => {
  const percentage = (score / maxScore) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
      <span className="text-sm font-bold w-10 text-right" style={{ color }}>{score}</span>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  // Calculate derived values
  const { summary, latencyStats, headToHead, metadata, treatmentQueries, zeroResultQueries, avgResultCounts, evaluationScores } = data;
  const latencyPercentOfTarget = ((latencyStats.max / latencyStats.target) * 100).toFixed(2);
  const queriesUnderTarget = Math.round((1 - latencyStats.max / latencyStats.target) * 100);
  const resultsDifference = headToHead.treatment.resultCount - headToHead.control.resultCount;

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-10" style={{ background: COLORS.background }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
       {/* Header */}
<header className="opacity-0 animate-fade-in-up text-center" style={{ animationFillMode: 'forwards' }}>

  {/* Icon + Main Title */}
  <div className="flex flex-col items-center mb-4">
    <div
      className="p-3 rounded-lg animate-pulse-glow mb-3"
      style={{ background: 'rgba(124, 58, 237, 0.2)' }}
    >
      <FlaskConical size={36} style={{ color: COLORS.purple }} />
    </div>

    <h1
      className="text-5xl font-extrabold tracking-tight"
      style={{ color: COLORS.textPrimary }}
    >
      Nexus Ontology Rewriter Monitor
    </h1>
  </div>

  {/* Phase + Date */}
  <div className="flex flex-wrap justify-center items-center gap-4 mt-3">
    <h2
      className="text-2xl font-semibold"
      style={{ color: COLORS.textMuted }}
    >
      {metadata.phase}
    </h2>

    <Badge>
      <Clock size={12} />
      {metadata.testPeriod}
    </Badge>
  </div>
</header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Queries"
            value={summary.totalQueries}
            subtitle="This measurement period"
            icon={Search}
            delay={100}
            tooltip={TOOLTIPS.totalQueries}
          />
          <KPICard
            title="Treatment Group"
            value={summary.treatmentCount}
            subtitle={`${summary.treatmentPercentage}% of queries`}
            icon={FlaskConical}
            delay={200}
            tooltip={TOOLTIPS.treatmentGroup}
          />
          <KPICard
            title="Control Group"
            value={summary.controlCount}
            subtitle={`${summary.controlPercentage}% of queries`}
            icon={Users}
            delay={300}
            tooltip={TOOLTIPS.controlGroup}
          />
          <KPICard
            title="Avg Latency"
            value={`${summary.avgLatencyMs}ms`}
            icon={Zap}
            trend="positive"
            trendLabel={`${queriesUnderTarget}% under ${summary.targetLatencyMs}ms target`}
            delay={400}
            tooltip={TOOLTIPS.avgLatency}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zero-Result Rate Chart */}
          <Card delay={500}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <TitleWithInfo tooltip={TOOLTIPS.zeroResultRate}>
                  Zero-Result Rate by Group
                </TitleWithInfo>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  Percentage of queries returning no results
                </p>
              </div>
              <Badge variant="success">
                <CheckCircle2 size={12} />
                Treatment: {data.zeroResultRates.treatment}%
              </Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zeroResultData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    type="number" 
                    domain={[0, 20]} 
                    tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar 
                    dataKey="rate" 
                    radius={[0, 6, 6, 0]}
                    label={{ 
                      position: 'right', 
                      fill: COLORS.textPrimary,
                      fontSize: 14,
                      fontWeight: 600,
                      formatter: (v) => `${v}%`
                    }}
                  >
                    {zeroResultData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Average Result Count Chart */}
          <Card delay={600}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <TitleWithInfo tooltip={TOOLTIPS.avgResults}>
                  Average Results per Query
                </TitleWithInfo>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  Mean number of search results returned
                </p>
              </div>
              <Badge variant="success">
                <ArrowUpRight size={12} />
                +{avgResultCounts.improvementPercent}% improvement
              </Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgResultData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    type="number" 
                    domain={[0, 40]} 
                    tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar 
                    dataKey="results" 
                    radius={[0, 6, 6, 0]}
                    label={{ 
                      position: 'right', 
                      fill: COLORS.textPrimary,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {avgResultData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Latency Stats */}
        <Card delay={700}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold" style={{ color: COLORS.textPrimary }}>
                  Query Rewrite Latency
                </h3>
              </div>
              <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                Time to process and expand queries through the optimizer
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Badge variant="success">
                <CheckCircle2 size={12} />
                All under {latencyStats.target}ms target
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
            <LatencyStatCard
              label="Minimum"
              value={latencyStats.min}
              unit="ms"
              color={COLORS.cyan}
              tooltip={TOOLTIPS.latencyMin}
            />
            <LatencyStatCard
              label="Maximum"
              value={latencyStats.max}
              unit="ms"
              color={COLORS.orange}
              tooltip={TOOLTIPS.latencyMax}
            />
            <LatencyStatCard
              label="Average"
              value={latencyStats.avg}
              unit="ms"
              color={COLORS.purple}
              tooltip={TOOLTIPS.latencyAvg}
            />
            <LatencyStatCard
              label="p95"
              value={`~${latencyStats.p95}`}
              unit="ms"
              color={COLORS.pink}
              tooltip={TOOLTIPS.latencyP95}
            />
          </div>

          {/* Target comparison bar */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Performance vs Target</span>
              <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>{latencyStats.max}ms / {latencyStats.target}ms</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${latencyPercentOfTarget}%`,
                  background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.purple})`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: COLORS.textMuted }}>0ms</span>
              <span className="text-xs" style={{ color: COLORS.cyan }}>Max: {latencyStats.max}ms ({latencyPercentOfTarget}% of target)</span>
              <span className="text-xs" style={{ color: COLORS.textMuted }}>{latencyStats.target}ms target</span>
            </div>
          </div>
        </Card>

        {/* Evaluation Scores - NEW SECTION */}
        <Card delay={750}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <TitleWithInfo tooltip={TOOLTIPS.evaluationScores}>
                Answer Quality Scores
              </TitleWithInfo>
              <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                LLM-as-judge evaluation (1-5 scale)
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Award size={24} style={{ color: COLORS.orange }} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Relevance */}
            <div className="p-5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h4 className="text-sm font-medium mb-1" style={{ color: COLORS.textMuted }}>Relevance</h4>
              <p className="text-xs mb-4" style={{ color: COLORS.textMuted }}>Does the answer address the query?</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: COLORS.cyan }}>Treatment</span>
                    <span className="text-lg font-bold" style={{ color: COLORS.cyan }}>
                      {evaluationScores?.treatment?.relevance || 0}
                    </span>
                  </div>
                  <ScoreBar score={evaluationScores?.treatment?.relevance || 0} color={COLORS.cyan} />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: COLORS.purple }}>Control</span>
                    <span className="text-lg font-bold" style={{ color: COLORS.purple }}>
                      {evaluationScores?.control?.relevance || 0}
                    </span>
                  </div>
                  <ScoreBar score={evaluationScores?.control?.relevance || 0} color={COLORS.purple} />
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <span 
                  className="text-sm font-semibold"
                  style={{ 
                    color: (evaluationScores?.treatment?.relevance || 0) >= (evaluationScores?.control?.relevance || 0) 
                      ? '#22c55e' : COLORS.red 
                  }}
                >
                  {((evaluationScores?.treatment?.relevance || 0) - (evaluationScores?.control?.relevance || 0)).toFixed(2) > 0 ? '+' : ''}
                  {((evaluationScores?.treatment?.relevance || 0) - (evaluationScores?.control?.relevance || 0)).toFixed(2)} difference
                </span>
              </div>
            </div>

            {/* Groundedness */}
            <div className="p-5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h4 className="text-sm font-medium mb-1" style={{ color: COLORS.textMuted }}>Groundedness</h4>
              <p className="text-xs mb-4" style={{ color: COLORS.textMuted }}>Is answer based on retrieved docs?</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: COLORS.cyan }}>Treatment</span>
                    <span className="text-lg font-bold" style={{ color: COLORS.cyan }}>
                      {evaluationScores?.treatment?.groundedness || 0}
                    </span>
                  </div>
                  <ScoreBar score={evaluationScores?.treatment?.groundedness || 0} color={COLORS.cyan} />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: COLORS.purple }}>Control</span>
                    <span className="text-lg font-bold" style={{ color: COLORS.purple }}>
                      {evaluationScores?.control?.groundedness || 0}
                    </span>
                  </div>
                  <ScoreBar score={evaluationScores?.control?.groundedness || 0} color={COLORS.purple} />
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <span 
                  className="text-sm font-semibold"
                  style={{ 
                    color: (evaluationScores?.treatment?.groundedness || 0) >= (evaluationScores?.control?.groundedness || 0) 
                      ? '#22c55e' : COLORS.red 
                  }}
                >
                  {((evaluationScores?.treatment?.groundedness || 0) - (evaluationScores?.control?.groundedness || 0)).toFixed(2) > 0 ? '+' : ''}
                  {((evaluationScores?.treatment?.groundedness || 0) - (evaluationScores?.control?.groundedness || 0)).toFixed(2)} difference
                </span>
              </div>
            </div>

            {/* Completeness */}
            <div className="p-5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h4 className="text-sm font-medium mb-1" style={{ color: COLORS.textMuted }}>Completeness</h4>
              <p className="text-xs mb-4" style={{ color: COLORS.textMuted }}>Is the answer thorough enough?</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: COLORS.cyan }}>Treatment</span>
                    <span className="text-lg font-bold" style={{ color: COLORS.cyan }}>
                      {evaluationScores?.treatment?.completeness || 0}
                    </span>
                  </div>
                  <ScoreBar score={evaluationScores?.treatment?.completeness || 0} color={COLORS.cyan} />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: COLORS.purple }}>Control</span>
                    <span className="text-lg font-bold" style={{ color: COLORS.purple }}>
                      {evaluationScores?.control?.completeness || 0}
                    </span>
                  </div>
                  <ScoreBar score={evaluationScores?.control?.completeness || 0} color={COLORS.purple} />
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <span 
                  className="text-sm font-semibold"
                  style={{ 
                    color: (evaluationScores?.treatment?.completeness || 0) >= (evaluationScores?.control?.completeness || 0) 
                      ? '#22c55e' : COLORS.red 
                  }}
                >
                  {((evaluationScores?.treatment?.completeness || 0) - (evaluationScores?.control?.completeness || 0)).toFixed(2) > 0 ? '+' : ''}
                  {((evaluationScores?.treatment?.completeness || 0) - (evaluationScores?.control?.completeness || 0)).toFixed(2)} difference
                </span>
              </div>
            </div>
          </div>

          {/* Summary Banner */}
          <div 
            className="mt-6 p-4 rounded-lg flex items-center justify-center gap-3"
            style={{ 
              background: `linear-gradient(90deg, ${COLORS.orange}20, ${COLORS.pink}20)`,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Award size={20} style={{ color: COLORS.orange }} />
            <span className="font-semibold" style={{ color: COLORS.textPrimary }}>
              Treatment group shows <span style={{ color: COLORS.cyan }}>+{((
                ((evaluationScores?.treatment?.relevance || 0) - (evaluationScores?.control?.relevance || 0)) +
                ((evaluationScores?.treatment?.groundedness || 0) - (evaluationScores?.control?.groundedness || 0)) +
                ((evaluationScores?.treatment?.completeness || 0) - (evaluationScores?.control?.completeness || 0))
              ) / 3).toFixed(2)} average improvement</span> across all quality metrics
            </span>
          </div>
        </Card>

        {/* Treatment Group Details Table */}
        <Card delay={800}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <TitleWithInfo tooltip={TOOLTIPS.treatmentDetails}>
                Treatment Group Details
              </TitleWithInfo>
              <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                All {treatmentQueries.length} queries processed through the Query Optimizer
              </p>
            </div>
            <Badge>
              <Sparkles size={12} />
              100% success rate
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: COLORS.textMuted }}>Query</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: COLORS.textMuted }}>Matched Entities</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: COLORS.textMuted }}>Expansions</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: COLORS.textMuted }}>Time (ms)</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: COLORS.textMuted }}>Results</th>
                </tr>
              </thead>
              <tbody>
                {treatmentQueries.map((row, index) => (
                  <tr 
                    key={row.id || index} 
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium" style={{ color: COLORS.textPrimary }}>{row.query}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {row.matchedEntities.map((entity, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ 
                              background: 'rgba(124, 58, 237, 0.2)',
                              color: COLORS.purple,
                            }}
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-sm" style={{ color: COLORS.textPrimary }}>{row.expansionCount}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span 
                        className="font-mono text-sm px-2 py-1 rounded"
                        style={{ 
                          background: row.rewriteTimeMs < 1 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                          color: row.rewriteTimeMs < 1 ? '#22c55e' : '#eab308',
                        }}
                      >
                        {row.rewriteTimeMs.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span 
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${COLORS.cyan}33, ${COLORS.purple}33)`,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {row.resultCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Gaps Table */}
          <Card delay={900}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <TitleWithInfo tooltip={TOOLTIPS.zeroResultQueries}>
                  Zero-Result Queries
                </TitleWithInfo>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  Content gaps identified in control group
                </p>
              </div>
              <Badge variant="warning">
                <AlertTriangle size={12} />
                {zeroResultQueries.length} gaps found
              </Badge>
            </div>
            
            <div className="space-y-3">
              {zeroResultQueries.map((gap, index) => (
                <div 
                  key={gap.id || index}
                  className="p-4 rounded-lg border border-white/5 transition-colors hover:border-white/10"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded mt-0.5" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                      <XCircle size={14} style={{ color: COLORS.red }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: COLORS.textPrimary }}>
                        {gap.query}
                      </p>
                      <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                        {gap.rootCause}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium" style={{ color: COLORS.cyan }}>
                        <Target size={12} />
                        {gap.recommendedFix}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Head-to-Head Comparison */}
          <Card delay={1000}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <TitleWithInfo tooltip={TOOLTIPS.headToHead}>
                  Head-to-Head Comparison
                </TitleWithInfo>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  Same query: "{headToHead.query}"
                </p>
              </div>
              <Badge variant="success">
                <ArrowUpRight size={12} />
                +{headToHead.improvement}% improvement
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Treatment Side */}
              <div 
                className="p-5 rounded-lg border-2 transition-all hover:scale-[1.02]"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.cyan}10, ${COLORS.purple}10)`,
                  borderColor: COLORS.cyan,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FlaskConical size={18} style={{ color: COLORS.cyan }} />
                  <span className="font-semibold" style={{ color: COLORS.cyan }}>Treatment</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm" style={{ color: COLORS.textMuted }}>Results</p>
                    <p className="text-3xl font-extrabold tracking-tight" style={{ color: COLORS.textPrimary }}>{headToHead.treatment.resultCount}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-2" style={{ color: COLORS.textMuted }}>Entities Matched</p>
                    <div className="flex flex-wrap gap-1">
                      {headToHead.treatment.entitiesMatched.map((entity, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ 
                            background: 'rgba(45, 212, 191, 0.2)',
                            color: COLORS.cyan,
                          }}
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm mb-1" style={{ color: COLORS.textMuted }}>Expanded Query</p>
                    <p 
                      className="text-xs font-mono p-2 rounded break-words"
                      style={{ background: 'rgba(0,0,0,0.3)', color: COLORS.textMuted }}
                    >
                      {headToHead.treatment.expandedQuery}
                    </p>
                  </div>
                </div>
              </div>

              {/* Control Side */}
              <div 
                className="p-5 rounded-lg border transition-all"
                style={{ 
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} style={{ color: COLORS.textMuted }} />
                  <span className="font-semibold" style={{ color: COLORS.textMuted }}>Control</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm" style={{ color: COLORS.textMuted }}>Results</p>
                    <p className="text-3xl font-extrabold tracking-tight" style={{ color: COLORS.textPrimary }}>{headToHead.control.resultCount}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-2" style={{ color: COLORS.textMuted }}>Entities Matched</p>
                    {headToHead.control.entitiesMatched.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {headToHead.control.entitiesMatched.map((entity, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ 
                              background: 'rgba(45, 212, 191, 0.2)',
                              color: COLORS.cyan,
                            }}
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: COLORS.red,
                        }}
                      >
                        {headToHead.control.entitiesMatched.length} entities
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm mb-1" style={{ color: COLORS.textMuted }}>Original Query</p>
                    <p 
                      className="text-xs font-mono p-2 rounded"
                      style={{ background: 'rgba(0,0,0,0.3)', color: COLORS.textMuted }}
                    >
                      {headToHead.control.originalQuery}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Banner */}
            <div 
              className="mt-6 p-4 rounded-lg flex items-center justify-center gap-3"
              style={{ 
                background: `linear-gradient(90deg, ${COLORS.cyan}20, ${COLORS.purple}20)`,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <TrendingUp size={20} style={{ color: COLORS.cyan }} />
              <span className="font-semibold" style={{ color: COLORS.textPrimary }}>
                Query Optimizer delivered <span style={{ color: COLORS.cyan }}>+{resultsDifference} additional results</span> (+{headToHead.improvement}%)
              </span>
            </div>
          </Card>
        </div>

        {/* Entity Match Summary */}
        <Card delay={1100}>
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="lg:w-1/3">
              <TitleWithInfo tooltip={TOOLTIPS.entityMatch}>
                Entity Match Summary
              </TitleWithInfo>
              <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                Frequency of matched entities across treatment queries
              </p>
              
              <div className="mt-6 space-y-3">
                {entityMatchData.map((entity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ background: entity.fill }}
                    />
                    <span className="text-sm flex-1" style={{ color: COLORS.textMuted }}>
                      {entity.name}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      {entity.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-2/3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entityMatchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {entityMatchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
{/* ============================================== */}
        {/* ADOPTION METRICS SECTION */}
        {/* ============================================== */}

        <div className="mt-12 pt-8 border-t border-white/10">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Activity size={28} style={{ color: COLORS.orange }} />
              <h2 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Adoption & Engagement
              </h2>
            </div>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              Production usage metrics from {adoptionData.totalQueries.toLocaleString()} total queries
            </p>
          </header>

          {/* Adoption KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Weekly Active Users"
              value={adoptionData.wau}
              subtitle="Last 7 days"
              icon={UserCheck}
              delay={1300}
              tooltip="Unique users who queried Nexus in the past 7 days."
            />
            <KPICard
              title="Monthly Active Users"
              value={adoptionData.mau}
              subtitle="Last 30 days"
              icon={Users}
              delay={1400}
              tooltip="Unique users who queried Nexus in the past 30 days."
            />
            <KPICard
              title="Stickiness"
              value={`${adoptionData.stickiness}%`}
              subtitle="WAU / MAU ratio"
              icon={Target}
              trend={adoptionData.stickiness > 25 ? 'positive' : 'negative'}
              trendLabel={adoptionData.stickiness > 25 ? 'Above 25% target' : 'Below 25% target'}
              delay={1500}
              tooltip="Percentage of monthly users who return weekly. Higher = more engaged users."
            />
            <KPICard
              title="Queries per User"
              value={adoptionData.queriesPerUser}
              subtitle={`${adoptionData.totalUsers.toLocaleString()} total users`}
              icon={BarChart3}
              delay={1600}
              tooltip="Average number of queries per unique user."
            />
          </div>

          {/* Query Trend Chart */}
          <Card delay={1700}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold" style={{ color: COLORS.textPrimary }}>
                  Daily Query Volume
                </h3>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  Last 30 days of production usage
                </p>
              </div>
              <Badge>
                <Calendar size={12} />
                Peak hour: {adoptionData.peakHour}:00
              </Badge>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adoptionData.queryTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: COLORS.textMuted, fontSize: 10 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: COLORS.surface, 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: COLORS.textPrimary }}
                    itemStyle={{ color: COLORS.cyan }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill={COLORS.cyan}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bottom Row: Response Time + Top Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* Response Time Card */}
            <Card delay={1800}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: COLORS.textPrimary }}>
                    Average Response Time
                  </h3>
                  <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                    LLM generation latency
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Clock size={24} style={{ color: COLORS.orange }} />
                </div>
              </div>
              
              <div className="text-center py-8">
                <p className="text-5xl font-extrabold tracking-tight" style={{ color: COLORS.textPrimary }}>
                  {(adoptionData.avgResponseTimeMs / 1000).toFixed(1)}
                  <span className="text-2xl font-normal" style={{ color: COLORS.textMuted }}>s</span>
                </p>
                <p className="text-sm mt-2" style={{ color: COLORS.textMuted }}>
                  {adoptionData.avgResponseTimeMs.toLocaleString()}ms average
                </p>
              </div>
              
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: COLORS.textMuted }}>Performance</span>
                  <Badge variant={adoptionData.avgResponseTimeMs < 10000 ? 'success' : 'warning'}>
                    {adoptionData.avgResponseTimeMs < 10000 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Top Users Card */}
            <Card delay={1900}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: COLORS.textPrimary }}>
                    Top Users
                  </h3>
                  <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                    Most active users by query count
                  </p>
                </div>
                <Badge>
                  <Users size={12} />
                  {adoptionData.totalUsers.toLocaleString()} total
                </Badge>
              </div>
              
              <div className="space-y-3">
                {adoptionData.topUsers.slice(0, 5).map((user, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ 
                          background: index === 0 ? COLORS.orange : index === 1 ? COLORS.cyan : 'rgba(255,255,255,0.1)',
                          color: COLORS.textPrimary,
                        }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-mono text-sm" style={{ color: COLORS.textPrimary }}>
                        {user.user}
                      </span>
                    </div>
                    <span className="font-semibold" style={{ color: COLORS.cyan }}>
                      {user.queries.toLocaleString()} queries
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ============================================== */}
        {/* END ADOPTION METRICS SECTION */}
        {/* ============================================== */}

        
        {/* Footer */}
        <footer 
          className="text-center py-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '1200ms', animationFillMode: 'forwards' }}
        >
          <p className="text-sm" style={{ color: COLORS.textMuted }}>
           
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
