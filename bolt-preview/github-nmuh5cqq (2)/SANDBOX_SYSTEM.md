# Sandbox Testing System Documentation

## Overview
The Sandbox Mode is a sophisticated feature testing and feedback system that allows users to test unstable features before they go live, and allows admins to deploy features directly from GitHub commits.

## How It Works

### User Side - Enabling Sandbox Mode

1. **User opens Settings** → Toggles "🧪 Sandbox Mode"
2. **Warning Dialog appears:**
   - "Sandbox Mode will open a separate browser window for testing unstable features"
   - Explains that changes are isolated and refresh will undo them
   - User clicks OK or Cancel
3. **If OK:**
   - New isolated browser window opens (`?sandbox=true`)
   - Shows all testing features in a separate environment
   - Original app remains unchanged
4. **If Cancel:**
   - Setting returns to original state
   - Nothing happens

### Sandbox Testing Page Features

Once in sandbox mode, users see:

- **Feature Cards** - Each testing feature displayed with:
  - Feature name and type (tool, setting, bugfix, ui)
  - Description
  - "Test Feature" button - Opens tool/applies setting
  - "Send Feedback" button - Opens feedback form

- **Testing a Feature:**
  - **For Settings:** Toggle is applied in sandbox only. Refresh page to undo.
  - **For Tools:** Opens the tool interface for testing
  - **For Bugfixes/UI:** Tests the changes in isolation

### Feedback System

When user clicks "Send Feedback":

1. **Feedback Modal Opens** with:
   - ⭐ Star rating (1-5 stars)
   - Status dropdown: "Works Well", "Has Bugs", "Needs Improvement", "Broken"
   - Feedback text area
   - Optional email
   
2. **User submits feedback**
3. **Data stored in:** `sandbox_feedback` table
4. **Email sent to:** prospertaku098@gmail.com with:
   - Feature name
   - User rating
   - Status
   - Feedback text
   - User email

### Admin Side - Deploying Features

**Command to add feature to sandbox:**
```
POST /functions/v1/sandbox-deploy
{
  "action": "add_sandbox_feature",
  "featureId": "new-tool-id",
  "featureType": "tool|setting|bugfix|ui",
  "name": "Feature Name",
  "description": "What does it do?",
  "codeUrl": "https://github.com/commit/hash"
}
```

**Result:**
- Feature added to `sandbox_features` table with status: `testing`
- Email notification sent
- Feature immediately available in all users' sandbox windows
- Users can test and provide feedback

**Command to deploy to live:**
```
POST /functions/v1/sandbox-deploy
{
  "action": "deploy_to_live",
  "featureId": "new-tool-id"
}
```

**Result:**
- Feature status changed from `testing` to `live`
- Feature deployed_at timestamp set
- Email notification with feedback summary sent
- Feature available in main app

## Database Tables

### sandbox_features
Tracks all testing features
- `id` - UUID primary key
- `feature_id` - Unique identifier
- `feature_type` - tool, setting, bugfix, ui
- `name` - Display name
- `description` - What it does
- `code_url` - GitHub link
- `status` - testing, live, archived
- `created_at` - When added
- `deployed_at` - When went live

### sandbox_feedback
User feedback for features
- `id` - UUID primary key
- `sandbox_feature_id` - FK to sandbox_features
- `user_email` - Tester email
- `rating` - 1-5 stars
- `feedback` - Feedback text
- `feature_status` - works_well, has_bugs, needs_improvement, broken
- `created_at` - When submitted

### sandbox_sessions
Tracks sandbox user sessions
- `id` - UUID primary key
- `session_token` - Unique per browser window
- `features_enabled` - JSON array of active features
- `created_at` - Session start
- `last_accessed` - Last activity

## Edge Functions

### sandbox-deploy
Handles feature management:
- **POST /functions/v1/sandbox-deploy**
  - `action: "add_sandbox_feature"` - Add feature to testing
  - `action: "deploy_to_live"` - Move feature to live
  - Sends email notifications
  - Returns feedback summary before deployment

## Workflow Example

**Thursday - Admin commits new tool:**
1. Commits "new-pdf-splitter-tool" to GitHub
2. Calls sandbox-deploy to add feature
3. Email notification to admin
4. Feature appears in all user sandbox windows

**Friday - Users test:**
1. Users open sandbox mode
2. See "PDF Splitter" in testing features
3. Test the tool
4. Submit feedback (rating + comments)
5. Emails sent to admin with feedback

**Saturday - Admin decides to deploy:**
1. Reviews feedback summary in email
2. Calls sandbox-deploy with `deploy_to_live`
3. Feature status changes to live
4. Feature now available in main app for all users
5. Feedback summary email confirms deployment

## Security & Isolation

- **RLS Enabled** on all sandbox tables
- **Separate browser window** prevents interference with main app
- **LocalStorage isolation** - sandbox uses separate session token
- **Changes not persisted** - refresh page undoes all changes
- **Service role** manages deployments (admin only)
- **Anonymous feedback allowed** but email captured for follow-up

## Future Enhancements

- User feedback dashboard for admins
- Rollback feature from live
- Feature stability metrics (% working well vs broken)
- Scheduled deployment times
- Beta program with selected testers
- A/B testing different versions
