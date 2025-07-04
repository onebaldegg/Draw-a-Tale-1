import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questService } from '../services/questService';
import { storyService } from '../services/storyService';
import LoadingSpinner from './LoadingSpinner';
import DrawATaleLogo from './DrawATaleLogo';

const QuestMap = ({ user }) => {
  const [quests, setQuests] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [showStoryGenerator, setShowStoryGenerator] = useState(false);
  const [storyPrompt, setStoryPrompt] = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestsAndProgress();
  }, []);

  const fetchQuestsAndProgress = async () => {
    try {
      const [questsData, progressData] = await Promise.all([
        questService.getQuests(),
        questService.getUserProgress()
      ]);
      
      setQuests(questsData.quests || []);
      setUserProgress(progressData || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestStatus = (questId) => {
    const progress = userProgress.find(p => p.quest_id === questId);
    if (progress) {
      return progress.status === 'completed' ? 'completed' : 'current';
    }
    
    // Simple unlock logic: first quest is always available, others unlock when previous is completed
    const questIndex = quests.findIndex(q => q.id === questId);
    if (questIndex === 0) return 'current';
    
    const previousQuest = quests[questIndex - 1];
    if (previousQuest) {
      const previousProgress = userProgress.find(p => p.quest_id === previousQuest.id);
      return previousProgress && previousProgress.status === 'completed' ? 'current' : 'locked';
    }
    
    return 'locked';
  };

  const getQuestProgress = (questId) => {
    const progress = userProgress.find(p => p.quest_id === questId);
    return progress ? progress.completion_percentage : 0;
  };

  const startQuest = async (quest) => {
    try {
      // Check if quest already has progress
      const existingProgress = userProgress.find(p => p.quest_id === quest.id);
      
      if (!existingProgress) {
        await questService.updateProgress({
          quest_id: quest.id,
          status: 'in_progress',
          completion_percentage: 10
        });
      }
      
      // Navigate to drawing canvas with quest context
      navigate('/draw', { state: { questId: quest.id, questTitle: quest.title, questDescription: quest.description } });
    } catch (error) {
      console.error('Error starting quest:', error);
    }
  };

  const generateStoryAndDraw = async () => {
    if (!storyPrompt.trim()) {
      alert('Please enter a story idea!');
      return;
    }

    setGeneratingStory(true);
    try {
      const story = await storyService.generateStory(storyPrompt);
      
      // Navigate to drawing with story context
      navigate('/draw', { 
        state: { 
          storyMode: true,
          story: story,
          storyPrompt: storyPrompt
        } 
      });
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setGeneratingStory(false);
      setShowStoryGenerator(false);
    }
  };

  const QuestModal = ({ quest, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-lg w-full m-4 p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {quest.type === 'line_drawing' ? '📏' :
             quest.type === 'shape_drawing' ? '🔷' :
             quest.type === 'color_theory' ? '🎨' : '✨'}
          </div>
          <h3 className="text-2xl font-bold mb-4">{quest.title}</h3>
          <p className="text-gray-600 mb-6">{quest.description}</p>
          
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Difficulty</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              quest.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              quest.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
            </div>
          </div>

          {/* Quest Learning Objectives */}
          <div className="mb-6 text-left">
            <h4 className="font-semibold mb-2">What you'll learn:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {quest.type === 'line_drawing' && (
                <>
                  <li>• Drawing straight and curved lines</li>
                  <li>• Line weight and pressure control</li>
                  <li>• Basic line art techniques</li>
                </>
              )}
              {quest.type === 'shape_drawing' && (
                <>
                  <li>• Drawing basic geometric shapes</li>
                  <li>• Shape combination techniques</li>
                  <li>• Proportions and symmetry</li>
                </>
              )}
              {quest.type === 'color_theory' && (
                <>
                  <li>• Primary and secondary colors</li>
                  <li>• Color mixing basics</li>
                  <li>• Creating mood with colors</li>
                </>
              )}
            </ul>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => startQuest(quest)}
              className="btn-child btn-primary flex-1"
            >
              🚀 Start Quest
            </button>
            <button
              onClick={onClose}
              className="btn-child btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const StoryGeneratorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
      // Only close if clicking the backdrop, not the modal content
      if (e.target === e.currentTarget) {
        setShowStoryGenerator(false);
      }
    }}>
      <div className="card max-w-md w-full m-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="mb-4">
            <DrawATaleLogo width={80} height={80} variant="icon-only" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Create Your Story</h3>
          <p className="text-gray-600 mb-6">
            Tell me what you'd like to draw about, and I'll create a magical story for you to illustrate!
          </p>
          
          <div className="mb-6">
            <textarea
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
              placeholder="Example: A dinosaur astronaut exploring space, or a magical unicorn in a rainbow forest..."
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-draw-primary focus:outline-none focus:ring-2 focus:ring-draw-primary focus:ring-opacity-20 transition-all duration-200 text-lg h-24 resize-none"
              maxLength={200}
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1">
              {storyPrompt.length}/200 characters
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={generateStoryAndDraw}
              disabled={generatingStory}
              className="btn-child btn-primary flex-1"
            >
              {generatingStory ? '✨ Creating Magic...' : '🪄 Generate Story'}
            </button>
            <button
              onClick={() => setShowStoryGenerator(false)}
              className="btn-child btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading quest map..." />;
  }

  return (
    <div className="min-h-screen bg-purple-600" style={{ backgroundColor: '#8A2BE2' }}>
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-700 hover:text-draw-primary text-sm font-medium px-2 py-1"
          >
            ← Back
          </button>
          <div className="nav-logo-centered">
            <div className="child-header-bubbly">Quest Map</div>
          </div>
          <div style={{ width: '80px' }}></div> {/* Reduced spacer for balance */}
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-child-title text-gray-800 mb-4">
              Your Drawing Adventure Map
            </h1>
            <p className="text-child-body text-gray-600">
              Choose a quest to learn new skills, or create your own story!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mb-8 space-x-4">
            <button
              onClick={() => navigate('/draw')}
              className="btn-child btn-primary"
            >
              🎨 Free Draw
            </button>
            <button
              onClick={() => setShowStoryGenerator(true)}
              className="btn-child btn-accent"
            >
              📚 Create Story
            </button>
          </div>

          {/* Quest Map */}
          <div className="quest-map-container relative bg-gradient-to-b from-sky-200 via-sky-100 to-green-200 rounded-2xl p-8 min-h-96">
            {/* Decorative Path */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                <path
                  d="M50 200 Q200 100, 350 200 T650 200"
                  stroke="#94a3b8"
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  fill="none"
                />
              </svg>
            </div>

            {/* Quest nodes positioned along the path */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {quests.map((quest, index) => {
                const status = getQuestStatus(quest.id);
                const progress = getQuestProgress(quest.id);
                
                return (
                  <div
                    key={quest.id}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`quest-node ${status} relative cursor-pointer`}
                      style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto'
                      }}
                      onClick={() => status !== 'locked' && setSelectedQuest(quest)}
                    >
                      {/* Quest Icon */}
                      <div className="text-3xl">
                        {quest.type === 'line_drawing' ? '📏' :
                         quest.type === 'shape_drawing' ? '🔷' :
                         quest.type === 'color_theory' ? '🎨' : '✨'}
                      </div>
                      
                      {/* Status badges */}
                      {status === 'completed' && (
                        <div className="absolute -top-2 -right-2 bg-draw-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                          ✓
                        </div>
                      )}
                      
                      {status === 'current' && progress > 0 && (
                        <div className="absolute -top-2 -right-2 bg-draw-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                          {Math.round(progress)}%
                        </div>
                      )}
                      
                      {status === 'locked' && (
                        <div className="absolute inset-0 bg-gray-400 bg-opacity-75 rounded-full flex items-center justify-center">
                          <div className="text-white text-xl">🔒</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Quest Title */}
                    <div className="text-center mt-4">
                      <div className="text-sm font-bold text-gray-800">
                        {quest.title}
                      </div>
                      {status === 'current' && progress > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          {Math.round(progress)}% complete
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {quest.difficulty}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-4xl opacity-30">☁️</div>
            <div className="absolute bottom-4 left-4 text-4xl opacity-30">🌳</div>
            <div className="absolute top-1/3 left-8 text-3xl opacity-30">🦋</div>
            <div className="absolute bottom-1/3 right-8 text-3xl opacity-30">🌸</div>
            <div className="absolute top-2/3 left-1/4 text-2xl opacity-30">🐝</div>
          </div>

          {/* Progress Summary */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-draw-accent mb-2">
                {userProgress.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-gray-600">Quests Completed</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-draw-secondary mb-2">
                {userProgress.reduce((acc, p) => acc + p.badges_earned.length, 0)}
              </div>
              <div className="text-gray-600">Badges Earned</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-draw-primary mb-2">
                {userProgress.filter(p => p.status === 'in_progress').length}
              </div>
              <div className="text-gray-600">Active Quests</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {quests.filter(q => getQuestStatus(q.id) === 'current').length}
              </div>
              <div className="text-gray-600">Available</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/draw')}
              className="btn-child btn-primary mr-4"
            >
              🎨 Free Draw Mode
            </button>
            <button
              onClick={() => navigate('/gallery')}
              className="btn-child btn-secondary"
            >
              🖼️ View Gallery
            </button>
          </div>
        </div>
      </div>

      {/* Quest Modal */}
      {selectedQuest && (
        <QuestModal
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
        />
      )}

      {/* Story Generator Modal */}
      {showStoryGenerator && <StoryGeneratorModal />}
    </div>
  );
};

export default QuestMap;