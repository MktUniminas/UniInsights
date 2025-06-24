import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { CRMService } from './services/CRMService.js';
import { DataProcessor } from './services/DataProcessor.js';
import { CacheManager } from './services/CacheManager.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production for Vercel
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Initialize services
const crmService = new CRMService();
const dataProcessor = new DataProcessor();
const cacheManager = new CacheManager();

// Global error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper function to get current month date range
const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  };
};

// Health check - Important for Vercel
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Dashboard KPIs - Always current month unless filters are applied
app.get('/api/dashboard/kpis', asyncHandler(async (req, res) => {
  const { startDate, endDate, consultantIds, campaignIds, consultantEmail } = req.query;
  
  try {
    // Use current month if no date filters are provided
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = { startDate, endDate };
    } else {
      dateRange = getCurrentMonthRange();
    }
    
    // Check cache first
    const cacheKey = `kpis_${dateRange.startDate}_${dateRange.endDate}_${consultantIds || ''}_${campaignIds || ''}_${consultantEmail || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Fetch ALL deals (no stage filter) and let DataProcessor separate them
      const deals = await crmService.getDeals({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        consultantIds: consultantIds ? consultantIds.split(',') : undefined,
        campaignIds: campaignIds ? campaignIds.split(',') : undefined,
        consultantEmail: consultantEmail
      });
      
      // Process data to calculate KPIs
      cachedData = dataProcessor.calculateKPIs(deals);
      
      // Cache for 5 minutes
      cacheManager.set(cacheKey, cachedData, 300);
    }
    
    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString(),
      period: `${dateRange.startDate} to ${dateRange.endDate}`
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Consultants data
app.get('/api/consultants', asyncHandler(async (req, res) => {
  const { includePerformance = 'true', startDate, endDate } = req.query;
  
  try {
    const cacheKey = `consultants_${includePerformance}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Fetch users from CRM
      const users = await crmService.getUsers();
      
      if (includePerformance === 'true') {
        // Use date range if provided, otherwise use current month
        let dateRange = {};
        if (startDate && endDate) {
          dateRange = { startDate, endDate };
        } else {
          dateRange = getCurrentMonthRange();
        }
        
        // Fetch ALL deals for performance calculation
        const deals = await crmService.getDeals({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        cachedData = dataProcessor.calculateConsultantPerformance(users, deals);
      } else {
        cachedData = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          active: user.active
        }));
      }
      
      // Cache for 10 minutes
      cacheManager.set(cacheKey, cachedData, 600);
    }
    
    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching consultants:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Campaigns data
app.get('/api/campaigns', asyncHandler(async (req, res) => {
  const { includeMetrics = 'true', startDate, endDate } = req.query;
  
  try {
    const cacheKey = `campaigns_${includeMetrics}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Fetch campaigns from CRM
      const campaigns = await crmService.getCampaigns();
      
      if (includeMetrics === 'true') {
        // Use date range if provided, otherwise use current month
        let dateRange = {};
        if (startDate && endDate) {
          dateRange = { startDate, endDate };
        } else {
          dateRange = getCurrentMonthRange();
        }
        
        // Fetch ALL deals for metrics calculation
        const deals = await crmService.getDeals({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        cachedData = dataProcessor.calculateCampaignMetrics(campaigns, deals);
      } else {
        cachedData = campaigns;
      }
      
      // Cache for 15 minutes
      cacheManager.set(cacheKey, cachedData, 900);
    }
    
    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Deals data
app.get('/api/deals', asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    consultantId, 
    consultantEmail,
    campaignId, 
    stage, 
    page = 1, 
    limit = 50 
  } = req.query;
  
  try {
    const deals = await crmService.getDeals({
      startDate,
      endDate,
      consultantId,
      consultantEmail,
      campaignId,
      stage,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: deals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: deals.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Analytics endpoints
app.get('/api/analytics/sales-prediction', asyncHandler(async (req, res) => {
  const { months = 3, startDate, endDate } = req.query;
  
  try {
    const cacheKey = `sales_prediction_${months}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Use provided date range or default to last 90 days
      let dateRange = {};
      if (startDate && endDate) {
        dateRange = { startDate, endDate };
      } else {
        const endDate = new Date();
        const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        dateRange = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      }
      
      // Fetch ALL historical data (no stage filter)
      const deals = await crmService.getDeals({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      cachedData = dataProcessor.generateSalesPrediction(deals, parseInt(months));
      
      // Cache for 1 hour
      cacheManager.set(cacheKey, cachedData, 3600);
    }
    
    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating sales prediction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

app.get('/api/analytics/loss-analysis', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    const cacheKey = `loss_analysis_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Use provided date range or current month
      let dateRange = {};
      if (startDate && endDate) {
        dateRange = { startDate, endDate };
      } else {
        dateRange = getCurrentMonthRange();
      }
      
      // Fetch ALL deals and filter lost ones in DataProcessor
      const deals = await crmService.getDeals({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      cachedData = dataProcessor.analyzeLossReasons(deals);
      
      // Cache for 30 minutes
      cacheManager.set(cacheKey, cachedData, 1800);
    }
    
    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing loss reasons:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Goals endpoints
app.get('/api/goals', asyncHandler(async (req, res) => {
  const { consultantId, consultantEmail } = req.query;
  
  try {
    // Always use current month for goals
    const currentMonth = getCurrentMonthRange();
    
    // For goals, we want current month data
    const deals = await crmService.getDeals({
      consultantId,
      consultantEmail,
      startDate: currentMonth.startDate,
      endDate: currentMonth.endDate
    });
    
    const goals = dataProcessor.calculateGoals(deals, consultantId || consultantEmail);
    
    res.json({
      success: true,
      data: goals,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Only schedule cron jobs in development or when not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Schedule data refresh every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running scheduled data refresh...');
    try {
      // Clear cache to force fresh data on next request
      cacheManager.clear();
      
      // Pre-warm cache with fresh data
      await crmService.getDeals();
      await crmService.getUsers();
      await crmService.getCampaigns();
      
      console.log('Data refresh completed successfully');
    } catch (error) {
      console.error('Error during scheduled refresh:', error);
    }
  });
}

// Start server only in development
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 CRM Backend Server running on port ${PORT}`);
    console.log(`📊 Dashboard API available at http://localhost:${PORT}/api`);
  });
}

// Export for Vercel
export default app;