import os
import json
import asyncio
from typing import List, Dict, Optional, Any
import openai
import anthropic
from datetime import datetime
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import re

class AIStoryGenerator:
    """AI-powered story generation service"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.setup_clients()
        
    def setup_clients(self):
        """Initialize AI clients with API keys"""
        openai_key = os.getenv('OPENAI_API_KEY')
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        
        if openai_key and openai_key != 'your-openai-api-key-placeholder':
            self.openai_client = openai.OpenAI(api_key=openai_key)
            
        if anthropic_key and anthropic_key != 'your-anthropic-api-key-placeholder':
            self.anthropic_client = anthropic.Anthropic(api_key=anthropic_key)
    
    async def generate_story(self, prompt: str, child_age: int = 7, interests: List[str] = None) -> Dict[str, Any]:
        """Generate a child-friendly story based on prompt"""
        
        # If no API keys available, use template-based generation
        if not self.openai_client and not self.anthropic_client:
            return self._generate_template_story(prompt, child_age, interests)
        
        try:
            # Prepare the story generation prompt
            system_prompt = self._create_system_prompt(child_age, interests)
            user_prompt = self._create_user_prompt(prompt)
            
            # Try OpenAI first, then Anthropic
            if self.openai_client:
                return await self._generate_with_openai(system_prompt, user_prompt)
            elif self.anthropic_client:
                return await self._generate_with_anthropic(system_prompt, user_prompt)
                
        except Exception as e:
            print(f"AI generation failed: {e}")
            return self._generate_template_story(prompt, child_age, interests)
    
    def _create_system_prompt(self, child_age: int, interests: List[str] = None) -> str:
        """Create system prompt for AI story generation"""
        interests_text = ""
        if interests:
            interests_text = f"The child is particularly interested in: {', '.join(interests)}. "
        
        return f"""You are a creative children's story writer specializing in neuro-inclusive, educational stories for children aged {child_age}. 

Guidelines:
- Create engaging, positive stories with clear structure
- Use simple language appropriate for age {child_age}
- Include educational elements about art, creativity, or problem-solving
- Ensure stories are inclusive and celebrate diversity
- Make each story 3 pages long for illustration
- Each page should have a clear drawing prompt
- {interests_text}
- Focus on adventure, friendship, and creativity
- Avoid scary or negative themes
- Make the story interactive and drawing-focused

Output format: Return a JSON object with:
- "title": Story title
- "pages": Array of 3 pages, each with "content" and "drawing_prompt"
- "themes": Array of main themes/concepts
- "art_focus": The main artistic skill this story teaches"""
    
    def _create_user_prompt(self, prompt: str) -> str:
        """Create user prompt for story generation"""
        return f"""Create a 3-page illustrated children's story about: {prompt}

