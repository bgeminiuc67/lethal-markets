# 🚀 Lethal Markets - Ultra-Fast Setup

## What This Does
- **Finds current global conflicts** using GPT-5 AI
- **Identifies involved companies** and their stock tickers
- **Shows real-time stock impact** from conflicts
- **Analyzes company involvement** (arms suppliers, cleanup contractors, etc.)
- **Calculates risk scores** and market impact

## ⚡ 30-Second Setup

### 1. Add Your Replicate API Key
✅ Add your Replicate API key to the `.env` file (get one free at replicate.com)

### 2. Run the App
```bash
# Double-click this file or run in terminal:
setup-and-run.bat
```

### 3. That's It! 
The app will:
- Install the `replicate` package
- Start the development server
- Open at `http://localhost:5173`

## 🎯 How It Works

### Single GPT-5 Call Gets Everything:
1. **Current conflicts** (Ukraine, Middle East, etc.)
2. **Involved companies** with stock tickers
3. **Stock prices** and recent changes
4. **Company roles** (defense contractor, energy, etc.)
5. **Risk analysis** and market impact

### No External APIs Needed!
- ❌ No NewsAPI key required
- ❌ No stock API key required  
- ❌ No complex setup
- ✅ Just GPT-5 does everything!

## 🔥 Features

### Real-Time Intelligence
- Live crisis monitoring
- Company involvement analysis
- Stock impact tracking
- Risk scoring (0-100)
- Market impact percentage

### Smart Analysis
- Defense contractors benefiting from conflicts
- Energy companies affected by sanctions
- Cleanup/reconstruction companies
- Insurance companies handling claims
- Technology companies providing services

### Beautiful Dashboard
- Crisis list with severity levels
- Company stock cards with price changes
- Risk scores and confidence levels
- Market impact visualization

## 🚀 For Your Hackathon

This gives you a **complete crisis tracking platform** in minutes:

1. **Data Source**: GPT-5 finds all current conflicts
2. **Company Analysis**: AI identifies involved companies
3. **Stock Impact**: Shows how conflicts affect markets
4. **Risk Assessment**: Calculates danger levels
5. **Beautiful UI**: Professional dashboard ready to demo

## 🛠️ Optional Enhancements

Want even more real-time data? Add these API keys to `.env`:

```bash
# Optional: Real stock prices
VITE_ALPHA_VANTAGE_API_KEY=your_key_here

# Optional: Live news feeds  
VITE_NEWS_API_KEY=your_key_here

# Optional: More stock data
VITE_FINNHUB_API_KEY=your_key_here
```

**Free API Keys:**
- [Alpha Vantage](https://www.alphavantage.co/support/#api-key) - Free stock data
- [NewsAPI](https://newsapi.org/) - Free news feeds
- [Finnhub](https://finnhub.io/) - Free financial data

## 🎯 Perfect for Hackathons

- ✅ **Fast setup** (under 5 minutes)
- ✅ **Real data** from GPT-5
- ✅ **Professional UI** 
- ✅ **Impressive demo** potential
- ✅ **Scalable architecture**
- ✅ **No complex APIs** to manage

## 🚨 Troubleshooting

**If you get errors:**
1. Make sure Node.js is installed
2. Run `npm install` manually
3. Check that your Replicate API key is working
4. Try `npm run dev` directly

**If GPT-5 responses are slow:**
- The first call takes 10-30 seconds
- Subsequent calls are cached for 10 minutes
- This is normal for AI analysis

## 🎉 You're Ready!

Your AI-powered crisis tracker is ready to impress judges and track real global events!
