export class DataProcessor {
  calculateKPIs(deals) {
    console.log(`Processing ${deals.length} deals for KPI calculation`);
    
    const totalDealsCreated = deals.length;
    const wonDeals = deals.filter(deal => deal.stage === 'won');
    const lostDeals = deals.filter(deal => deal.stage === 'lost');
    const inProgressDeals = deals.filter(deal => deal.stage === 'in_progress' || deal.stage === 'created');
    
    const totalDealsWon = wonDeals.length;
    const totalDealsLost = lostDeals.length;
    const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
    const averageTicket = totalDealsWon > 0 ? totalRevenue / totalDealsWon : 0;
    const conversionRate = totalDealsCreated > 0 ? (totalDealsWon / totalDealsCreated) * 100 : 0;
    
    // Calculate ROAS (simplified - would need campaign cost data)
    const estimatedInvestment = totalDealsCreated * 100; // Placeholder
    const roas = estimatedInvestment > 0 ? totalRevenue / estimatedInvestment : 0;
    
    console.log(`KPI Results: Created=${totalDealsCreated}, Won=${totalDealsWon}, Lost=${totalDealsLost}, Revenue=${totalRevenue}`);
    
    return {
      totalDealsCreated,
      totalDealsWon,
      totalDealsLost,
      totalRevenue,
      averageTicket,
      conversionRate,
      roas,
      totalInvestment: estimatedInvestment,
      inProgressDeals: inProgressDeals.length
    };
  }
  
  calculateConsultantPerformance(users, deals) {
    return users.map(user => {
      const userDeals = deals.filter(deal => 
        deal.consultantId === user.id || 
        (deal.consultantEmail && deal.consultantEmail.toLowerCase() === user.email.toLowerCase())
      );
      const wonDeals = userDeals.filter(deal => deal.stage === 'won');
      const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
      const conversionRate = userDeals.length > 0 ? (wonDeals.length / userDeals.length) * 100 : 0;
      
      // Calculate ROAS (simplified)
      const estimatedInvestment = userDeals.length * 100;
      const roas = estimatedInvestment > 0 ? totalRevenue / estimatedInvestment : 0;
      
      // Gamification - All Level 1, 0 points for now as requested
      const points = 0; // Changed from Math.floor(totalRevenue / 10);
      const level = 1; // Changed from Math.min(Math.floor(points / 1000) + 1, 10);
      
      const badges = []; // Empty badges array for now
      
      return {
        ...user,
        totalRevenue,
        totalDeals: wonDeals.length,
        conversionRate,
        roas,
        points,
        level,
        badges,
        totalInvestment: estimatedInvestment,
        rank: 1 // Will be calculated after sorting
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue)
      .map((consultant, index) => ({
        ...consultant,
        rank: index + 1
      }));
  }
  
  calculateCampaignMetrics(campaigns, deals) {
    return campaigns.map(campaign => {
      const campaignDeals = deals.filter(deal => deal.campaignId === campaign.id);
      const wonDeals = campaignDeals.filter(deal => deal.stage === 'won');
      const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
      
      // Determine source based on campaign name
      let source = 'Outros';
      const campaignName = campaign.name.toUpperCase();
      if (campaignName.includes('GOOGLE')) source = 'Google Ads';
      else if (campaignName.includes('FACEBOOK') || campaignName.includes('META')) source = 'Facebook';
      else if (campaignName.includes('LINKEDIN')) source = 'LinkedIn';
      else if (campaignName.includes('INSTAGRAM')) source = 'Instagram';
      
      return {
        ...campaign,
        source,
        totalDeals: campaignDeals.length,
        wonDeals: wonDeals.length,
        totalRevenue,
        costPerLead: 85, // Placeholder - would come from campaign data
        totalLeads: campaignDeals.length * 2, // Estimate
        totalInvestment: campaignDeals.length * 85
      };
    });
  }
  
  generateSalesPrediction(deals, months = 3) {
    // Simple prediction based on historical data
    const wonDeals = deals.filter(deal => deal.stage === 'won');
    const avgRevenue = wonDeals.length > 0 ? wonDeals.reduce((sum, deal) => sum + deal.value, 0) / wonDeals.length : 0;
    const avgDealsPerMonth = Math.max(1, Math.ceil(wonDeals.length / 3));
    
    const predictions = [];
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      
      const growthFactor = 1 + (i * 0.1); // 10% growth per month
      
      predictions.push({
        period: `${monthNames[futureDate.getMonth()]} ${futureDate.getFullYear()}`,
        predictedRevenue: Math.round(avgRevenue * avgDealsPerMonth * growthFactor),
        predictedDeals: Math.ceil(avgDealsPerMonth * growthFactor),
        confidence: Math.max(50, 90 - (i * 10)), // Decreasing confidence
        trend: 'up'
      });
    }
    
    return predictions;
  }
  
  analyzeLossReasons(deals) {
    // Filter only lost deals here, not in the API call
    const lostDeals = deals.filter(deal => deal.stage === 'lost');
    
    console.log(`Analyzing ${lostDeals.length} lost deals out of ${deals.length} total deals`);
    
    const reasonCounts = {};
    
    lostDeals.forEach(deal => {
      const reason = deal.lossReason || 'Não especificado';
      if (!reasonCounts[reason]) {
        reasonCounts[reason] = { count: 0, totalValue: 0 };
      }
      reasonCounts[reason].count++;
      reasonCounts[reason].totalValue += deal.value;
    });
    
    const totalLost = lostDeals.length;
    
    return Object.entries(reasonCounts).map(([reason, data]) => ({
      reason,
      count: data.count,
      percentage: totalLost > 0 ? (data.count / totalLost) * 100 : 0,
      totalValue: data.totalValue
    })).sort((a, b) => b.count - a.count);
  }
  
  calculateGoals(deals, consultantId) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyDeals = deals.filter(deal => {
      const dealDate = new Date(deal.createdAt);
      return dealDate.getMonth() === currentMonth && dealDate.getFullYear() === currentYear;
    });
    
    const wonDeals = monthlyDeals.filter(deal => deal.stage === 'won');
    const currentRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    // Set targets based on historical performance
    const targetRevenue = Math.max(50000, currentRevenue * 1.5);
    const targetDeals = Math.max(5, wonDeals.length + 2);
    
    return [{
      id: `goal_${consultantId}_${currentYear}_${currentMonth}`,
      consultantId,
      targetRevenue,
      targetDeals,
      period: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
      currentRevenue,
      currentDeals: wonDeals.length,
      progress: (currentRevenue / targetRevenue) * 100
    }];
  }
  
  calculateBadges(wonDeals, totalRevenue) {
    const badges = [];
    
    if (wonDeals.length > 0) {
      badges.push({
        id: 'first_sale',
        name: 'Primeira Venda',
        description: 'Conquistou sua primeira venda',
        icon: '🎯',
        color: 'bg-blue-500',
        earnedAt: wonDeals[0].closedAt || wonDeals[0].createdAt
      });
    }
    
    if (wonDeals.length >= 5) {
      badges.push({
        id: 'top_performer',
        name: 'Top Performer',
        description: '5 ou mais vendas',
        icon: '🏆',
        color: 'bg-yellow-500',
        earnedAt: wonDeals[4].closedAt || wonDeals[4].createdAt
      });
    }
    
    if (totalRevenue >= 30000) {
      badges.push({
        id: 'high_revenue',
        name: 'Grande Negócio',
        description: 'Receita acima de R$ 30.000',
        icon: '💎',
        color: 'bg-purple-500',
        earnedAt: new Date().toISOString()
      });
    }
    
    return badges;
  }
}