The story should be designed for a child to draw illustrations for each page. Make it magical, educational, and fun!"""
    
    async def _generate_with_openai(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Generate story using OpenAI API"""
        response = await asyncio.to_thread(
            self.openai_client.chat.completions.create,
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1000,
            temperature=0.8
        )
        
        content = response.choices[0].message.content
        
        # Try to parse as JSON, fallback to structured parsing
        try:
            return json.loads(content)
        except:
            return self._parse_story_response(content)
    
    async def _generate_with_anthropic(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Generate story using Anthropic API"""
        response = await asyncio.to_thread(
            self.anthropic_client.messages.create,
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )
        
        content = response.content[0].text
        
        # Try to parse as JSON, fallback to structured parsing
        try:
            return json.loads(content)
        except:
            return self._parse_story_response(content)
    
    def _parse_story_response(self, content: str) -> Dict[str, Any]:
        """Parse AI response into structured story format"""
        lines = content.strip().split('\n')
        
        # Extract title
        title = "A Magical Adventure"
        for line in lines:
            if 'title' in line.lower() or line.startswith('#'):
                title = re.sub(r'[#*"\'{}:]', '', line).strip()
                break
        
        # Create simple 3-page structure
        pages = [
            {
                "content": "Once upon a time, there was a wonderful adventure waiting to begin...",
                "drawing_prompt": "Draw the main character of your story"
            },
            {
                "content": "The adventure continued with exciting discoveries and new friends...",
                "drawing_prompt": "Draw the most exciting part of the adventure"
            },
            {
                "content": "And they all lived happily ever after, having learned something wonderful!",
                "drawing_prompt": "Draw the happy ending of your story"
            }
        ]
        
        return {
            "title": title,
            "pages": pages,
            "themes": ["adventure", "creativity", "friendship"],
            "art_focus": "storytelling through art"
        }
    
    def _generate_template_story(self, prompt: str, child_age: int, interests: List[str] = None) -> Dict[str, Any]:
        """Generate story using templates when AI APIs are not available"""
        
        # Extract key themes from prompt
        themes = self._extract_themes(prompt)
        main_character = self._determine_character(prompt, themes)
        setting = self._determine_setting(prompt, themes)
        
        title = f"The Amazing Adventure of {main_character}"
        
        pages = [
            {
                "content": f"Once upon a time, there was a brave {main_character} who lived in {setting}. Every day, they dreamed of going on a magical adventure and discovering something wonderful!",
                "drawing_prompt": f"Draw {main_character} in their home at {setting}, getting ready for an adventure"
            },
            {
                "content": f"One special day, {main_character} discovered something amazing! They met new friends, learned exciting things, and showed incredible creativity and kindness.",
                "drawing_prompt": f"Draw {main_character} on their amazing discovery - make it colorful and magical!"
            },
            {
                "content": f"At the end of their adventure, {main_character} returned home feeling proud and happy. They had learned that with creativity and courage, any dream can come true!",
                "drawing_prompt": f"Draw {main_character} celebrating their successful adventure with all their new friends"
            }
        ]
        
        return {
            "title": title,
            "pages": pages,
            "themes": themes,
            "art_focus": "character design and storytelling",
            "generated_with": "template_system"
        }
    
    def _extract_themes(self, prompt: str) -> List[str]:
        """Extract themes from user prompt"""
        prompt_lower = prompt.lower()
        themes = []
        
        theme_keywords = {
            "space": ["space", "astronaut", "planet", "star", "rocket", "alien"],
            "dinosaur": ["dinosaur", "dino", "t-rex", "prehistoric", "fossil"],
            "ocean": ["ocean", "sea", "fish", "whale", "mermaid", "underwater"],
            "forest": ["forest", "tree", "nature", "animal", "woodland"],
            "magic": ["magic", "wizard", "fairy", "unicorn", "dragon", "spell"],
            "adventure": ["adventure", "journey", "explore", "quest", "travel"],
            "friendship": ["friend", "together", "help", "kind", "share"]
        }
        
        for theme, keywords in theme_keywords.items():
            if any(keyword in prompt_lower for keyword in keywords):
                themes.append(theme)
        
        return themes if themes else ["adventure", "creativity"]
    
    def _determine_character(self, prompt: str, themes: List[str]) -> str:
        """Determine main character based on prompt and themes"""
        prompt_lower = prompt.lower()
        
        characters = {
            "dinosaur": "friendly dinosaur",
            "space": "brave astronaut",
            "ocean": "curious dolphin",
            "magic": "young wizard",
            "forest": "woodland explorer"
        }
        
        for theme in themes:
            if theme in characters:
                return characters[theme]
        
        # Default characters based on prompt keywords
        if "cat" in prompt_lower:
            return "adventurous cat"
        elif "dog" in prompt_lower:
            return "loyal dog"
        elif "robot" in prompt_lower:
            return "helpful robot"
        else:
            return "young artist"
    
    def _determine_setting(self, prompt: str, themes: List[str]) -> str:
        """Determine setting based on prompt and themes"""
        settings = {
            "space": "a space station among the stars",
            "ocean": "a beautiful underwater kingdom",
            "forest": "a magical forest",
            "magic": "a enchanted castle",
            "dinosaur": "a prehistoric valley"
        }
        
        for theme in themes:
            if theme in settings:
                return settings[theme]
        
        return "a wonderful, colorful world"


class InterestAnalyzer:
    """Analyze child's interests based on drawing patterns and story choices"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.interest_categories = [
            "animals", "space", "dinosaurs", "ocean", "magic", "vehicles", 
            "nature", "fantasy", "science", "adventure", "friendship"
        ]
    
    def analyze_drawing_patterns(self, drawings: List[Dict]) -> Dict[str, float]:
        """Analyze drawings to identify interest patterns"""
        if not drawings:
            return {}
        
        # Extract text from drawing titles and descriptions
        texts = []
        for drawing in drawings:
            text_content = f"{drawing.get('title', '')} {drawing.get('description', '')}"
            texts.append(text_content)
        
        # Simple keyword-based analysis
        interests = {}
        for category in self.interest_categories:
            interests[category] = self._calculate_interest_score(texts, category)
        
        return interests
    
    def _calculate_interest_score(self, texts: List[str], category: str) -> float:
        """Calculate interest score for a category"""
        keywords = {
            "animals": ["cat", "dog", "bird", "fish", "lion", "tiger", "bear", "elephant"],
            "space": ["space", "astronaut", "planet", "star", "rocket", "galaxy", "moon"],
            "dinosaurs": ["dinosaur", "dino", "t-rex", "triceratops", "fossil", "prehistoric"],
            "ocean": ["ocean", "sea", "fish", "whale", "dolphin", "shark", "mermaid"],
            "magic": ["magic", "wizard", "fairy", "unicorn", "dragon", "castle", "spell"],
            "vehicles": ["car", "truck", "plane", "train", "boat", "bike", "helicopter"],
            "nature": ["tree", "flower", "garden", "forest", "mountain", "river", "sky"],
            "fantasy": ["princess", "knight", "castle", "fairy tale", "adventure"],
            "science": ["robot", "experiment", "invention", "laboratory", "technology"],
            "adventure": ["adventure", "journey", "explore", "quest", "treasure"],
            "friendship": ["friend", "together", "help", "share", "team", "group"]
        }
        
        category_keywords = keywords.get(category, [])
        total_matches = 0
        total_words = 0
        
        for text in texts:
            text_lower = text.lower()
            words = text_lower.split()
            total_words += len(words)
            
            for keyword in category_keywords:
                total_matches += text_lower.count(keyword)
        
        return min(total_matches / max(total_words, 1) * 100, 100.0)
    
    def get_personalized_recommendations(self, interests: Dict[str, float], current_quests: List[str]) -> List[Dict]:
        """Generate personalized quest and story recommendations"""
        # Sort interests by score
        sorted_interests = sorted(interests.items(), key=lambda x: x[1], reverse=True)
        top_interests = [interest for interest, score in sorted_interests[:3] if score > 0]
        
        recommendations = []
        
        for interest in top_interests:
            quest_recs = self._get_quest_recommendations(interest, current_quests)
            story_recs = self._get_story_recommendations(interest)
            
            recommendations.extend(quest_recs)
            recommendations.extend(story_recs)
        
        return recommendations[:10]  # Return top 10 recommendations
    
    def _get_quest_recommendations(self, interest: str, current_quests: List[str]) -> List[Dict]:
        """Get quest recommendations based on interest"""
        quest_map = {
            "animals": [
                {"type": "quest", "title": "Animal Kingdom Explorer", "description": "Learn to draw different animals"},
                {"type": "quest", "title": "Pet Portrait Master", "description": "Create portraits of favorite pets"}
            ],
            "space": [
                {"type": "quest", "title": "Cosmic Artist", "description": "Draw planets, stars, and galaxies"},
                {"type": "quest", "title": "Astronaut Adventures", "description": "Create space exploration scenes"}
            ],
            "dinosaurs": [
                {"type": "quest", "title": "Dinosaur Discovery", "description": "Draw different dinosaur species"},
                {"type": "quest", "title": "Prehistoric World", "description": "Create dinosaur habitats"}
            ]
        }
        
        return quest_map.get(interest, [])
    
    def _get_story_recommendations(self, interest: str) -> List[Dict]:
        """Get story prompt recommendations based on interest"""
        story_map = {
            "animals": [
                {"type": "story", "prompt": "A friendly animal who helps other forest creatures"},
                {"type": "story", "prompt": "A pet who goes on a magical adventure"}
            ],
            "space": [
                {"type": "story", "prompt": "An astronaut who discovers a new planet"},
                {"type": "story", "prompt": "A friendly alien who visits Earth"}
            ],
            "dinosaurs": [
                {"type": "story", "prompt": "A baby dinosaur learning to be brave"},
                {"type": "story", "prompt": "Dinosaurs and humans working together"}
            ]
        }
        
        return story_map.get(interest, [])


