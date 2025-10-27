import React, { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import { Menu, X, BarChart3, Mail, Download, ChevronDown } from "lucide-react";
import Counter from "./components/Counter";
import { useTypewriter } from "./hooks/useTypewriter";
import { BackgroundGradient } from "./components/BackgroundGradient";
import ParticlesBackground from "./components/ParticlesBackground";
import ScatterOrganizeAnimationGSAP from "./components/ScatterOrganizeAnimationGSAP";
import ProjectModal from "./components/ProjectModal";

// Images from public folder
const TransDashImage = "/TransDASH_Dashboard.png";
const AgencyTrackerImage = "/Agency_tracker.png";
const BenchmarkReportImage = "/Benchmark_Report.png";
const LogoImage = "/Olive_Logo.png";
const ProfilePic = "/profile_pic.jpg";

// Initialize Google Analytics
ReactGA.initialize("G-1DRREDB0CY");

export default function Portfolio() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);

  const greetings = [
    "Hi, I'm Jon",
    "Hola, soy Jon",
    "Bonjour, je suis Jon",
    "Hallo, ich bin Jon",
    "Ciao, sono Jon",
    "こんにちは、ジョンです",
  ];

  // Use the custom typewriter hook
  const typedText = useTypewriter(greetings);

  useEffect(() => {
    // Track page view
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 50);

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      setLastScrollY(currentScrollY);

      const sections = ["hero", "projects", "about", "contact"];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const projects = [
    {
      title: "Agency Performance Dashboard",
      description:
        "Interactive Tableau Dashboard analyzing performance metrics for U.S. transit agencies. Features real-time data updates, custom KPI tracking, and comparative analysis across 10+ agencies.",
      tech: ["Tableau", "SQL", "ETL", "API Integration", "PostgreSQL", "Kafka"],
      image: TransDashImage,
      hideGithub: true, // This will hide the View Code button
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
      tech: [
        "Google Apps Script",
        "JavaScript",
        "CSV Processing",
        "Automation",
      ],
      image: AgencyTrackerImage,
      features: [
        "Automated CSV data synchronization from multiple sources",
        "Real-time metric calculation and validation",
        "Quarterly rollover automation with data archiving",
        "Weekly performance report generation",
        "Email notification system for stakeholders",
        "Error handling and data quality monitoring",
      ],
      impact:
        "Reduced manual reporting time by 75% and eliminated human error in quarterly data transitions. Automated system now processes 500+ metrics weekly across 12+ transit agencies.",
      codeSnippets: [
        {
          title: "Configuration Hub",
          filename: "config.js",
          language: "JavaScript",
          gistUrl:
            "https://gist.github.com/jraharris89/f3d2efc43d8bf8cde1cb49cfb2cbb313",
          code: `// ═══════════════════════════════════════════════════════════════
// AGENCY METRIC TRACKER - CONFIGURATION HUB v3.2.1
// ═══════════════════════════════════════════════════════════════
// Central configuration management for automated reporting system
// Last Updated: 2025-08-15 | Runtime: Google Apps Script
// ═══════════════════════════════════════════════════════════════

/**
 * Master configuration object for Agency Metric Tracker
 * Controls data sources, processing rules, and notification settings
 */
const CONFIG = {
  // Data Source Configuration
  dataSources: {
    primarySpreadsheet: '1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T',
    backupSpreadsheet: '9S0T8R7Q6P5O4N3M2L1K0J9I8H7G6F5E4D3C2B1A',
    
    // CSV Import Settings
    csvSources: [
      {
        name: 'ridership_data',
        url: 'https://api.transit.gov/v1/ridership/export',
        refreshInterval: 24, // hours
        apiKey: PropertiesService.getScriptProperties().getProperty('TRANSIT_API_KEY')
      },
      {
        name: 'performance_metrics',
        url: 'https://data.transit.local/metrics/weekly.csv',
        refreshInterval: 168, // weekly
        authType: 'bearer'
      }
    ]
  },

  // Processing Rules
  processing: {
    // Metric calculation thresholds
    thresholds: {
      onTimePerformance: 0.85,
      ridership_variance: 0.15,
      revenue_target: 0.92
    },
    
    // Data validation rules
    validation: {
      required_fields: ['agency_id', 'date', 'metric_type', 'value'],
      date_range: 90, // days back from current
      outlier_detection: true
    }
  },

  // Notification Settings
  notifications: {
    recipients: [
      'operations@transit.agency.gov',
      'analytics@transit.agency.gov',
      'reporting@transit.agency.gov'
    ],
    
    triggers: {
      data_quality_alert: true,
      weekly_report_ready: true,
      quarterly_rollover: true,
      processing_error: true
    },
    
    email_templates: {
      weekly_report: 'weekly_performance_template',
      alert: 'data_alert_template',
      quarterly: 'quarterly_summary_template'
    }
  }
};

/**
 * Initialize configuration on script startup
 * Validates settings and establishes connections
 */
function initializeConfig() {
  try {
    // Validate required properties
    const requiredProps = ['TRANSIT_API_KEY', 'EMAIL_SERVICE_KEY'];
    const properties = PropertiesService.getScriptProperties();
    
    requiredProps.forEach(prop => {
      if (!properties.getProperty(prop)) {
        throw new Error(\`Missing required property: \${prop}\`);
      }
    });

    // Test spreadsheet connections
    validateSpreadsheetAccess();
    
    // Initialize logging
    console.log('Configuration initialized successfully');
    return true;
    
  } catch (error) {
    console.error('Configuration initialization failed:', error);
    sendAlert('config_error', error.message);
    return false;
  }
}`,
        },
        {
          title: "Quarterly Rollover Automation",
          filename: "quarterly_rollover.js",
          language: "JavaScript",
          gistUrl:
            "https://gist.github.com/jraharris89/2a0e5e1e239dfca55cda72d99f8a7b26",
          code: `// ═══════════════════════════════════════════════════════════════
// QUARTERLY ROLLOVER AUTOMATION MODULE v2.8.3
// ═══════════════════════════════════════════════════════════════
// Handles automated quarterly data transitions and archival
// Execution: Triggered on quarter-end via time-based trigger
// ═══════════════════════════════════════════════════════════════

/**
 * Main quarterly rollover orchestrator
 * Manages the complete transition process from Q to Q+1
 */
function executeQuarterlyRollover() {
  const startTime = new Date();
  console.log(\`Starting quarterly rollover at \${startTime}\`);
  
  try {
    // Phase 1: Pre-rollover validation
    const validationResult = validateQuarterlyData();
    if (!validationResult.success) {
      throw new Error(\`Pre-rollover validation failed: \${validationResult.errors.join(', ')}\`);
    }
    
    // Phase 2: Archive current quarter data
    const archiveResult = archiveCurrentQuarter();
    console.log(\`Archive completed: \${archiveResult.recordsArchived} records\`);
    
    // Phase 3: Initialize new quarter structure
    const initResult = initializeNewQuarter();
    console.log(\`New quarter initialized: Q\${initResult.quarter} \${initResult.year}\`);
    
    // Phase 4: Update configuration for new period
    updateQuarterlyConfig(initResult.quarter, initResult.year);
    
    // Phase 5: Generate transition report
    const report = generateRolloverReport(startTime, {
      archived: archiveResult.recordsArchived,
      quarter: initResult.quarter,
      year: initResult.year
    });
    
    // Phase 6: Notify stakeholders
    sendRolloverNotifications(report);
    
    console.log('Quarterly rollover completed successfully');
    
  } catch (error) {
    console.error('Quarterly rollover failed:', error);
    sendAlert('rollover_error', \`Rollover failed: \${error.message}\`);
    throw error;
  }
}

/**
 * Archives current quarter data to historical sheets
 * Maintains data integrity while freeing up active workspace
 */
function archiveCurrentQuarter() {
  const ss = SpreadsheetApp.openById(CONFIG.dataSources.primarySpreadsheet);
  const currentDate = new Date();
  const quarter = Math.floor((currentDate.getMonth() + 3) / 3);
  const year = currentDate.getFullYear();
  
  // Create archive sheet name
  const archiveSheetName = \`Archive_Q\${quarter}_\${year}\`;
  
  // Get active data ranges
  const activeSheets = ['Ridership', 'Performance', 'Revenue', 'Operations'];
  let totalRecords = 0;
  
  activeSheets.forEach(sheetName => {
    const sourceSheet = ss.getSheetByName(sheetName);
    const dataRange = sourceSheet.getDataRange();
    const data = dataRange.getValues();
    
    // Create archive sheet if it doesn't exist
    let archiveSheet = ss.getSheetByName(\`\${archiveSheetName}_\${sheetName}\`);
    if (!archiveSheet) {
      archiveSheet = ss.insertSheet(\`\${archiveSheetName}_\${sheetName}\`);
    }
    
    // Copy data to archive
    if (data.length > 1) { // Skip if only headers
      archiveSheet.clear();
      archiveSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      totalRecords += data.length - 1; // Exclude header row
    }
    
    // Clear source sheet (keep headers)
    if (data.length > 1) {
      sourceSheet.getRange(2, 1, data.length - 1, data[0].length).clear();
    }
  });
  
  return {
    recordsArchived: totalRecords,
    archiveSheets: activeSheets.map(sheet => \`\${archiveSheetName}_\${sheet}\`)
  };
}

/**
 * Sets up data structure for the new quarter
 * Initializes templates and resets counters
 */
function initializeNewQuarter() {
  const currentDate = new Date();
  const newQuarter = Math.floor((currentDate.getMonth() + 3) / 3);
  const newYear = currentDate.getFullYear();
  
  // Reset quarterly counters
  const ss = SpreadsheetApp.openById(CONFIG.dataSources.primarySpreadsheet);
  const configSheet = ss.getSheetByName('Config');
  
  // Update quarter tracking
  configSheet.getRange('B2').setValue(\`Q\${newQuarter}\`);
  configSheet.getRange('B3').setValue(newYear);
  configSheet.getRange('B4').setValue(new Date()); // Last rollover date
  
  // Initialize quarterly targets
  initializeQuarterlyTargets(newQuarter, newYear);
  
  return {
    quarter: newQuarter,
    year: newYear,
    initialized: true
  };
}`,
        },
        {
          title: "Metric Processor",
          filename: "metric_processor.js",
          language: "JavaScript",
          gistUrl:
            "https://gist.github.com/jraharris89/b6de8d9b753564ea2fdfc396b8e60535",
          code: `// ═══════════════════════════════════════════════════════════════
// METRIC PROCESSOR ENGINE v4.1.2
// ═══════════════════════════════════════════════════════════════
// Core processing engine for transit agency performance metrics
// Handles calculation, validation, and aggregation workflows
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

  // Track when someone opens a project modal
  const openProjectModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);

    ReactGA.event({
      category: "Project",
      action: "View Details",
      label: project.title,
    });
  };

  // Track when someone downloads resume
  const trackResumeDownload = () => {
    ReactGA.event({
      category: "Contact",
      action: "Download Resume",
    });
  };

  // Track when someone clicks email
  const trackEmailClick = () => {
    ReactGA.event({
      category: "Contact",
      action: "Click Email",
    });
  };

  const closeProjectModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-bg-accent flex items-center justify-center z-[9999]">
        <div className="w-[60px] h-[60px] border-4 border-olive-900 border-t-olive-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-100 bg-bg-primary">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out backdrop-blur-md bg-bg-primary/30 ${
          scrollDirection === "down" && isScrolled
            ? "-translate-y-full"
            : "translate-y-0"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 sm:py-5 flex justify-between items-center">
          <div
            onClick={() => scrollToSection("hero")}
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-olive-900 to-olive-950 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform overflow-hidden"
          >
            <img
              src={LogoImage}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden bg-transparent border-none text-text-secondary cursor-pointer p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <ul
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row absolute md:relative top-[70px] sm:top-[80px] md:top-0 left-0 right-0 md:left-auto md:right-auto bg-bg-primary/98 md:bg-transparent gap-4 sm:gap-5 md:gap-10 list-none items-center p-4 sm:p-5 md:p-0 shadow-lg md:shadow-none`}
          >
            {["hero", "projects", "about", "contact"].map((section) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section);
                  }}
                  className={`${
                    activeSection === section
                      ? "text-text-secondary"
                      : "text-text-muted"
                  } no-underline text-sm sm:text-base font-medium capitalize transition-all duration-300 cursor-pointer relative py-2 hover:text-text-secondary hover:[text-shadow:0_0_4px_rgba(212,222,149,0.6)]`}
                >
                  {section === "hero" ? "Home" : section}
                  {activeSection === section && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-secondary rounded-sm" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-5 pattern-bg bg-bg-primary"
      >
        <ParticlesBackground />
        <div className="max-w-4xl text-center relative z-10 animate-in fade-in duration-800">
          {/* Typing Animation */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold typing-cursor inline-block min-h-[50px] sm:min-h-[60px] gradient-text-animated">
              {typedText}
            </h1>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 leading-tight text-text-muted px-4 sm:px-0">
            Data Analyst & Developer
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-text-muted max-w-3xl mx-auto mb-10 sm:mb-12 font-normal px-4 sm:px-0">
            I turn data into action—designing automated workflows, building
            dashboards and websites that surface critical insights, and
            analyzing trends that help teams make smarter, faster decisions.
          </p>

          <div className="flex gap-6 sm:gap-10 md:gap-16 justify-center mb-10 sm:mb-12 flex-wrap px-4 sm:px-0">
            {[
              { target: 3, suffix: "+", label: "Years Experience" },
              { target: 15, suffix: "+", label: "Dashboards Built" },
              { target: 20, suffix: "+", label: "Agencies Served" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-text-secondary mb-2">
                  <Counter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-text-muted font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 sm:gap-5 justify-center flex-wrap px-4 sm:px-0">
            <a
              href="/resume/Jonathon_Harris_DataEngineer.pdf"
              download="Jonathon_Harris_DataEngineer.pdf"
              onClick={trackResumeDownload}
              className="inline-flex items-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 bg-gradient-to-br from-olive-900 to-olive-950 text-text-secondary border-none rounded-xl text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 shadow-lg shadow-olive-900/30 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3),0_10px_30px_rgba(99,107,47,0.4)] no-underline"
            >
              <Download size={18} />
              Download Resume
            </a>
            <div className="group">
              <div className="relative rounded-xl p-[1px] bg-gradient-to-r from-olive-900 via-olive-300 to-olive-900 opacity-60 group-hover:opacity-100 transition-all duration-500 animate-gradient bg-[length:200%_200%] group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)]">
                <button
                  onClick={() => scrollToSection("contact")}
                  className="px-7 sm:px-9 py-3.5 sm:py-4 bg-bg-primary text-text-secondary border-none rounded-[11px] text-sm sm:text-base font-semibold cursor-pointer transition-all duration-300 hover:text-white hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] w-full"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => scrollToSection("projects")}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer opacity-60 animate-bounce-slow"
        >
          <ChevronDown size={32} className="text-text-secondary" />
        </div>
      </section>

      {/* Transition Section - Desktop Only */}
      <div className="hidden md:block">
        <ScatterOrganizeAnimationGSAP />
      </div>

      {/* Projects Section */}
      <section
        id="projects"
        className="py-20 sm:py-24 px-4 sm:px-5 bg-bg-primary"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 text-center gradient-text">
            Featured Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {projects.map((project, idx) => (
              <div key={idx} className="group h-full">
                {/* Animated border gradient wrapper */}
                <div className="relative h-full rounded-3xl p-[3px] opacity-60 group-hover:opacity-100 transition-all duration-500 animate-border-spin group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)] animated-border-gradient">
                  {/* Card content */}
                  <div className="relative h-full bg-bg-overlay rounded-3xl overflow-hidden">
                    {/* Image/Icon Section with Gradient Background */}
                    <div className="relative h-48 bg-gradient-to-br from-olive-900 via-olive-800 to-olive-900 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                      {project.image ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Container styling for non-hover state */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 group-hover:opacity-0 transition-opacity duration-300 w-[136px] h-[136px]"></div>
                          </div>
                          {/* Single image that scales from small to large */}
                          <img
                            src={project.image}
                            alt={project.title}
                            className="relative z-10 w-24 h-24 object-contain opacity-80 mix-blend-luminosity group-hover:w-full group-hover:h-full group-hover:object-cover group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700 ease-out"
                          />
                        </div>
                      ) : (
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <div className="text-6xl">{project.emoji}</div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-5 sm:p-6 flex flex-col h-[calc(100%-12rem)]">
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 text-text-secondary group-hover:text-white group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] transition-all duration-300">
                        {project.title}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed mb-4 flex-grow">
                        {project.description}
                      </p>

                      {/* Tech Stack Pills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2.5 sm:px-3 py-1 bg-olive-900/10 rounded-full text-xs text-text-secondary font-medium border border-olive-900/30"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* View Details Link */}
                      <button
                        onClick={() => openProjectModal(project)}
                        className="w-full mt-2 py-2.5 rounded-xl bg-olive-900/10 hover:bg-olive-900/20 text-text-secondary text-sm font-semibold flex items-center justify-center gap-2 transition-all group-hover:gap-3 border border-olive-900/30"
                      >
                        View Details
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 sm:py-24 px-4 sm:px-5 pattern-bg bg-gradient-to-b from-bg-primary to-bg-secondary"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center gradient-text">
                About Me
              </h2>
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-olive-900 to-olive-950 flex items-center justify-center border-2 border-text-secondary/30 overflow-hidden">
                  <img
                    src={ProfilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-base sm:text-lg leading-relaxed text-text-muted mb-5">
                I'm a Portland-based data analyst with over 3 years of
                experience solving complex operational challenges through data.
                I build performance dashboards, automate workflows, and surface
                insights that drive strategic decisions—specializing in systems
                where timing, efficiency, and scale matter.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-text-muted mb-8">
                I work across the full data stack—engineering pipelines,
                analyzing patterns, and designing interactive visualizations—to
                build solutions that turn technical complexity into clear,
                actionable strategy.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  "SQL",
                  "Python",
                  "R",
                  "Tableau",
                  "Power BI",
                  "Google Apps Script",
                  "ETL",
                  "Automation",
                  "Data Modeling",
                  "Statistical Analysis",
                  "AWS",
                  "Snowflake",
                  "APIs",
                  "React",
                  "JavaScript",
                ].map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-olive-900/20 border border-olive-900/40 rounded-lg text-text-secondary text-xs sm:text-sm font-medium hover:bg-olive-900/30 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 sm:py-24 px-4 sm:px-5 bg-bg-primary"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 gradient-text">
            Let's Connect
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-text-muted mb-10 sm:mb-12 max-w-2xl mx-auto">
            I'm currently seeking full-time opportunities to build impactful
            data solutions. If you're looking for someone who can handle
            everything from pipeline engineering to strategic insights, I'd love
            to hear from you.
          </p>

          <div className="flex gap-4 sm:gap-5 justify-center mb-8 sm:mb-10 flex-wrap">
            <a
              href="mailto:jonra.harris@gmail.com"
              onClick={trackEmailClick}
              className="w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 bg-gradient-to-br from-olive-900 to-olive-950 text-text-secondary no-underline rounded-xl text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-olive-900/30 hover:-translate-y-0.5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3),0_10px_30px_rgba(99,107,47,0.4)]"
            >
              <Mail size={20} />
              Send Email
            </a>
            <div className="group inline-block w-full sm:w-auto">
              <div className="relative rounded-xl p-[1px] bg-gradient-to-r from-olive-900 via-olive-300 to-olive-900 opacity-60 group-hover:opacity-100 transition-all duration-500 animate-gradient bg-[length:200%_200%] group-hover:shadow-[0_0_20px_rgba(212,222,149,0.4)]">
                <a
                  href="/resume/Jonathon_Harris_DataEngineer.pdf"
                  download
                  className="px-7 sm:px-9 py-3.5 sm:py-4 bg-bg-primary text-text-secondary no-underline rounded-[11px] text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2.5 transition-all duration-300 hover:text-white hover:[text-shadow:0_0_8px_rgba(255,255,255,0.3)] w-full"
                >
                  <Download size={20} />
                  Download Resume
                </a>
              </div>
            </div>
          </div>

          <div className="flex gap-5 justify-center">
            {[
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                ),
                href: "https://github.com/jraharris89",
                label: "GitHub",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                ),
                href: "https://linkedin.com/in/jon-harris001/",
                label: "LinkedIn",
              },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-12 h-12 rounded-full bg-olive-900/20 border border-olive-900/40 flex items-center justify-center text-text-secondary transition-all duration-300 no-underline hover:bg-olive-900/40 hover:-translate-y-1"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-5 text-center border-t border-olive-900/20 bg-bg-primary">
        <p className="text-text-muted text-sm">
          © 2025 Jonathon Harris. Built with React.
        </p>
      </footer>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeProjectModal}
      />
    </div>
  );
}
