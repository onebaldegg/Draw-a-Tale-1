import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { drawingService } from '../services/drawingService';
import { questService } from '../services/questService';
import { aiAssistance } from '../services/aiService';
import LoadingSpinner from './LoadingSpinner';
import DrawATaleLogo from './DrawATaleLogo';

const ParentPortal = ({ user }) => {
  const [childDrawings, setChildDrawings] = useState([]);
  const [childProgress, setChildProgress] = useState([]);
  const [aiInsights, setAiInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [emailSettings, setEmailSettings] = useState({
    weeklyDigest: true,
    progressReports: true,
    achievementAlerts: true
  });
  const [customTracingImage, setCustomTracingImage] = useState(null);
  const [tracingTitle, setTracingTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChildData();
  }, []);

  const fetchChildData = async () => {
    try {
      // In a real implementation, you would fetch data for child accounts
      // linked to this parent account. For now, we'll use the current user's data
      const [drawings, progress] = await Promise.all([
        drawingService.getUserDrawings(),
        questService.getUserProgress()
      ]);
      
      setChildDrawings(drawings);
      setChildProgress(progress);
      
      // Fetch AI insights
      await fetchAIInsights(drawings);
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async (drawings) => {
    try {
      const [interests, recommendations] = await Promise.all([
        aiAssistance.getUserInterests(),
        aiAssistance.getRecommendations()
      ]);
      
      setAiInsights({
        interests: interests.interests || {},
        topInterests: interests.top_interests || [],
        recommendations: recommendations.recommendations || [],
        totalDrawingsAnalyzed: interests.total_drawings_analyzed || 0
      });
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setAiInsights({ interests: {}, topInterests: [], recommendations: [] });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateProgressReport = () => {
    const completedQuests = childProgress.filter(p => p.status === 'completed').length;
    const totalBadges = childProgress.reduce((acc, p) => acc + p.badges_earned.length, 0);
    const totalDrawings = childDrawings.length;
    const averageProgress = childProgress.length > 0 
      ? Math.round(childProgress.reduce((acc, p) => acc + p.completion_percentage, 0) / childProgress.length)
      : 0;
    
    // Calculate learning velocity (drawings per week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentDrawings = childDrawings.filter(d => new Date(d.created_at) > oneWeekAgo).length;
    
    return {
      completedQuests,
      totalBadges,
      totalDrawings,
      averageProgress,
      weeklyActivity: recentDrawings,
      learningVelocity: recentDrawings > 0 ? 'Active' : 'Moderate'
    };
  };

  const generateAIReport = () => {
    if (!aiInsights.topInterests || aiInsights.topInterests.length === 0) {
      return 'Continue encouraging your child to create more drawings to unlock personalized AI insights!';
    }

    const topInterest = aiInsights.topInterests[0];
    const recommendations = aiInsights.recommendations.slice(0, 3);
    
    let report = `🎨 **AI Analysis Summary**\n\n`;
    report += `Your child shows strong interest in **${topInterest}**. `;
    report += `Based on ${aiInsights.totalDrawingsAnalyzed} drawings analyzed, here are some insights:\n\n`;
    
    if (recommendations.length > 0) {
      report += `**Recommended Activities:**\n`;
      recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec.title || rec.prompt}\n`;
      });
    }
    
    report += `\n**Encouragement Tips:**\n`;
    report += `• Celebrate their creativity in ${topInterest}-themed artwork\n`;
    report += `• Ask them to tell stories about their drawings\n`;
    report += `• Consider books or videos about ${topInterest} for inspiration`;
    
    return report;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomTracingImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const createTracingPage = () => {
    if (!customTracingImage || !tracingTitle.trim()) {
      alert('Please upload an image and enter a title for the tracing page');
      return;
    }
    
    // In a real implementation, this would create a tracing page
    alert(`Tracing page "${tracingTitle}" created successfully! It will appear in your child's activities.`);
    setCustomTracingImage(null);
    setTracingTitle('');
  };

  const exportProgressReport = () => {
    const stats = generateProgressReport();
    const aiReport = generateAIReport();
    
    const report = `
DRAW-A-TALE PROGRESS REPORT
Generated: ${new Date().toLocaleDateString()}

=== ACHIEVEMENT SUMMARY ===
• Total Drawings: ${stats.totalDrawings}
• Quests Completed: ${stats.completedQuests}
• Badges Earned: ${stats.totalBadges}
• Average Progress: ${stats.averageProgress}%
• Weekly Activity: ${stats.weeklyActivity} drawings

=== AI INSIGHTS ===
${aiReport}

=== RECENT ARTWORK ===
${childDrawings.slice(0, 5).map(d => `• ${d.title} (${formatDate(d.created_at)})`).join('\n')}

Keep encouraging creativity and celebrate every masterpiece! 🎨
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `draw-a-tale-progress-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = generateProgressReport();

  const TabButton = ({ tabId, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
        isActive 
          ? 'bg-draw-primary text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return <LoadingSpinner message="Loading parent portal..." />;
  }

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-logo">
            <DrawATaleLogo width={180} showTagline={false} />
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-child btn-secondary text-sm px-4 py-2"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-child-title text-gray-800 mb-4">
              Parent Portal
            </h1>
            <p className="text-child-body text-gray-600">
              Track your child's creative journey with AI-powered insights
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4 bg-gray-50 rounded-lg p-2">
              <TabButton
                tabId="overview"
                label="Overview"
                isActive={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              />
              <TabButton
                tabId="ai-insights"
                label="AI Insights"
                isActive={activeTab === 'ai-insights'}
                onClick={() => setActiveTab('ai-insights')}
              />
              <TabButton
                tabId="drawings"
                label="Artwork"
                isActive={activeTab === 'drawings'}
                onClick={() => setActiveTab('drawings')}
              />
              <TabButton
                tabId="progress"
                label="Progress"
                isActive={activeTab === 'progress'}
                onClick={() => setActiveTab('progress')}
              />
              <TabButton
                tabId="tools"
                label="Parent Tools"
                isActive={activeTab === 'tools'}
                onClick={() => setActiveTab('tools')}
              />
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-draw-primary mb-2">
                    {stats.totalDrawings}
                  </div>
                  <div className="text-gray-600">Total Drawings</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.weeklyActivity} this week
                  </div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-draw-secondary mb-2">
                    {stats.completedQuests}
                  </div>
                  <div className="text-gray-600">Quests Completed</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Learning journey
                  </div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-draw-accent mb-2">
                    {stats.totalBadges}
                  </div>
                  <div className="text-gray-600">Badges Earned</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Achievement milestones
                  </div>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {stats.averageProgress}%
                  </div>
                  <div className="text-gray-600">Average Progress</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.learningVelocity} learner
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={exportProgressReport}
                  className="card p-6 hover:shadow-lg transition-shadow text-center"
                >
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="font-semibold mb-2">Export Report</h3>
                  <p className="text-sm text-gray-600">Download comprehensive progress report</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('ai-insights')}
                  className="card p-6 hover:shadow-lg transition-shadow text-center"
                >
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="font-semibold mb-2">AI Insights</h3>
                  <p className="text-sm text-gray-600">View personalized learning analysis</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('tools')}
                  className="card p-6 hover:shadow-lg transition-shadow text-center"
                >
                  <div className="text-4xl mb-4">🛠️</div>
                  <h3 className="font-semibold mb-2">Create Content</h3>
                  <p className="text-sm text-gray-600">Make custom tracing pages</p>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                {childDrawings.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No drawings created yet. Encourage your child to start drawing!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {childDrawings.slice(0, 5).map((drawing) => (
                      <div key={drawing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{drawing.title}</div>
                          <div className="text-sm text-gray-600">
                            Created on {formatDate(drawing.created_at)}
                          </div>
                          {drawing.quest_id && (
                            <div className="text-xs text-blue-600 mt-1">
                              🎯 Quest Drawing
                            </div>
                          )}
                        </div>
                        <button className="btn-child btn-primary text-sm px-4 py-2">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="space-y-8">
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">🤖 AI Learning Analysis</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    Our AI analyzes your child's drawing patterns to provide personalized insights and recommendations.
                    <span className="font-semibold"> This is for educational guidance only and not diagnostic.</span>
                  </p>
                </div>
                
                {aiInsights.totalDrawingsAnalyzed > 0 ? (
                  <div className="space-y-6">
                    {/* Interest Analysis */}
                    <div>
                      <h4 className="font-semibold mb-3">Detected Interests</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {aiInsights.topInterests.slice(0, 8).map((interest, index) => (
                          <div key={interest} className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg text-center">
                            <div className="font-semibold text-purple-800 capitalize">{interest}</div>
                            <div className="text-xs text-purple-600">
                              {Math.round(aiInsights.interests[interest] || 0)}% match
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    {aiInsights.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Personalized Recommendations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {aiInsights.recommendations.slice(0, 4).map((rec, index) => (
                            <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                              <div className="font-semibold text-yellow-800">
                                {rec.type === 'quest' ? '🎯 Quest' : '📚 Story'}: {rec.title || rec.prompt}
                              </div>
                              {rec.description && (
                                <div className="text-sm text-yellow-700 mt-1">{rec.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Report */}
                    <div>
                      <h4 className="font-semibold mb-3">Detailed Analysis</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">
                          {generateAIReport()}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-gray-600">
                      Create more drawings to unlock AI insights!
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      The AI needs at least one drawing to begin analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'drawings' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Child's Artwork Collection</h3>
              {childDrawings.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-600">No artwork created yet</p>
                </div>
              ) : (
                <div className="gallery-grid">
                  {childDrawings.map((drawing) => (
                    <div key={drawing.id} className="gallery-item">
                      <div className="gallery-item-image bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl">🎨</span>
                      </div>
                      <div className="gallery-item-info">
                        <h4 className="gallery-item-title">{drawing.title}</h4>
                        <p className="gallery-item-date">
                          {formatDate(drawing.created_at)}
                        </p>
                        {drawing.quest_id && (
                          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-2">
                            🎯 Quest Drawing
                          </div>
                        )}
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={async () => {
                              try {
                                const analysis = await aiAssistance.analyzeDrawing(drawing.id);
                                if (analysis) {
                                  alert(`AI Analysis for "${drawing.title}":\n\n${JSON.stringify(analysis.analysis, null, 2)}`);
                                }
                              } catch (error) {
                                console.error('Analysis failed:', error);
                              }
                            }}
                            className="btn-child btn-primary text-sm px-3 py-1 w-full"
                          >
                            🤖 AI Analysis
                          </button>
                          <button className="btn-child btn-secondary text-sm px-3 py-1 w-full">
                            📧 Email to Me
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Learning Progress & Development</h3>
              
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">Skill Development</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Drawing Fundamentals</span>
                        <span className="text-sm font-semibold">{Math.min(stats.totalDrawings * 10, 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-draw-primary h-2 rounded-full"
                          style={{ width: `${Math.min(stats.totalDrawings * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Color Theory</span>
                        <span className="text-sm font-semibold">{Math.min(stats.completedQuests * 25, 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-draw-secondary h-2 rounded-full"
                          style={{ width: `${Math.min(stats.completedQuests * 25, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Creative Expression</span>
                        <span className="text-sm font-semibold">{Math.min(stats.totalBadges * 20, 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-draw-accent h-2 rounded-full"
                          style={{ width: `${Math.min(stats.totalBadges * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">Activity Timeline</h4>
                  <div className="space-y-3">
                    {childDrawings.slice(0, 4).map((drawing, index) => (
                      <div key={drawing.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-draw-primary rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{drawing.title}</div>
                          <div className="text-xs text-gray-500">{formatDate(drawing.created_at)}</div>
                        </div>
                        {drawing.quest_id && (
                          <div className="text-xs text-blue-600">🎯</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quest Progress */}
              {childProgress.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-semibold">Quest Progress</h4>
                  {childProgress.map((progress) => (
                    <div key={progress.id} className="card p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-semibold">Quest: {progress.quest_id}</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            Status: {progress.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-draw-primary">
                            {Math.round(progress.completion_percentage)}%
                          </div>
                          <div className="text-sm text-gray-600">Complete</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                          className="bg-draw-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress.completion_percentage}%` }}
                        ></div>
                      </div>
                      
                      {/* Badges */}
                      {progress.badges_earned.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold mb-2">Badges Earned:</div>
                          <div className="flex flex-wrap gap-2">
                            {progress.badges_earned.map((badge, index) => (
                              <span key={index} className="bg-draw-secondary text-white px-3 py-1 rounded-full text-sm">
                                🏆 {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600">No quest progress data available yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Parent Tools & Settings</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Custom Tracing Page Creator */}
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">📝 Custom Tracing Pages</h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    Upload an image to create personalized tracing activities for your child
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Tracing Page Title</label>
                      <input
                        type="text"
                        value={tracingTitle}
                        onChange={(e) => setTracingTitle(e.target.value)}
                        placeholder="e.g., Trace our family dog"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="input-field"
                      />
                    </div>
                    
                    {customTracingImage && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img 
                          src={customTracingImage} 
                          alt="Tracing preview" 
                          className="max-w-full h-32 object-contain border rounded"
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={createTracingPage}
                      disabled={!customTracingImage || !tracingTitle.trim()}
                      className="btn-child btn-primary w-full disabled:opacity-50"
                    >
                      Create Tracing Page
                    </button>
                  </div>
                </div>

                {/* Email Digest Settings */}
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">📧 Email Notifications</h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    Configure when you'd like to receive updates about your child's progress
                  </p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={emailSettings.weeklyDigest}
                        onChange={(e) => setEmailSettings({...emailSettings, weeklyDigest: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Weekly progress digest</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={emailSettings.progressReports}
                        onChange={(e) => setEmailSettings({...emailSettings, progressReports: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Quest completion reports</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={emailSettings.achievementAlerts}
                        onChange={(e) => setEmailSettings({...emailSettings, achievementAlerts: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Achievement notifications</span>
                    </label>
                    
                    <button className="btn-child btn-secondary w-full mt-4">
                      Save Email Preferences
                    </button>
                  </div>
                </div>

                {/* AI Insights Settings */}
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">🤖 AI Analysis Settings</h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    Control how AI analyzes and provides insights about your child's artwork
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      <strong>Privacy Note:</strong> All AI analysis is for educational purposes only. 
                      No personal data is shared with third parties.
                    </div>
                    
                    <button
                      onClick={() => fetchAIInsights(childDrawings)}
                      className="btn-child btn-primary w-full"
                    >
                      🔄 Refresh AI Analysis
                    </button>
                    
                    <button
                      onClick={exportProgressReport}
                      className="btn-child btn-accent w-full"
                    >
                      📊 Export Full Report
                    </button>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="card p-6">
                  <h4 className="font-semibold mb-4">⚙️ Account Settings</h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    Manage account preferences and privacy settings
                  </p>
                  
                  <div className="space-y-4">
                    <button className="btn-child btn-secondary w-full">
                      👤 Manage Profile
                    </button>
                    
                    <button className="btn-child btn-secondary w-full">
                      🔒 Privacy Settings
                    </button>
                    
                    <button className="btn-child btn-secondary w-full">
                      💳 Subscription Settings
                    </button>
                    
                    <div className="text-xs text-gray-500 mt-4">
                      Need help? Contact support at support@draw-a-tale.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;