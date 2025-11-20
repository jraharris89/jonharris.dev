const TransDashImage = "/TransDASH_Dashboard.png";
const AgencyTrackerImage = "/Agency_Tracker.png";
const EcommercePipelineImage = "/Ecommerce_Pipeline.png";

export const projects = [
  {
    title: "Transit Agency Performance Dashboard",
    description:
      "Interactive Tableau dashboard analyzing performance metrics for 10+ U.S. transit agencies. Features real-time data updates, custom KPI tracking, comparative analysis, and automated report generation.",
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
      "Reduced reporting time by 60% and improved decision-making speed for transit operations managers across 10+ agencies.",
    codeSnippets: [
      {
        title: "ETL Pipeline - Performance Analysis",
        filename: "transit_performance_etl.sql",
        gistUrl:
          "https://gist.github.com/jraharris89/835f41d2a318cc1907aa6e2442ef2a17",
        code: "// Loading code from GitHub Gist...",
      },
    ],
    liveUrl:
      "https://public.tableau.com/views/TransDASH_Agency_LTD_REDESIGN/Overview?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
  },
  {
    title: "Transit Analytics Automation Suite",
    description:
      "Automated reporting system processing 200+ transit metrics quarterly with Google Apps Script. Generates quarterly peer analysis reports, delivers interactive insights to stakeholders, and eliminates 95+ hours of manual work annually.",
    tech: [
      "Google Apps Script",
      "JavaScript",
      "HTML5",
      "CSV Processing",
      "Automation",
    ],
    image: AgencyTrackerImage,
    features: [
      "Automated CSV data ingestion and API integration from multiple sources",
      "Real-time data validation with intelligent quality checks and outlier detection",
      "Complex metric calculations, aggregations, and derived KPI processing",
      "Quarterly automated report generation with custom alert system for anomalies",
      "Quarterly peer analysis reports with rankings, trends, and comparative insights",
      "Dynamic HTML report generation with embedded styling and interactive elements",
      "Automated email distribution to stakeholder groups with time-based triggers",
      "Multi-agency performance tracking and peer group benchmarking",
    ],
    impact:
      "Eliminated 95+ hours of manual work annually (75% reduction in weekly reporting + 20 hours per quarter). Processes 200+ metrics weekly with zero errors, provides instant stakeholder notifications, and delivers interactive quarterly reports that enable faster, data-driven strategic decision-making across 10+ transit agencies.",
    codeSnippets: [
      {
        title: "Metric Processing Engine",
        filename: "metric_processor.gs",
        gistUrl:
          "https://gist.github.com/jraharris89/2d5122966992fb0b80cb102c69a614d6",
        code: "// Loading code from GitHub Gist...",
      },
      {
        title: "Quarterly Peer Analysis Report Generator",
        language: "javascript",
        gistUrl:
          "https://gist.github.com/jraharris89/f2f5c9746ea55fcc07c3669a4c514da8",
        code: "// Loading code from GitHub Gist...",
      },
    ],
    liveUrl: "/Benchmark_Quarterly_Report.html",
  },
  {
    title: "E-Commerce Real-Time Data Pipeline",
    description:
      "End-to-end data engineering pipeline processing 100k+ e-commerce orders through Kafka streaming, dbt transformations, and Airflow orchestration. Features dimensional modeling, automated data quality testing, and real-time analytics dashboard.",
    tech: [
      "Kafka",
      "Python",
      "dbt",
      "Airflow",
      "PostgreSQL",
      "Streamlit",
      "Docker",
    ],
    image: EcommercePipelineImage,
    githubUrl: "https://github.com/jraharris89/ecommerce-data-pipeline",
    features: [
      "Real-time event streaming with Kafka producer and consumer architecture",
      "Dimensional data modeling with star schema (fact and dimension tables)",
      "Automated ETL orchestration with Apache Airflow DAGs",
      "15+ dbt data quality tests ensuring referential integrity",
      "Interactive Streamlit dashboard with Plotly visualizations",
      "Full Docker containerization for reproducible environments",
    ],
    impact:
      "Built production-ready data pipeline processing 100k+ order events with zero data quality errors. Automated daily transformations reduce manual reporting time by 90%, while dimensional modeling enables sub-second query performance for real-time analytics across geographic regions and product categories.",
    codeSnippets: [
      {
        title: "dbt Dimensional Model - Fact Orders",
        filename: "fact_orders.sql",
        gistUrl:
          "https://gist.github.com/jraharris89/0425a40b76af93bf97ff08ca528b8662",
        code: "// Loading code from GitHub Gist...",
      },
      {
        title: "Kafka Streaming Producer",
        filename: "kafka_producer.py",
        gistUrl:
          "https://gist.github.com/jraharris89/c1f697c887d8c69c8ab36b5cb4ce2756",
        code: "// Loading code from GitHub Gist...",
      },
      {
        title: "Airflow DAG Orchestration",
        filename: "ecommerce_pipeline.py",
        gistUrl:
          "https://gist.github.com/jraharris89/9b28d3fb563e7a542c58ca74a85fb5e8",
        code: "// Loading code from GitHub Gist...",
      },
    ],
  },
];
