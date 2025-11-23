# ⚡ Lethal Markets

**AI-powered platform exposing corporate profiteering from global crises**

Lethal Markets uses Claude to analyze real-time global conflicts and reveal which companies profit from human suffering. Track defense contractors, energy giants, and other corporations that benefit from wars, disasters, and political instability.

## 🎯 What It Does

- **🔍 Crisis Detection**: Claude identifies current global conflicts and disasters
- **🏢 Corporate Exposure**: Reveals companies profiting from crises (arms dealers, contractors, etc.)
- **📈 Stock Impact**: Shows how conflicts boost certain company valuations
- **⚠️ Risk Analysis**: Calculates danger levels and market volatility
- **🤖 AI Intelligence**: Real-time analysis of corporate war profiteering

## 🚀 Features

### Real-Time Intelligence
- Live conflict monitoring (Ukraine, Middle East, etc.)
- Corporate involvement analysis
- Stock price impact tracking
- Risk assessment (0-100 scale)
- Market volatility predictions

### AI-Powered Analysis
- **Claude Integration**: Advanced conflict analysis
- **Company Classification**: Arms suppliers vs. solution providers
- **Financial Impact**: Stock price correlations with conflicts
- **Predictive Insights**: Market trend forecasting

### Professional Dashboard
- Interactive crisis map
- Company stock cards with live prices
- Risk scores and confidence levels
- Real-time data updates

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express (secure API proxy)
- **AI**: Claude via Anthropic API
- **UI**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts for data visualization
- **Security**: Helmet, CORS, Rate limiting

## 🔒 Security Features

### ✅ **Production-Ready Security**
- **🛡️ API Key Protection**: Keys never exposed to frontend/browser
- **🚫 Rate Limiting**: 10 requests per 15 minutes per IP
- **🔐 CORS Protection**: Restricted origins and credentials
- **⚡ Security Headers**: Helmet.js for comprehensive protection
- **🚨 Input Validation**: Sanitized requests and responses
- **📝 No Sensitive Logs**: API keys never logged or exposed

### 🏗️ **Architecture**
```
Frontend (React) → Secure Backend (Express) → Replicate API
     ↓                    ↓                      ↓
No API keys         Protected keys         Real Claude
Browser safe        Rate limited          Secure calls
```

## ⚡ Quick Start

### 🔒 Secure Setup (Recommended)
```bash
# Clone the repo
git clone https://github.com/yourusername/lethal-markets.git
cd lethal-markets

# Run secure setup
setup-secure.bat

# Add your API key to server/.env (NEVER frontend!)
echo REPLICATE_API_TOKEN=your_key_here >> server/.env

# Start both backend and frontend securely
start-secure.bat
```

### 🚀 Manual Setup
```bash
# Install frontend dependencies
npm install

# Install backend dependencies  
cd server && npm install

# Start backend (in server folder)
npm run dev

# Start frontend (in main folder)
npm run dev
```

Open `http://localhost:8080` and watch AI expose corporate war profiteering securely!

## 🎯 Perfect For

- **Investors**: Identify crisis-driven opportunities
- **Journalists**: Research corporate conflict involvement
- **Activists**: Expose unethical corporate behavior
- **Researchers**: Analyze geopolitical market impacts

## 🔥 Demo Highlights

1. **Real Claude Analysis**: Live AI processing of global events
2. **Actual Companies**: Lockheed Martin, Raytheon, Exxon, etc.
3. **Live Stock Data**: Real price changes and market impact
4. **Professional UI**: Hackathon-ready dashboard

## 💰 Cost Efficient

- Built-in 10-minute caching
- ~$0.24 per analysis
- Fallback mock data for demos
- Optimized for hackathons

## 🏆 Built For Hackathons

This project demonstrates:
- ✅ **Advanced AI Integration** (Claude)
- ✅ **Real-world Problem Solving** (corporate accountability)
- ✅ **Technical Excellence** (React + TypeScript + AI)
- ✅ **Social Impact** (exposing unethical profiteering)

## 📄 License

MIT License - Feel free to expose corporate greed worldwide! 

---

**⚡ Lethal Markets - Because someone should profit from the truth.**