class DrawingProgressAnalyzer:
    """Analyze drawing progress and provide intelligent assistance"""
    
    def __init__(self):
        self.skill_categories = ["line_control", "shape_drawing", "color_usage", "composition", "creativity"]
    
    def analyze_drawing_progress(self, time_lapse: List[Dict], drawing_duration: int) -> Dict[str, Any]:
        """Analyze drawing progress from time-lapse data"""
        if not time_lapse:
            return {"status": "no_data"}
        
        analysis = {
            "total_actions": len(time_lapse),
            "drawing_duration": drawing_duration,
            "tools_used": self._analyze_tools_used(time_lapse),
            "drawing_pace": self._analyze_drawing_pace(time_lapse),
            "complexity_score": self._calculate_complexity_score(time_lapse),
            "suggestions": []
        }
        
        # Generate suggestions based on analysis
        analysis["suggestions"] = self._generate_progress_suggestions(analysis)
        
        return analysis
    
    def _analyze_tools_used(self, time_lapse: List[Dict]) -> Dict[str, int]:
        """Analyze which tools were used"""
        tools = {}
        for step in time_lapse:
            tool = step.get("tool", "unknown")
            tools[tool] = tools.get(tool, 0) + 1
        return tools
    
    def _analyze_drawing_pace(self, time_lapse: List[Dict]) -> str:
        """Analyze drawing pace"""
        if len(time_lapse) < 2:
            return "unknown"
        
        timestamps = [step.get("timestamp", 0) for step in time_lapse if step.get("timestamp")]
        if len(timestamps) < 2:
            return "unknown"
        
        total_time = (timestamps[-1] - timestamps[0]) / 1000  # Convert to seconds
        actions_per_minute = len(time_lapse) / (total_time / 60) if total_time > 0 else 0
        
        if actions_per_minute > 30:
            return "fast"
        elif actions_per_minute > 15:
            return "moderate"
        else:
            return "thoughtful"
    
    def _calculate_complexity_score(self, time_lapse: List[Dict]) -> float:
        """Calculate complexity score of the drawing"""
        # Simple heuristic based on number of actions and tool variety
        action_count = len(time_lapse)
        tool_variety = len(set(step.get("tool", "unknown") for step in time_lapse))
        
        complexity = (action_count * 0.7) + (tool_variety * 10)
        return min(complexity, 100.0)
    
    def _generate_progress_suggestions(self, analysis: Dict) -> List[str]:
        """Generate suggestions based on progress analysis"""
        suggestions = []
        
        tools_used = analysis.get("tools_used", {})
        pace = analysis.get("drawing_pace", "unknown")
        complexity = analysis.get("complexity_score", 0)
        
        # Tool-based suggestions
        if "rainbow" not in tools_used:
            suggestions.append("🌈 Try the rainbow brush for magical color effects!")
        
        if "bucket" not in tools_used:
            suggestions.append("🪣 Use the paint bucket to fill large areas with color!")
        
        # Pace-based suggestions
        if pace == "fast":
            suggestions.append("🎨 Take your time to add more details to your artwork!")
        elif pace == "thoughtful":
            suggestions.append("⚡ Great attention to detail! You're a thoughtful artist!")
        
        # Complexity-based suggestions
        if complexity < 20:
            suggestions.append("✨ Try adding more elements to make your drawing even more interesting!")
        elif complexity > 80:
            suggestions.append("🏆 Wow! You've created a very detailed masterpiece!")
        
        return suggestions[:3]  # Return top 3 suggestions

# Global instances
story_generator = AIStoryGenerator()
interest_analyzer = InterestAnalyzer()
progress_analyzer = DrawingProgressAnalyzer()