# Quotations Generator - Order Management System

A comprehensive order management system with quotation generation, multi-day event support, and real-time tracking.

## Features

- 📝 Order Management (Single & Multi-day events)
- 👥 Customer Database
- 📊 Business Analytics
- 📅 Calendar View
- 🎨 Customizable Print Templates
- 🔐 Secure Firebase Backend
- 🎯 **Advanced Filtering System** with AI-powered learning
- 📊 **Comprehensive Logging** for all filtering operations
- ⚠️ **Validation & Anomaly Detection** to catch missing orders
- 🔄 **Fuzzy Date Matching** for error tolerance

## Advanced Filtering System

The admin panel includes a sophisticated filtering infrastructure that learns from patterns and helps catch errors automatically.

### Components

#### 1. 📊 FilterLogger - Detailed Operation Logging
Tracks every filtering operation with:
- Timestamp and operation type
- Filter parameters (dates, criteria)
- Results (matched orders, counts)
- Performance metrics (execution time)
- Automatic log rotation (keeps last 1000 operations)

#### 2. 🧠 PatternLearner - Machine Learning Pattern Recognition
Learns from filtering patterns to:
- Track typical order counts by date
- Learn weekday vs weekend patterns
- Detect anomalies (unusual order counts)
- Recognize date format variations
- Predict expected order counts

#### 3. 🔄 FuzzyDateMatcher - Error-Tolerant Date Matching
Handles date format variations:
- Normalizes dates to consistent format (YYYY-MM-DD)
- Matches dates across different formats (DD-MM-YYYY, MM/DD/YYYY, etc.)
- Finds near matches (within N days)
- Validates date ranges for multi-day orders

#### 4. ⚠️ OrderValidator - Missing Order Detection
Validates filtering results and alerts on:
- **Anomaly Detection**: Alerts when order count deviates from learned patterns
- **Nearby Dates**: Identifies orders within 2 days that weren't matched
- **Missing Dates**: Finds orders without proper date fields
- **Multi-day Validation**: Ensures multi-day orders are correctly matched

### Usage

#### Automatic Operation
The system works automatically in the background:
- All filter operations are logged
- Patterns are learned from every query
- Validations run after each filter
- Alerts show in console for critical issues

#### Manual Diagnostics
Use these console commands for debugging:

```javascript
// View filtering statistics
AdminUtils.showFilteringStats()

// View recent filter operations
AdminUtils.viewFilterLogs(50)

// View learned patterns
AdminUtils.viewLearnedPatterns()

// Test filter accuracy for a specific date
AdminUtils.testFilterAccuracy("2024-12-25")

// Clear logs (keeps last 1000)
AdminUtils.clearFilterLogs()

// Reset all learned patterns
AdminUtils.resetLearnedPatterns()
```

### How It Works

#### Example: Filtering Orders by Date

When you filter orders for a date (e.g., downloading same-day orders):

1. **Logging**: System logs the filter operation start time and parameters
2. **Fuzzy Matching**: Date is normalized and matched across format variations
3. **Filtering**: Orders are matched using three strategies:
   - Single-day exact/fuzzy date match
   - Multi-day range check (date falls within start/end)
   - Day-wise data check (for multi-day events with specific dates)
4. **Validation**: Results are validated for:
   - Anomalies vs learned patterns
   - Nearby orders that might have been missed
   - Orders with missing/invalid dates
   - Multi-day orders that should include the date
5. **Learning**: Pattern learner records the results for future reference
6. **Logging**: Completion time and detailed breakdown are logged

#### Example Console Output

```
📊 Filter Summary for 2024-12-25
✅ Matched: 15 orders in 2.34ms
📋 Breakdown: { singleDayMatches: 12, multiDayRangeMatches: 3, skipped: 47 }
🎯 Match rate: 23.8%
🧠 Expected based on learning: ~14 orders
```

#### Validation Alerts

When issues are detected:

```
🔔 Validation Alerts for 2024-12-25
⚠️ [anomaly] Unusual order count! Expected ~20 orders, found 8
ℹ️ [nearby_dates] Found 2 order(s) within 2 days of 2024-12-25
  Details: {...}
```

### Benefits

1. **Catch Missing Orders**: Automatically detects when orders might be missing from results
2. **Format Tolerance**: Handles various date formats without manual intervention
3. **Performance Tracking**: Monitor filter performance and identify slow operations
4. **Pattern Insights**: Learn business patterns (typical order volumes, trends)
5. **Debugging Aid**: Comprehensive logs help troubleshoot sync issues

### Data Storage

All learning data is stored in browser localStorage:
- `oms_filter_logs`: Last 1000 filter operations
- `oms_filter_patterns`: Learned patterns and statistics

Data persists across sessions and improves over time.

## Security

### About the Firebase API Key

⚠️ **Important:** The Firebase API key in this repository is **intentionally public** and is NOT a security risk.

For web applications, Firebase API keys are designed to be included in client-side code. They are **not secrets** and do not grant access to your data.

**Security is enforced through:**
1. ✅ **Firebase Security Rules** - All data requires authentication
2. ✅ **API Key Restrictions** - Restricted to specific domains in Google Cloud Console
3. ✅ **Firebase Authentication** - Required for all admin operations

See [SECURITY.md](SECURITY.md) for detailed information.

### Recommended Security Setup

1. **Restrict API Key** (Google Cloud Console):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Edit your API key and add HTTP referrer restrictions
   - Limit to your domain(s) only

2. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Enable Firebase Authentication**:
   - Ensure only authorized users can access the admin panel

## Setup

1. Clone the repository
2. Update Firebase config if needed (see `firebase-config.js`)
3. Deploy security rules: `firebase deploy --only firestore:rules`
4. Open `index.html` in a web browser or deploy to your hosting

## Firebase Security Rules

Security rules are defined in `firestore.rules`. Deploy them using:

```bash
firebase deploy --only firestore:rules
```

## License

Private/Proprietary - All rights reserved

## Support

For issues or questions, please open an issue on GitHub.
