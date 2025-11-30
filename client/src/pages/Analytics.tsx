import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, BarChart3, Clock, Download, Zap, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface AnalyticsStats {
  totalTransformations: number;
  successfulTransformations: number;
  totalDownloads: number;
  avgProcessingTimeMs: number;
  flashCount: number;
  proCount: number;
  todayTransformations: number;
  weekTransformations: number;
}

export default function Analytics() {
  const { data: stats, isLoading, error } = useQuery<AnalyticsStats>({
    queryKey: ["analytics-stats"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/stats");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const modelData = stats ? [
    { name: "Flash", value: stats.flashCount, fill: "#f59e0b" },
    { name: "Pro", value: stats.proCount, fill: "#8b5cf6" },
  ].filter(d => d.value > 0) : [];

  const timelineData = stats ? [
    { name: "Today", count: stats.todayTransformations },
    { name: "This Week", count: stats.weekTransformations },
    { name: "All Time", count: stats.totalTransformations },
  ] : [];

  const successRate = stats && stats.totalTransformations > 0 
    ? ((stats.successfulTransformations / stats.totalTransformations) * 100).toFixed(1)
    : "0";

  const downloadRate = stats && stats.successfulTransformations > 0
    ? ((stats.totalDownloads / stats.successfulTransformations) * 100).toFixed(1)
    : "0";

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load analytics</p>
          <Link href="/" className="text-amber-600 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="flex items-center text-stone-500 hover:text-stone-700 mb-2" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-serif font-light text-stone-800">Analytics Dashboard</h1>
            <p className="text-stone-500 mt-1">Track transformation performance and usage</p>
          </div>
          <Link href="/evals" className="text-amber-600 hover:text-amber-700 font-medium" data-testid="link-evals">
            View Evaluations →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-16 bg-stone-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card data-testid="card-total-transformations">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">Total Transformations</CardTitle>
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-stone-800">{stats?.totalTransformations || 0}</div>
                  <p className="text-xs text-stone-500 mt-1">{stats?.todayTransformations || 0} today</p>
                </CardContent>
              </Card>

              <Card data-testid="card-success-rate">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">Success Rate</CardTitle>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{successRate}%</div>
                  <p className="text-xs text-stone-500 mt-1">{stats?.successfulTransformations || 0} successful</p>
                </CardContent>
              </Card>

              <Card data-testid="card-download-rate">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">Download Rate</CardTitle>
                  <Download className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{downloadRate}%</div>
                  <p className="text-xs text-stone-500 mt-1">{stats?.totalDownloads || 0} downloads</p>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-time">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">Avg Processing Time</CardTitle>
                  <Clock className="w-4 h-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {stats?.avgProcessingTimeMs ? (stats.avgProcessingTimeMs / 1000).toFixed(1) : "0"}s
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Per transformation</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card data-testid="card-model-usage">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-stone-700 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    Model Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {modelData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={modelData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {modelData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-stone-400">
                      No data yet. Run some transformations!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-timeline">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-stone-700 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                    Transformation Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.totalTransformations && stats.totalTransformations > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timelineData}>
                          <XAxis dataKey="name" tick={{ fill: '#78716c' }} />
                          <YAxis tick={{ fill: '#78716c' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fafaf9', 
                              border: '1px solid #e7e5e4',
                              borderRadius: '8px'
                            }} 
                          />
                          <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-stone-400">
                      No data yet. Run some transformations!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-quick-stats">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-stone-700">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{stats?.flashCount || 0}</div>
                    <div className="text-sm text-stone-500">Flash Model</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats?.proCount || 0}</div>
                    <div className="text-sm text-stone-500">Pro Model</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats?.weekTransformations || 0}</div>
                    <div className="text-sm text-stone-500">This Week</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats?.totalDownloads || 0}</div>
                    <div className="text-sm text-stone-500">Downloads</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
