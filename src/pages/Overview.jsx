import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Users, 
  ThumbsUp, 
  Target,
  Clock
} from 'lucide-react';
import { COLORS } from '../App';
import { Card, Badge, PageHeader } from '../components/ui';

// Import data
import rewriterData from '../data.json';
import adoptionData from '../adoption.json';
import feedbackData from '../feedback.json';

const Overview = () => {
  const { summary } = rewriterData;
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard Overview"
        subtitle="Key metrics across all Nexus analytics"
        icon={LayoutDashboard}
        badge={
          <Badge>
            <Clock size={12} />
            Updated: {new Date().toLocaleDateString()}
          </Badge>
        }
      />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card delay={100}>
          <div className="text-center">
            <p className="text-sm" style={{ color: COLORS.textMuted }}>Total Queries</p>
            <p className="text-3xl font-bold mt-1" style={{ color: COLORS.textPrimary }}>
              {adoptionData.totalQueries?.toLocaleString() || 0}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>Production</p>
          </div>
        </Card>
        
        <Card delay={150}>
          <div className="text-center">
            <p className="text-sm" style={{ color: COLORS.textMuted }}>Active Users</p>
            <p className="text-3xl font-bold mt-1" style={{ color: COLORS.cyan }}>
              {adoptionData.mau || 0}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>Monthly</p>
          </div>
        </Card>
        
        <Card delay={200}>
          <div className="text-center">
            <p className="text-sm" style={{ color: COLORS.textMuted }}>Feedback</p>
            <p className="text-3xl font-bold mt-1" style={{ color: COLORS.green }}>
              {feedbackData.summary?.positiveRate || 0}%
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>Positive</p>
          </div>
        </Card>
        
        <Card delay={250}>
          <div className="text-center">
            <p className="text-sm" style={{ color: COLORS.textMuted }}>Rewrite Rate</p>
            <p className="text-3xl font-bold mt-1" style={{ color: COLORS.purple }}>
              {summary?.rewriteRate || 0}%
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>Queries expanded</p>
          </div>
        </Card>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Query Rewriter Section */}
        <Card delay={300}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} style={{ color: COLORS.purple }} />
            <h3 className="font-semibold" style={{ color: COLORS.textPrimary }}>Query Rewriter</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Total Processed</span>
              <span className="font-bold" style={{ color: COLORS.textPrimary }}>{summary?.totalQueries || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Rewritten</span>
              <span className="font-bold" style={{ color: COLORS.cyan }}>{summary?.rewrittenCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Pass-through</span>
              <span className="font-bold" style={{ color: COLORS.orange }}>{summary?.passthroughCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Avg Latency</span>
              <Badge variant="success">
                {rewriterData.latencyStats?.avg || 0}ms
              </Badge>
            </div>
          </div>
        </Card>

        {/* Adoption Section */}
        <Card delay={400}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} style={{ color: COLORS.cyan }} />
            <h3 className="font-semibold" style={{ color: COLORS.textPrimary }}>Adoption</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>WAU</span>
              <span className="font-bold" style={{ color: COLORS.textPrimary }}>{adoptionData.wau || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>MAU</span>
              <span className="font-bold" style={{ color: COLORS.textPrimary }}>{adoptionData.mau || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Stickiness</span>
              <Badge variant={adoptionData.stickiness > 25 ? 'success' : 'warning'}>
                {adoptionData.stickiness || 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Queries/User</span>
              <span className="font-bold" style={{ color: COLORS.cyan }}>{adoptionData.queriesPerUser || 0}</span>
            </div>
          </div>
        </Card>

        {/* Feedback Section */}
        <Card delay={500}>
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp size={20} style={{ color: COLORS.green }} />
            <h3 className="font-semibold" style={{ color: COLORS.textPrimary }}>Feedback</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Total</span>
              <span className="font-bold" style={{ color: COLORS.textPrimary }}>{feedbackData.summary?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Thumbs Up</span>
              <span className="font-bold" style={{ color: COLORS.green }}>{feedbackData.summary?.thumbsUp || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Thumbs Down</span>
              <span className="font-bold" style={{ color: COLORS.red }}>{feedbackData.summary?.thumbsDown || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: COLORS.textMuted }}>Positive Rate</span>
              <Badge variant={feedbackData.summary?.positiveRate > 50 ? 'success' : 'danger'}>
                {feedbackData.summary?.positiveRate || 0}%
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <Card delay={600}>
        <h3 className="font-semibold mb-4" style={{ color: COLORS.textPrimary }}>Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="/rewriter"
            className="p-4 rounded-lg text-center transition-all hover:scale-105"
            style={{ background: 'rgba(124, 58, 237, 0.1)' }}
          >
            <Sparkles size={24} className="mx-auto mb-2" style={{ color: COLORS.purple }} />
            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Query Rewriter</p>
          </a>
          
          <a 
            href="/adoption"
            className="p-4 rounded-lg text-center transition-all hover:scale-105"
            style={{ background: 'rgba(45, 212, 191, 0.1)' }}
          >
            <Users size={24} className="mx-auto mb-2" style={{ color: COLORS.cyan }} />
            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Adoption</p>
          </a>
          
          <a 
            href="/feedback"
            className="p-4 rounded-lg text-center transition-all hover:scale-105"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <ThumbsUp size={24} className="mx-auto mb-2" style={{ color: COLORS.green }} />
            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Feedback</p>
          </a>
          
          <a 
            href="/content-health"
            className="p-4 rounded-lg text-center transition-all hover:scale-105"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <Target size={24} className="mx-auto mb-2" style={{ color: COLORS.red }} />
            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Content Health</p>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Overview;
