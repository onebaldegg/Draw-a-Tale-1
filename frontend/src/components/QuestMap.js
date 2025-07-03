import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questService } from '../services/questService';
import LoadingSpinner from './LoadingSpinner';

const QuestMap = ({ user }) => {
  const [quests, setQuests] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState(null);
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
    return 'locked';
  };

  const getQuestProgress = (questId) => {
    const progress = userProgress.find(p => p.quest_id === questId);
    return progress ? progress.completion_percentage : 0;
  };

  const startQuest = async (quest) => {
    try {
      await questService.updateProgress({
        quest_id: quest.id,
        status: 'in_progress',
        completion_percentage: 0
      });
      
      // Navigate to drawing canvas with quest context
      navigate('/draw', { state: { questId: quest.id, questTitle: quest.title } });
    } catch (error) {
      console.error('Error starting quest:', error);
    }
  };

  const QuestModal = ({ quest, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-md w-full m-4 p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">{quest.title}</h3>
          <p className="text-gray-600 mb-6">{quest.description}</p>
          
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Difficulty</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              quest.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              quest.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {quest.difficulty}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => startQuest(quest)}
              className="btn-child btn-primary flex-1"
            >
              Start Quest
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

  if (loading) {
    return <LoadingSpinner message="Loading quest map..." />;
  }

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-logo">Quest Map</div>
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
              Your Drawing Adventure Map
            </h1>
            <p className="text-child-body text-gray-600">
              Choose a quest to begin your artistic journey!
            </p>
          </div>

          {/* Quest Map */}
          <div className="quest-map-container relative bg-gradient-to-b from-sky-200 to-green-200 rounded-2xl p-8 min-h-96">
            {/* Quest nodes positioned relatively */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {quests.map((quest, index) => {
                const status = getQuestStatus(quest.id);
                const progress = getQuestProgress(quest.id);
                
                return (
                  <div
                    key={quest.id}
                    className={`quest-node ${status} relative`}
                    style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      margin: '0 auto'
                    }}
                    onClick={() => status !== 'locked' && setSelectedQuest(quest)}
                  >
                    {/* Quest Icon */}
                    <div className="text-4xl mb-2">
                      {quest.type === 'line_drawing' ? '📏' :
                       quest.type === 'shape_drawing' ? '🔷' :
                       quest.type === 'color_theory' ? '🎨' : '✨'}
                    </div>
                    
                    {/* Quest Title */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                      <div className="text-sm font-bold text-gray-800 whitespace-nowrap">
                        {quest.title}
                      </div>
                      {status === 'current' && progress > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          {Math.round(progress)}% complete
                        </div>
                      )}
                    </div>
                    
                    {/* Status badges */}
                    {status === 'completed' && (
                      <div className="absolute -top-2 -right-2 bg-draw-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                        ✓
                      </div>
                    )}
                    
                    {status === 'locked' && (
                      <div className="absolute inset-0 bg-gray-400 bg-opacity-75 rounded-full flex items-center justify-center">
                        <div className="text-white text-2xl">🔒</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-6xl opacity-20">☁️</div>
            <div className="absolute bottom-4 left-4 text-6xl opacity-20">🌳</div>
            <div className="absolute top-1/2 left-8 text-4xl opacity-20">🦋</div>
            <div className="absolute bottom-1/3 right-8 text-4xl opacity-20">🌸</div>
          </div>

          {/* Progress Summary */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/draw')}
              className="btn-child btn-primary mr-4"
            >
              Free Draw Mode
            </button>
            <button
              onClick={() => navigate('/gallery')}
              className="btn-child btn-secondary"
            >
              View Gallery
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
    </div>
  );
};

export default QuestMap;