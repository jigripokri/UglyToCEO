import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, FlaskConical, Star, AlertTriangle, CheckCircle, User, Palette, Zap, Crown, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EvalResult {
  id: string;
  runId: string;
  testImageName: string;
  modelUsed: string;
  backgroundColor: string;
  overallScore: number | null;
  professionalismScore: number | null;
  identityPreservationScore: number | null;
  backgroundAccuracy: boolean | null;
  technicalQualityScore: number | null;
  passed: boolean | null;
  judgeNotes: string | null;
  processingTimeMs: number | null;
  errorMessage: string | null;
  createdAt: string;
  inputImagePath: string | null;
  outputImagePath: string | null;
}

interface EvalData {
  results: EvalResult[];
  latestRunId: string | null;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const getScoreColor = (s: number) => {
    if (s >= 4) return "bg-green-500";
    if (s >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-stone-600">{label}</span>
        <span className="font-medium text-stone-800">{score.toFixed(1)}/5</span>
      </div>
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getScoreColor(score)} transition-all duration-500`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

function EvalCard({ result }: { result: EvalResult }) {
  const score = result.overallScore ?? 0;
  const overallColor = score >= 4 ? "text-green-600" : 
    score >= 3 ? "text-yellow-600" : "text-red-600";

  const inputImageUrl = result.inputImagePath 
    ? `/api/evals/input-image/${encodeURIComponent(result.inputImagePath)}`
    : null;
  const outputImageUrl = result.outputImagePath 
    ? `/api/evals/output-image/${encodeURIComponent(result.outputImagePath)}`
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`eval-card-${result.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-stone-600 truncate max-w-[150px]" title={result.testImageName}>
            {result.testImageName.split("_").slice(0, -2).join("_")}
          </CardTitle>
          <div className="flex items-center gap-2">
            {result.passed !== null && (
              <Badge variant={result.passed ? "default" : "destructive"}>
                {result.passed ? "PASS" : "FAIL"}
              </Badge>
            )}
            <Badge variant={result.modelUsed === "pro" ? "default" : "secondary"}>
              {result.modelUsed.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <div 
            className="w-4 h-4 rounded-full border border-stone-300" 
            style={{ backgroundColor: result.backgroundColor }}
          />
          Background: {result.backgroundColor}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(inputImageUrl || outputImageUrl) && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-stone-400 text-center">Input</p>
              {inputImageUrl ? (
                <img 
                  src={inputImageUrl} 
                  alt="Input" 
                  className="w-full aspect-square object-cover rounded-lg border border-stone-200"
                  data-testid={`img-input-${result.id}`}
                />
              ) : (
                <div className="w-full aspect-square bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-stone-400 text-center">Output</p>
              {outputImageUrl ? (
                <img 
                  src={outputImageUrl} 
                  alt="Output" 
                  className="w-full aspect-square object-cover rounded-lg border border-stone-200"
                  data-testid={`img-output-${result.id}`}
                />
              ) : (
                <div className="w-full aspect-square bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-xs">
                  No image
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center py-2">
          <div className={`text-4xl font-bold ${overallColor}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-stone-400 ml-1">/5</div>
        </div>

        <div className="space-y-3">
          <ScoreBar score={result.professionalismScore ?? 0} label="Professionalism" />
          <ScoreBar score={result.identityPreservationScore ?? 0} label="Identity Preservation" />
          <ScoreBar score={result.technicalQualityScore ?? 0} label="Technical Quality" />
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Background Accuracy</span>
            <span className={`font-medium ${result.backgroundAccuracy ? "text-green-600" : "text-red-600"}`}>
              {result.backgroundAccuracy === null ? "N/A" : result.backgroundAccuracy ? "Correct" : "Incorrect"}
            </span>
          </div>
        </div>

        {result.errorMessage && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
              <AlertTriangle className="w-4 h-4" />
              Error
            </div>
            <p className="text-sm text-red-600">{result.errorMessage}</p>
          </div>
        )}

        {result.judgeNotes && (
          <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <div className="text-sm font-medium text-stone-600 mb-1">Judge Notes</div>
            <p className="text-sm text-stone-500">{result.judgeNotes}</p>
          </div>
        )}

        <div className="flex justify-between text-xs text-stone-400">
          {result.processingTimeMs && (
            <span>{(result.processingTimeMs / 1000).toFixed(1)}s</span>
          )}
          <span>{new Date(result.createdAt).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Evals() {
  const { data, isLoading, error } = useQuery<EvalData>({
    queryKey: ["eval-results"],
    queryFn: async () => {
      const res = await fetch("/api/evals/results");
      if (!res.ok) throw new Error("Failed to fetch eval results");
      return res.json();
    },
  });

  const results = data?.results || [];
  const latestRunId = data?.latestRunId;

  const validResults = results.filter(r => r.overallScore !== null && !r.errorMessage);
  
  const avgScores = validResults.length > 0 ? {
    overall: validResults.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) / validResults.length,
    professionalism: validResults.reduce((sum, r) => sum + (r.professionalismScore ?? 0), 0) / validResults.length,
    identity: validResults.reduce((sum, r) => sum + (r.identityPreservationScore ?? 0), 0) / validResults.length,
    backgroundAccuracyRate: (validResults.filter(r => r.backgroundAccuracy === true).length / validResults.length) * 100,
  } : null;

  const passRate = validResults.length > 0 
    ? ((validResults.filter(r => (r.overallScore ?? 0) >= 3).length / validResults.length) * 100).toFixed(1)
    : "0";

  const flashResults = validResults.filter(r => r.modelUsed === "flash");
  const proResults = validResults.filter(r => r.modelUsed === "pro");

  const modelStats = {
    flash: flashResults.length > 0 ? {
      count: flashResults.length,
      avgOverall: flashResults.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) / flashResults.length,
      avgIdentity: flashResults.reduce((sum, r) => sum + (r.identityPreservationScore ?? 0), 0) / flashResults.length,
      avgProfessionalism: flashResults.reduce((sum, r) => sum + (r.professionalismScore ?? 0), 0) / flashResults.length,
      avgTechnical: flashResults.reduce((sum, r) => sum + (r.technicalQualityScore ?? 0), 0) / flashResults.length,
      backgroundAccuracy: (flashResults.filter(r => r.backgroundAccuracy === true).length / flashResults.length) * 100,
      avgProcessingTime: flashResults.reduce((sum, r) => sum + (r.processingTimeMs ?? 0), 0) / flashResults.length,
      passRate: (flashResults.filter(r => (r.overallScore ?? 0) >= 3).length / flashResults.length) * 100,
    } : null,
    pro: proResults.length > 0 ? {
      count: proResults.length,
      avgOverall: proResults.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) / proResults.length,
      avgIdentity: proResults.reduce((sum, r) => sum + (r.identityPreservationScore ?? 0), 0) / proResults.length,
      avgProfessionalism: proResults.reduce((sum, r) => sum + (r.professionalismScore ?? 0), 0) / proResults.length,
      avgTechnical: proResults.reduce((sum, r) => sum + (r.technicalQualityScore ?? 0), 0) / proResults.length,
      backgroundAccuracy: (proResults.filter(r => r.backgroundAccuracy === true).length / proResults.length) * 100,
      avgProcessingTime: proResults.reduce((sum, r) => sum + (r.processingTimeMs ?? 0), 0) / proResults.length,
      passRate: (proResults.filter(r => (r.overallScore ?? 0) >= 3).length / proResults.length) * 100,
    } : null,
  };

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load evaluations</p>
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
            <h1 className="text-3xl font-serif font-light text-stone-800 flex items-center gap-3">
              <FlaskConical className="w-8 h-8 text-amber-600" />
              Evaluation Results
            </h1>
            <p className="text-stone-500 mt-1">AI quality assessments using LLM-as-Judge</p>
          </div>
          <Link href="/analytics" className="text-amber-600 hover:text-amber-700 font-medium" data-testid="link-analytics">
            ← View Analytics
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-48 bg-stone-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <FlaskConical className="w-16 h-16 mx-auto text-stone-300 mb-4" />
              <h2 className="text-xl font-medium text-stone-600 mb-2">No Evaluations Yet</h2>
              <p className="text-stone-400 max-w-md mx-auto">
                Run the evaluation script to generate quality assessments for the AI headshot transformations.
              </p>
              <div className="mt-6 p-4 bg-stone-100 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm font-mono text-stone-600">npx tsx server/eval-runner.ts</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {latestRunId && (
              <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-700">
                  <strong>Latest Run:</strong> {latestRunId} ({results.length} test cases evaluated)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card data-testid="card-avg-overall">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">Avg Overall Score</CardTitle>
                  <Star className="w-4 h-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">{avgScores?.overall.toFixed(2) || "0"}</div>
                  <p className="text-xs text-stone-500 mt-1">Out of 5.0</p>
                </CardContent>
              </Card>

              <Card data-testid="card-pass-rate">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">Pass Rate (≥3.0)</CardTitle>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{passRate}%</div>
                  <p className="text-xs text-stone-500 mt-1">{validResults.filter(r => (r.overallScore ?? 0) >= 3).length} / {validResults.length} valid tests</p>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-identity">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">Avg Identity Score</CardTitle>
                  <User className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{avgScores?.identity.toFixed(2) || "0"}</div>
                  <p className="text-xs text-stone-500 mt-1">Facial preservation</p>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-background">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-stone-500">Background Accuracy</CardTitle>
                  <Palette className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{avgScores?.backgroundAccuracyRate.toFixed(0) || "0"}%</div>
                  <p className="text-xs text-stone-500 mt-1">Correct color match</p>
                </CardContent>
              </Card>
            </div>

            {(modelStats.flash || modelStats.pro) && (
              <div className="mb-8">
                <h2 className="text-xl font-medium text-stone-700 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Flash vs Pro Comparison
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white" data-testid="card-flash-stats">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <Zap className="w-5 h-5" />
                        Flash Model
                        <Badge variant="secondary" className="ml-auto">{modelStats.flash?.count || 0} tests</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {modelStats.flash ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg border border-amber-100">
                              <div className="text-2xl font-bold text-amber-600">{modelStats.flash.avgOverall.toFixed(2)}</div>
                              <div className="text-xs text-stone-500">Overall Score</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-amber-100">
                              <div className="text-2xl font-bold text-green-600">{modelStats.flash.passRate.toFixed(0)}%</div>
                              <div className="text-xs text-stone-500">Pass Rate</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">Identity Preservation</span>
                              <span className="font-medium">{modelStats.flash.avgIdentity.toFixed(2)}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">Professionalism</span>
                              <span className="font-medium">{modelStats.flash.avgProfessionalism.toFixed(2)}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">Technical Quality</span>
                              <span className="font-medium">{modelStats.flash.avgTechnical.toFixed(2)}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">Background Accuracy</span>
                              <span className="font-medium">{modelStats.flash.backgroundAccuracy.toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-amber-100 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-stone-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">Avg Time</span>
                            </div>
                            <span className="font-bold text-amber-700">{(modelStats.flash.avgProcessingTime / 1000).toFixed(1)}s</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-stone-400 py-4">No Flash results yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white" data-testid="card-pro-stats">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Crown className="w-5 h-5" />
                        Pro Model
                        <Badge variant="secondary" className="ml-auto">{modelStats.pro?.count || 0} tests</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {modelStats.pro ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                              <div className="text-2xl font-bold text-purple-600">{modelStats.pro.avgOverall.toFixed(2)}</div>
                              <div className="text-xs text-stone-500">Overall Score</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                              <div className="text-2xl font-bold text-green-600">{modelStats.pro.passRate.toFixed(0)}%</div>
                              <div className="text-xs text-stone-500">Pass Rate</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">Identity Preservation</span>
                              <span className="font-medium">{modelStats.pro.avgIdentity.toFixed(2)}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">Professionalism</span>
                              <span className="font-medium">{modelStats.pro.avgProfessionalism.toFixed(2)}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">Technical Quality</span>
                              <span className="font-medium">{modelStats.pro.avgTechnical.toFixed(2)}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-stone-600">Background Accuracy</span>
                              <span className="font-medium">{modelStats.pro.backgroundAccuracy.toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-stone-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">Avg Time</span>
                            </div>
                            <span className="font-bold text-purple-700">{(modelStats.pro.avgProcessingTime / 1000).toFixed(1)}s</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-stone-400 py-4">No Pro results yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {modelStats.flash && modelStats.pro && (
                  <Card className="mt-4 bg-gradient-to-r from-amber-50 via-white to-purple-50" data-testid="card-comparison-insights">
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-stone-700 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        Key Insights
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="text-stone-500 mb-1">Quality Winner</div>
                          <div className="font-bold flex items-center gap-2">
                            {modelStats.pro.avgOverall > modelStats.flash.avgOverall ? (
                              <><Crown className="w-4 h-4 text-purple-600" /> Pro by {(modelStats.pro.avgOverall - modelStats.flash.avgOverall).toFixed(2)}</>
                            ) : modelStats.flash.avgOverall > modelStats.pro.avgOverall ? (
                              <><Zap className="w-4 h-4 text-amber-600" /> Flash by {(modelStats.flash.avgOverall - modelStats.pro.avgOverall).toFixed(2)}</>
                            ) : (
                              <>Tied!</>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="text-stone-500 mb-1">Speed Winner</div>
                          <div className="font-bold flex items-center gap-2">
                            {modelStats.flash.avgProcessingTime < modelStats.pro.avgProcessingTime ? (
                              <><Zap className="w-4 h-4 text-amber-600" /> Flash by {((modelStats.pro.avgProcessingTime - modelStats.flash.avgProcessingTime) / 1000).toFixed(1)}s</>
                            ) : (
                              <><Crown className="w-4 h-4 text-purple-600" /> Pro by {((modelStats.flash.avgProcessingTime - modelStats.pro.avgProcessingTime) / 1000).toFixed(1)}s</>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="text-stone-500 mb-1">Identity Preservation</div>
                          <div className="font-bold flex items-center gap-2">
                            {modelStats.pro.avgIdentity > modelStats.flash.avgIdentity ? (
                              <><Crown className="w-4 h-4 text-purple-600" /> Pro by {(modelStats.pro.avgIdentity - modelStats.flash.avgIdentity).toFixed(2)}</>
                            ) : modelStats.flash.avgIdentity > modelStats.pro.avgIdentity ? (
                              <><Zap className="w-4 h-4 text-amber-600" /> Flash by {(modelStats.flash.avgIdentity - modelStats.pro.avgIdentity).toFixed(2)}</>
                            ) : (
                              <>Tied!</>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <h2 className="text-xl font-medium text-stone-700 mb-4">Individual Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(result => (
                <EvalCard key={result.id} result={result} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
