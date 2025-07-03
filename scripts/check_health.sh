#!/bin/bash

echo "🔍 Checking Draw-a-Tale Application Health..."
echo "================================================"

# Check supervisor services
echo "📋 Service Status:"
supervisorctl status

echo ""
echo "🌐 API Health Check:"
curl -s http://localhost:8001/api/health | python3 -m json.tool

echo ""
echo "🎨 Frontend Health Check:"
if curl -I http://localhost:3000 2>/dev/null | grep -q "200 OK"; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "🗄️ Database Check:"
if curl -s http://localhost:8001/api/quests | python3 -m json.tool >/dev/null 2>&1; then
    echo "✅ Database is connected and working"
else
    echo "❌ Database connection issues"
fi

echo ""
echo "🚀 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo "✨ Draw-a-Tale is ready for creative adventures!"