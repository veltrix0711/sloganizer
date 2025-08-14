import puppeteer from 'puppeteer';
import { supabase } from './supabase.js';

class ReportGenerator {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Generate comprehensive PDF report
  async generatePDFReport(userId, options = {}) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Set page size and options
      await page.setViewport({ width: 1200, height: 800 });

      // Get user data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile) {
        throw new Error('User not found');
      }

      // Get analytics data
      const analyticsData = await this.getAnalyticsData(userId, options);

      // Generate HTML content
      const htmlContent = this.generateReportHTML(profile, analyticsData, options);

      // Set HTML content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm'
        }
      });

      return {
        success: true,
        buffer: pdfBuffer,
        filename: `analytics-report-${profile.email}-${new Date().toISOString().split('T')[0]}.pdf`
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      await page.close();
    }
  }

  // Get comprehensive analytics data for report
  async getAnalyticsData(userId, options = {}) {
    const days = options.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Get posts with metrics
      const { data: posts } = await supabase
        .from('content_posts')
        .select(`
          *,
          post_metrics (*)
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      // Get connected accounts
      const { data: accounts } = await supabase
        .from('social_accounts')
        .select('platform, username, display_name, connected_at, last_sync_at')
        .eq('user_id', userId)
        .eq('is_active', true);

      // Calculate summary statistics
      const totalPosts = posts?.length || 0;
      const totalViews = posts?.reduce((sum, post) => {
        return sum + (post.post_metrics?.[0]?.views || 0);
      }, 0) || 0;
      
      const totalLikes = posts?.reduce((sum, post) => {
        return sum + (post.post_metrics?.[0]?.likes || 0);
      }, 0) || 0;
      
      const totalShares = posts?.reduce((sum, post) => {
        return sum + (post.post_metrics?.[0]?.shares || 0);
      }, 0) || 0;
      
      const totalComments = posts?.reduce((sum, post) => {
        return sum + (post.post_metrics?.[0]?.comments || 0);
      }, 0) || 0;

      const engagementRate = totalViews > 0 ? 
        ((totalLikes + totalShares + totalComments) / totalViews * 100).toFixed(2) : 0;

      // Platform breakdown
      const platformStats = {};
      posts?.forEach(post => {
        if (!platformStats[post.platform]) {
          platformStats[post.platform] = {
            posts: 0,
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0
          };
        }
        
        platformStats[post.platform].posts++;
        const metrics = post.post_metrics?.[0] || {};
        platformStats[post.platform].views += metrics.views || 0;
        platformStats[post.platform].likes += metrics.likes || 0;
        platformStats[post.platform].shares += metrics.shares || 0;
        platformStats[post.platform].comments += metrics.comments || 0;
      });

      // Calculate platform engagement rates
      Object.keys(platformStats).forEach(platform => {
        const stats = platformStats[platform];
        stats.engagementRate = stats.views > 0 ? 
          ((stats.likes + stats.shares + stats.comments) / stats.views * 100).toFixed(2) : 0;
      });

      // Top performing posts
      const topPosts = posts?.map(post => {
        const metrics = post.post_metrics?.[0] || {};
        const totalEngagement = (metrics.likes || 0) + (metrics.shares || 0) + (metrics.comments || 0);
        const views = metrics.views || 0;
        
        return {
          ...post,
          metrics,
          totalEngagement,
          performanceScore: totalEngagement + (views * 0.1),
          engagementRate: views > 0 ? (totalEngagement / views * 100).toFixed(2) : 0
        };
      }).sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 10) || [];

      // Daily metrics for chart
      const dailyMetrics = {};
      posts?.forEach(post => {
        const date = post.created_at.split('T')[0];
        if (!dailyMetrics[date]) {
          dailyMetrics[date] = { date, posts: 0, views: 0, engagement: 0 };
        }
        
        dailyMetrics[date].posts++;
        const metrics = post.post_metrics?.[0] || {};
        dailyMetrics[date].views += metrics.views || 0;
        dailyMetrics[date].engagement += (metrics.likes || 0) + (metrics.shares || 0) + (metrics.comments || 0);
      });

      return {
        summary: {
          totalPosts,
          totalViews,
          totalLikes,
          totalShares,
          totalComments,
          engagementRate,
          dateRange: {
            from: startDate.toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0],
            days
          }
        },
        platformStats,
        topPosts,
        dailyMetrics: Object.values(dailyMetrics).sort((a, b) => a.date.localeCompare(b.date)),
        connectedAccounts: accounts || []
      };

    } catch (error) {
      console.error('Error getting analytics data:', error);
      return null;
    }
  }

  // Generate HTML content for PDF report
  generateReportHTML(profile, data, options = {}) {
    const brandColor = options.brandColor || '#0891b2'; // Default to electric blue
    const logoUrl = options.logoUrl || '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Analytics Report - ${profile.email}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background: #fff;
            }
            
            .header {
                background: linear-gradient(135deg, ${brandColor}, #0c4a6e);
                color: white;
                padding: 40px 0;
                text-align: center;
                margin-bottom: 40px;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 0 20px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }
            
            .stat-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
            }
            
            .stat-number {
                font-size: 2.5em;
                font-weight: bold;
                color: ${brandColor};
                margin-bottom: 5px;
            }
            
            .stat-label {
                color: #64748b;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .section {
                margin-bottom: 40px;
            }
            
            .section-title {
                font-size: 1.8em;
                font-weight: bold;
                color: #1e293b;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid ${brandColor};
            }
            
            .platform-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .platform-card {
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
            }
            
            .platform-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .platform-icon {
                width: 24px;
                height: 24px;
                margin-right: 10px;
            }
            
            .platform-name {
                font-weight: bold;
                text-transform: capitalize;
                font-size: 1.1em;
            }
            
            .platform-metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .metric {
                text-align: center;
            }
            
            .metric-value {
                font-weight: bold;
                color: ${brandColor};
            }
            
            .metric-label {
                font-size: 0.8em;
                color: #64748b;
            }
            
            .top-posts {
                background: #f8fafc;
                border-radius: 8px;
                padding: 20px;
            }
            
            .post-item {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 15px;
            }
            
            .post-header {
                display: flex;
                justify-content: between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .post-platform {
                font-size: 0.8em;
                color: #64748b;
                text-transform: capitalize;
            }
            
            .post-date {
                font-size: 0.8em;
                color: #64748b;
            }
            
            .post-content {
                color: #374151;
                margin-bottom: 10px;
                line-height: 1.5;
            }
            
            .post-metrics {
                display: flex;
                gap: 20px;
                font-size: 0.9em;
            }
            
            .post-metric {
                color: #64748b;
            }
            
            .engagement-rate {
                color: ${brandColor};
                font-weight: bold;
            }
            
            .chart-placeholder {
                background: #f1f5f9;
                border: 2px dashed #cbd5e1;
                border-radius: 8px;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #64748b;
                font-style: italic;
            }
            
            .footer {
                background: #f8fafc;
                padding: 30px 0;
                text-align: center;
                color: #64748b;
                border-top: 1px solid #e2e8f0;
                margin-top: 40px;
            }
            
            .generated-info {
                font-size: 0.9em;
                margin-bottom: 10px;
            }
            
            .brand-info {
                font-size: 0.8em;
                opacity: 0.8;
            }
            
            @media print {
                .header {
                    break-inside: avoid;
                }
                
                .section {
                    break-inside: avoid;
                }
                
                .post-item {
                    break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="container">
                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 60px; margin-bottom: 20px;">` : ''}
                <h1>Analytics Report</h1>
                <p>${profile.email} • ${data?.summary?.dateRange?.from} to ${data?.summary?.dateRange?.to}</p>
            </div>
        </div>

        <div class="container">
            <!-- Summary Statistics -->
            <div class="section">
                <h2 class="section-title">Performance Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${this.formatNumber(data?.summary?.totalPosts || 0)}</div>
                        <div class="stat-label">Total Posts</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.formatNumber(data?.summary?.totalViews || 0)}</div>
                        <div class="stat-label">Total Views</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.formatNumber((data?.summary?.totalLikes || 0) + (data?.summary?.totalShares || 0) + (data?.summary?.totalComments || 0))}</div>
                        <div class="stat-label">Total Engagement</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${data?.summary?.engagementRate || 0}%</div>
                        <div class="stat-label">Engagement Rate</div>
                    </div>
                </div>
            </div>

            <!-- Platform Performance -->
            <div class="section">
                <h2 class="section-title">Platform Performance</h2>
                <div class="platform-stats">
                    ${Object.entries(data?.platformStats || {}).map(([platform, stats]) => `
                        <div class="platform-card">
                            <div class="platform-header">
                                <div class="platform-name">${platform}</div>
                            </div>
                            <div class="platform-metrics">
                                <div class="metric">
                                    <div class="metric-value">${stats.posts}</div>
                                    <div class="metric-label">Posts</div>
                                </div>
                                <div class="metric">
                                    <div class="metric-value">${this.formatNumber(stats.views)}</div>
                                    <div class="metric-label">Views</div>
                                </div>
                                <div class="metric">
                                    <div class="metric-value">${this.formatNumber(stats.likes + stats.shares + stats.comments)}</div>
                                    <div class="metric-label">Engagement</div>
                                </div>
                                <div class="metric">
                                    <div class="metric-value">${stats.engagementRate}%</div>
                                    <div class="metric-label">Rate</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Performance Trends -->
            <div class="section">
                <h2 class="section-title">Performance Trends</h2>
                <div class="chart-placeholder">
                    Performance chart visualization would appear here in an interactive version
                </div>
            </div>

            <!-- Top Performing Posts -->
            <div class="section">
                <h2 class="section-title">Top Performing Posts</h2>
                <div class="top-posts">
                    ${(data?.topPosts || []).slice(0, 5).map(post => `
                        <div class="post-item">
                            <div class="post-header">
                                <span class="post-platform">${post.platform}</span>
                                <span class="post-date">${new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <div class="post-content">
                                ${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}
                            </div>
                            <div class="post-metrics">
                                <span class="post-metric">👀 ${this.formatNumber(post.metrics?.views || 0)} views</span>
                                <span class="post-metric">❤️ ${this.formatNumber(post.metrics?.likes || 0)} likes</span>
                                <span class="post-metric">💬 ${this.formatNumber(post.metrics?.comments || 0)} comments</span>
                                <span class="engagement-rate">${post.engagementRate}% engagement</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Connected Accounts -->
            <div class="section">
                <h2 class="section-title">Connected Accounts</h2>
                <div class="platform-stats">
                    ${(data?.connectedAccounts || []).map(account => `
                        <div class="platform-card">
                            <div class="platform-header">
                                <div class="platform-name">${account.platform}</div>
                            </div>
                            <p><strong>Username:</strong> @${account.username}</p>
                            <p><strong>Connected:</strong> ${new Date(account.connected_at).toLocaleDateString()}</p>
                            <p><strong>Last Sync:</strong> ${account.last_sync_at ? new Date(account.last_sync_at).toLocaleDateString() : 'Never'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="container">
                <div class="generated-info">
                    Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                </div>
                <div class="brand-info">
                    🤖 Generated with Sloganizer Analytics • Powered by LaunchZone
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Format numbers for display
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  }

  // Generate Excel/CSV report
  async generateCSVReport(userId, options = {}) {
    try {
      const data = await this.getAnalyticsData(userId, options);
      
      if (!data) {
        throw new Error('Failed to get analytics data');
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Create CSV content
      const csvData = [];
      
      // Header
      csvData.push([
        'Report Generated For',
        profile?.email || 'Unknown',
        'Date Range',
        `${data.summary.dateRange.from} to ${data.summary.dateRange.to}`
      ]);
      csvData.push([]); // Empty row

      // Summary
      csvData.push(['SUMMARY STATISTICS']);
      csvData.push(['Metric', 'Value']);
      csvData.push(['Total Posts', data.summary.totalPosts]);
      csvData.push(['Total Views', data.summary.totalViews]);
      csvData.push(['Total Likes', data.summary.totalLikes]);
      csvData.push(['Total Shares', data.summary.totalShares]);
      csvData.push(['Total Comments', data.summary.totalComments]);
      csvData.push(['Engagement Rate', `${data.summary.engagementRate}%`]);
      csvData.push([]); // Empty row

      // Platform Stats
      csvData.push(['PLATFORM PERFORMANCE']);
      csvData.push(['Platform', 'Posts', 'Views', 'Likes', 'Shares', 'Comments', 'Engagement Rate']);
      Object.entries(data.platformStats).forEach(([platform, stats]) => {
        csvData.push([
          platform,
          stats.posts,
          stats.views,
          stats.likes,
          stats.shares,
          stats.comments,
          `${stats.engagementRate}%`
        ]);
      });
      csvData.push([]); // Empty row

      // Top Posts
      csvData.push(['TOP PERFORMING POSTS']);
      csvData.push(['Platform', 'Date', 'Content Preview', 'Views', 'Likes', 'Shares', 'Comments', 'Engagement Rate']);
      data.topPosts.slice(0, 10).forEach(post => {
        csvData.push([
          post.platform,
          new Date(post.created_at).toLocaleDateString(),
          post.content.substring(0, 100).replace(/"/g, '""'), // Escape quotes
          post.metrics?.views || 0,
          post.metrics?.likes || 0,
          post.metrics?.shares || 0,
          post.metrics?.comments || 0,
          `${post.engagementRate}%`
        ]);
      });

      // Convert to CSV string
      const csvString = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      return {
        success: true,
        content: csvString,
        filename: `analytics-report-${profile?.email || 'user'}-${new Date().toISOString().split('T')[0]}.csv`
      };

    } catch (error) {
      console.error('CSV generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const reportGenerator = new ReportGenerator();
export default reportGenerator;