const TransDashImage = "/TransDASH_Dashboard.png";
const AgencyTrackerImage = "/Agency_tracker.png";
const BenchmarkReportImage = "/Benchmark_Report.png";

export const projects = [
  {
    title: "Agency Performance Dashboard",
    description:
      "Interactive Tableau Dashboard analyzing performance metrics for U.S. transit agencies. Features real-time data updates, custom KPI tracking, and comparative analysis across 10+ agencies.",
    tech: ["Tableau", "SQL", "ETL", "API Integration", "PostgreSQL", "Kafka"],
    image: TransDashImage,
    hideGithub: true,
    features: [
      "Real-time data synchronization from multiple transit APIs",
      "Custom KPI tracking with automated alerts",
      "Comparative analysis across 10+ agencies",
      "Interactive drill-down capabilities",
      "Automated report generation",
      "Multi-modal transit data processing",
    ],
    impact:
      "Reduced reporting time by 60% and improved decision-making speed for transit operations managers across 15+ agencies.",
    codeSnippets: [
      {
        title: "ETL Pipeline - Performance Analysis",
        filename: "transit_performance_etl.sql",
        code: `-- ═══════════════════════════════════════════════════════════════
-- TRANSIT AGENCY PERFORMANCE ETL PIPELINE v2.4.1
-- ═══════════════════════════════════════════════════════════════
-- Processes multi-modal transit data with real-time aggregations
-- Last Updated: 2025-09-25 | Execution Time: ~847ms
-- ═══════════════════════════════════════════════════════════════

WITH raw_transit_events AS (
  -- Stage 1: Raw event stream ingestion 
  SELECT 
    event_id,
    agency_id,
    route_id,
    vehicle_id,
    service_date,
    event_timestamp,
    event_type,
    LAG(event_timestamp) OVER (
      PARTITION BY vehicle_id 
      ORDER BY event_timestamp
    ) as prev_event_time,
    geospatial_coords::geography as geo_point,
    passenger_load,
    fare_revenue_cents,
    weather_condition_code
  FROM transit_events_stream
  WHERE service_date >= CURRENT_DATE - INTERVAL '12 months'
    AND event_status != 'INVALID'
    AND agency_id IN (SELECT id FROM active_agencies)
),

trip_segments AS (
  -- Stage 2: Trip segmentation with dwell time calculations
  SELECT
    agency_id,
    route_id,
    vehicle_id,
    service_date,
    date_trunc('month', service_date) as reporting_month,
    COUNT(DISTINCT event_id) as stop_count,
    SUM(passenger_load) as total_boardings,
    SUM(fare_revenue_cents) / 100.0 as fare_revenue_usd,
    EXTRACT(EPOCH FROM (
      MAX(event_timestamp) - MIN(event_timestamp)
    )) / 60.0 as trip_duration_minutes,
    AVG(EXTRACT(EPOCH FROM (
      event_timestamp - prev_event_time
    )) / 60.0) as avg_dwell_time_minutes,
    ST_MakeLine(ARRAY_AGG(geo_point ORDER BY event_timestamp)) as trip_linestring
  FROM raw_transit_events
  WHERE event_type IN ('DEPARTURE', 'ARRIVAL')
  GROUP BY agency_id, route_id, vehicle_id, service_date, reporting_month
),

schedule_adherence AS (
  -- Stage 3: On-time performance analysis with schedule joins
  SELECT 
    ts.agency_id,
    ts.reporting_month,
    ts.route_id,
    ts.vehicle_id,
    ts.service_date,
    ts.trip_duration_minutes,
    ss.scheduled_duration_minutes,
    CASE 
      WHEN ABS(ts.trip_duration_minutes - ss.scheduled_duration_minutes) <= 5 
        THEN 'ON_TIME'
      WHEN ts.trip_duration_minutes > ss.scheduled_duration_minutes 
        THEN 'DELAYED'
      ELSE 'EARLY'
    END as adherence_status,
    ABS(ts.trip_duration_minutes - ss.scheduled_duration_minutes) as deviation_minutes
  FROM trip_segments ts
  INNER JOIN scheduled_services ss 
    ON ts.route_id = ss.route_id 
    AND ts.service_date = ss.service_date
    AND ts.vehicle_id = ss.vehicle_id
),

service_alerts_agg AS (
  -- Stage 4: Service disruption and alert aggregation
  SELECT 
    agency_id,
    date_trunc('month', alert_timestamp) as reporting_month,
    COUNT(DISTINCT alert_id) as total_alerts,
    SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_alerts,
    SUM(CASE WHEN severity = 'WARNING' THEN 1 ELSE 0 END) as warning_alerts,
    SUM(affected_routes_count) as total_affected_routes,
    AVG(resolution_time_minutes) as avg_resolution_time
  FROM service_alerts
  WHERE alert_timestamp >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY agency_id, reporting_month
),

ridership_metrics AS (
  -- Stage 5: Ridership and revenue calculations
  SELECT
    agency_id,
    reporting_month,
    SUM(total_boardings) as monthly_ridership,
    SUM(fare_revenue_usd) as monthly_revenue,
    AVG(total_boardings) as avg_daily_ridership,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY total_boardings
    ) as median_daily_ridership,
    COUNT(DISTINCT route_id) as active_routes,
    COUNT(DISTINCT vehicle_id) as active_vehicles
  FROM trip_segments
  GROUP BY agency_id, reporting_month
),

performance_scores AS (
  -- Stage 6: Composite performance scoring algorithm
  SELECT
    sa.agency_id,
    sa.reporting_month,
    rm.monthly_ridership,
    rm.monthly_revenue,
    rm.active_routes,
    rm.active_vehicles,
    saa.total_alerts,
    saa.critical_alerts,
    (COUNT(CASE WHEN adherence_status = 'ON_TIME' THEN 1 END)::FLOAT / 
     NULLIF(COUNT(*), 0) * 100) as on_time_percentage,
    AVG(deviation_minutes) as avg_schedule_deviation,
    -- Weighted composite score (0-100 scale)
    (
      (COUNT(CASE WHEN adherence_status = 'ON_TIME' THEN 1 END)::FLOAT / 
       NULLIF(COUNT(*), 0) * 40) +
      (LEAST(rm.monthly_ridership / 100000.0, 1) * 30) +
      (GREATEST(1 - (saa.critical_alerts / 10.0), 0) * 20) +
      (LEAST(rm.monthly_revenue / 500000.0, 1) * 10)
    ) as composite_performance_score
  FROM schedule_adherence sa
  LEFT JOIN ridership_metrics rm 
    ON sa.agency_id = rm.agency_id 
    AND sa.reporting_month = rm.reporting_month
  LEFT JOIN service_alerts_agg saa
    ON sa.agency_id = saa.agency_id 
    AND sa.reporting_month = saa.reporting_month
  GROUP BY 
    sa.agency_id, 
    sa.reporting_month, 
    rm.monthly_ridership,
    rm.monthly_revenue,
    rm.active_routes,
    rm.active_vehicles,
    saa.total_alerts,
    saa.critical_alerts
),

trend_analysis AS (
  -- Stage 7: Time-series trend detection and forecasting
  SELECT
    agency_id,
    reporting_month,
    composite_performance_score,
    LAG(composite_performance_score, 1) OVER w as prev_month_score,
    LAG(composite_performance_score, 3) OVER w as three_months_ago_score,
    AVG(composite_performance_score) OVER (
      PARTITION BY agency_id 
      ORDER BY reporting_month 
      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as rolling_3month_avg,
    composite_performance_score - LAG(composite_performance_score, 1) OVER w as mom_change,
    RANK() OVER (
      PARTITION BY reporting_month 
      ORDER BY composite_performance_score DESC
    ) as performance_rank
  FROM performance_scores
  WINDOW w AS (PARTITION BY agency_id ORDER BY reporting_month)
)

-- Final Output: Enriched performance dashboard dataset
SELECT 
  ta.*,
  ag.agency_name,
  ag.region,
  ag.transit_mode,
  CASE 
    WHEN ta.mom_change > 5 THEN 'Improving'
    WHEN ta.mom_change < -5 THEN 'Declining'
    ELSE 'Stable'
  END as trend_indicator,
  CASE
    WHEN ta.composite_performance_score >= 80 THEN 'Excellent'
    WHEN ta.composite_performance_score >= 60 THEN 'Good'
    WHEN ta.composite_performance_score >= 40 THEN 'Fair'
    ELSE 'Needs Improvement'
  END as performance_tier
FROM trend_analysis ta
LEFT JOIN agencies ag ON ta.agency_id = ag.id
WHERE ta.reporting_month >= CURRENT_DATE - INTERVAL '12 months'
ORDER BY ta.reporting_month DESC, ta.performance_rank ASC;`,
      },
    ],
    liveUrl:
      "https://public.tableau.com/views/TransDASH_Agency_LTD_REDESIGN/Overview?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
  },
  {
    title: "Agency Metric Tracker",
    description:
      "Automated reporting system built with Google Apps Script that syncs CSV data, processes metrics, and generates weekly performance reports. Reduced manual reporting time by 75%.",
    tech: ["Google Apps Script", "JavaScript", "CSV Processing", "Automation"],
    image: AgencyTrackerImage,
    features: [
      "Automated CSV data ingestion from Google Drive",
      "Real-time data validation and quality checks",
      "Complex metric calculations and aggregations",
      "Automated weekly report generation and distribution",
      "Custom alert system for anomaly detection",
      "Multi-agency performance tracking and benchmarking",
    ],
    impact:
      "Reduced manual reporting time by 75%, enabling the team to process 300+ metrics weekly with zero errors and instant stakeholder notifications.",
    codeSnippets: [
      {
        title: "Metric Processing Engine",
        filename: "metric_processor.gs",
        code: `// ═══════════════════════════════════════════════════════════════
// AGENCY METRIC TRACKER v3.2.0
// ═══════════════════════════════════════════════════════════════
// Automated metric processing and reporting system
// Handles 300+ metrics across 15+ transit agencies weekly
// Last Updated: 2025-08-12
// ═══════════════════════════════════════════════════════════════

// Configuration object for system-wide settings
const CONFIG = {
  folders: {
    raw_data: '1AbC123XyZ-RawDataFolderID',
    processed: '1XyZ456AbC-ProcessedFolderID',
    reports: '1DeF789GhI-ReportsFolderID',
    archive: '1JkL012MnO-ArchiveFolderID'
  },
  spreadsheets: {
    metric_definitions: '1PqR345StU-MetricDefsSheetID',
    agency_roster: '1VwX678YzA-AgencyRosterSheetID',
    output_dashboard: '1BcD901EfG-OutputDashboardID'
  },
  email: {
    recipients: ['operations@agency.com', 'analytics@agency.com'],
    cc: ['leadership@agency.com'],
    subject_prefix: '[Auto] Weekly Metrics Report'
  },
  processing: {
    batch_size: 1000,
    max_retries: 3,
    timeout_seconds: 300,
    validation: {
      required_fields: ['agency_id', 'metric_type', 'date', 'value'],
      date_range: 365,
      outlier_detection: true
    }
  },
  alerts: {
    thresholds: {
      on_time_performance: 85,
      service_reliability: 90,
      customer_satisfaction: 4.0
    },
    notification_delay_hours: 2
  }
};

// ═══════════════════════════════════════════════════════════════

/**
 * Main metric processing orchestrator
 * Processes all incoming metric data and generates insights
 */
function processMetrics() {
  const processingStart = new Date();
  console.log(\`Starting metric processing cycle at \${processingStart}\`);
  
  try {
    // Step 1: Load and validate raw data
    const rawData = loadRawMetricData();
    console.log(\`Loaded \${rawData.length} raw metric records\`);
    
    // Step 2: Data quality validation
    const validatedData = validateMetricData(rawData);
    console.log(\`Validated \${validatedData.valid.length} records, \${validatedData.invalid.length} rejected\`);
    
    // Step 3: Calculate derived metrics
    const processedMetrics = calculateDerivedMetrics(validatedData.valid);
    
    // Step 4: Generate aggregations
    const aggregatedData = generateAggregations(processedMetrics);
    
    // Step 5: Update dashboards and reports
    updateDashboards(aggregatedData);
    
    // Step 6: Check for alert conditions
    checkAlertConditions(processedMetrics);
    
    const processingEnd = new Date();
    const duration = (processingEnd - processingStart) / 1000;
    
    console.log(\`Metric processing completed in \${duration} seconds\`);
    
    return {
      processed: processedMetrics.length,
      duration: duration,
      timestamp: processingEnd
    };
    
  } catch (error) {
    console.error('Metric processing failed:', error);
    sendAlert('processing_error', error.message);
    throw error;
  }
}

/**
 * Calculates derived performance metrics from base data
 * Implements complex business logic for transit KPIs
 */
function calculateDerivedMetrics(validData) {
  const derivedMetrics = [];
  
  // Group data by agency and date for processing
  const groupedData = groupByAgencyAndDate(validData);
  
  Object.keys(groupedData).forEach(agencyId => {
    Object.keys(groupedData[agencyId]).forEach(date => {
      const dayData = groupedData[agencyId][date];
      
      // Calculate On-Time Performance (OTP)
      const otpMetric = calculateOnTimePerformance(dayData);
      if (otpMetric) derivedMetrics.push(otpMetric);
      
      // Calculate Service Reliability Index (SRI)
      const sriMetric = calculateServiceReliability(dayData);
      if (sriMetric) derivedMetrics.push(sriMetric);
      
      // Calculate Passenger Miles per Revenue Hour
      const efficiencyMetric = calculateOperationalEfficiency(dayData);
      if (efficiencyMetric) derivedMetrics.push(efficiencyMetric);
      
      // Calculate Cost per Passenger Mile
      const costMetric = calculateCostEfficiency(dayData);
      if (costMetric) derivedMetrics.push(costMetric);
      
      // Calculate Customer Satisfaction Index
      const satisfactionMetric = calculateSatisfactionIndex(dayData);
      if (satisfactionMetric) derivedMetrics.push(satisfactionMetric);
    });
  });
  
  return derivedMetrics;
}

/**
 * Validates incoming metric data against business rules
 * Ensures data quality before processing
 */
function validateMetricData(rawData) {
  const valid = [];
  const invalid = [];
  
  rawData.forEach((record, index) => {
    const validationErrors = [];
    
    // Required field validation
    CONFIG.processing.validation.required_fields.forEach(field => {
      if (!record[field] || record[field] === '') {
        validationErrors.push(\`Missing required field: \${field}\`);
      }
    });
    
    // Date range validation
    const recordDate = new Date(record.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.processing.validation.date_range);
    
    if (recordDate < cutoffDate) {
      validationErrors.push('Record date outside acceptable range');
    }
    
    // Numeric value validation
    if (record.value && isNaN(parseFloat(record.value))) {
      validationErrors.push('Invalid numeric value');
    }
    
    // Outlier detection
    if (CONFIG.processing.validation.outlier_detection) {
      if (isOutlier(record.value, record.metric_type)) {
        validationErrors.push('Value flagged as statistical outlier');
      }
    }
    
    // Agency ID validation
    if (!isValidAgencyId(record.agency_id)) {
      validationErrors.push('Invalid agency identifier');
    }
    
    if (validationErrors.length === 0) {
      valid.push(record);
    } else {
      invalid.push({
        record: record,
        errors: validationErrors,
        index: index
      });
    }
  });
  
  // Log validation summary
  if (invalid.length > 0) {
    console.warn(\`Data validation found \${invalid.length} invalid records\`);
    invalid.forEach(item => {
      console.warn(\`Record \${item.index}: \${item.errors.join(', ')}\`);
    });
  }
  
  return { valid, invalid };
}

/**
 * Generates time-based aggregations for reporting
 * Creates daily, weekly, monthly, and quarterly summaries
 */
function generateAggregations(processedMetrics) {
  const aggregations = {
    daily: {},
    weekly: {},
    monthly: {},
    quarterly: {}
  };
  
  // Group metrics by time periods
  processedMetrics.forEach(metric => {
    const date = new Date(metric.date);
    const agency = metric.agency_id;
    
    // Daily aggregation
    const dayKey = formatDate(date, 'YYYY-MM-DD');
    if (!aggregations.daily[dayKey]) aggregations.daily[dayKey] = {};
    if (!aggregations.daily[dayKey][agency]) aggregations.daily[dayKey][agency] = [];
    aggregations.daily[dayKey][agency].push(metric);
    
    // Weekly aggregation
    const weekKey = getWeekKey(date);
    if (!aggregations.weekly[weekKey]) aggregations.weekly[weekKey] = {};
    if (!aggregations.weekly[weekKey][agency]) aggregations.weekly[weekKey][agency] = [];
    aggregations.weekly[weekKey][agency].push(metric);
    
    // Monthly aggregation
    const monthKey = formatDate(date, 'YYYY-MM');
    if (!aggregations.monthly[monthKey]) aggregations.monthly[monthKey] = {};
    if (!aggregations.monthly[monthKey][agency]) aggregations.monthly[monthKey][agency] = [];
    aggregations.monthly[monthKey][agency].push(metric);
  });
  
  return aggregations;
}`,
      },
    ],
  },
  {
    title: "Peer Analysis Project",
    description:
      "Automated quarterly reporting system that fetches performance data from internal APIs, calculates peer group rankings and trends, then generates and emails interactive HTML reports to stakeholders. Eliminated 20+ hours of manual work per quarter.",
    tech: [
      "Google Apps Script",
      "JavaScript",
      "HTML5",
      "CSS3",
      "API",
      "Automation",
    ],
    image: BenchmarkReportImage,
    features: [
      "Fetches and parses JSON data from an internal performance API.",
      "Processes raw data to calculate peer group averages, agency rankings, and historical trends.",
      "Dynamically generates a rich, single-page HTML report from a template.",
      "Embeds CSS within the HTML for a polished, professional, and interactive report layout.",
      "Automatically emails the final HTML report to a stakeholder distribution list.",
      "Runs on an automated, time-based trigger to ensure timely delivery every quarter.",
    ],
    impact:
      "Eliminated 20+ hours of manual data collection and report-building each quarter. The automated system provides timely, interactive data to leadership, enabling faster and more consistent strategic decision-making.",
    codeSnippets: [
      {
        title: "Automated Report Generator",
        language: "javascript",
        gistUrl:
          "https://gist.github.com/jraharris89/f2f5c9746ea55fcc07c3669a4c514da8",
        code: "// Loading code from GitHub Gist...",
      },
    ],
  },
];
