# The Tech Deputies - Full Feature Audit Plan

**Date**: February 2, 2026  
**Status**: Pre-launch audit (live but not publicly launched)  
**Environment**: http://localhost:3000 (development) → https://thetechdeputies.com (production)  
**Total Audit Steps**: 20 (15 feature steps + 5 accessibility steps)

---

## Test Credentials

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| User | test@sn0n.com | asdqwe12 | Existing user account testing |
| Admin | r.foraker@thetechdeputies.com | asdqwe12 | Admin panel & feature verification |
| New Registrations | [create during audit] | [set during registration] | Test registration flow (use fake @sn0n.com addresses) |

**Note**: Admin can verify email addresses in admin panel. User receives all emails at @sn0n.com domain. All test accounts retained for pre-launch reference.

---

## Test Sequence

1. **Localhost First** - http://localhost:3000
   - Fast iteration for dev-only issues
   - Document all findings
   
2. **Then Production** - https://thetechdeputies.com
   - Verify consistency with localhost
   - Check for environment-specific issues
   - Validate live webhook processing

---

## Stripe Testing

**Test Card**: 4242 4242 4242 4242  
**Expiration**: Any future date  
**CVC**: Any 3 digits  
**Billing Postal Code**: Any 5 digits

Test all three subscription plans:
- Basic: $49/month (2 sessions, no courses)
- Standard: $99/month (5 sessions, partial courses)
- Premium: $199/month (unlimited sessions, full courses)

---

## Audit Steps (Sequential: Localhost → Production)

### 1. New User Registration Audit
- [ ] Navigate to `/register` page
- [ ] Create new account with fake @sn0n.com email (e.g., testuser1@sn0n.com)
- [ ] Verify email verification email arrives
- [ ] Verify email contains clickable verification link
- [ ] Click link and verify account is activated
- [ ] Admin can manually verify email in admin panel (backup method)
- [ ] Test duplicate email rejection
- [ ] Test password validation requirements
- [ ] Test login after successful registration
- [ ] Test registration with invalid data (missing fields, bad email format)
- [ ] Test registration with weak password
- [ ] **Repeat all steps on production**

**Expected**: New users can register, receive verification email, and login successfully

---

### 2. Authentication & User Management Audit
- [ ] Login as test@sn0n.com:asdqwe12 on localhost
- [ ] Verify dashboard loads and shows user profile
- [ ] Test account settings/profile editing
- [ ] Test password reset flow (request → email → click link → new password)
- [ ] Test login/logout flow
- [ ] Test email verification resend (if needed)
- [ ] Login as admin (r.foraker@thetechdeputies.com) and verify user appears in user management
- [ ] Verify admin can view user details, subscription history, bookings
- [ ] Test account deletion from admin panel
- [ ] Verify deleted user can be restored by admin
- [ ] **Repeat critical flows on production**

**Expected**: Auth flows work seamlessly, admin can manage user accounts

---

### 3. Stripe Subscription System Audit
- [ ] Login as test user on localhost
- [ ] Navigate to `/subscriptions` or pricing page
- [ ] Click "Subscribe to Basic Plan" ($49)
- [ ] Verify Stripe checkout page loads
- [ ] Enter test card 4242 4242 4242 4242, future date, any CVC, any postal code
- [ ] Complete payment
- [ ] Verify success page or redirect to dashboard
- [ ] Wait ~30 seconds for webhook processing
- [ ] Verify subscription appears in user's subscription dashboard with:
  - Plan name (Basic)
  - Price ($49/month)
  - Status (active)
  - Session limit (2 sessions/month)
  - Start and renewal dates
- [ ] Verify confirmation email arrives
- [ ] Test plan upgrade: click upgrade to Standard ($99)
- [ ] Complete payment with test card
- [ ] Verify dashboard updates to show Standard plan
- [ ] Verify upgrade confirmation email arrives
- [ ] Test plan downgrade: click downgrade to Basic ($49)
- [ ] Verify downgrade email arrives
- [ ] Test subscription cancellation
- [ ] Verify cancellation confirmation email arrives
- [ ] Verify subscription shows as "cancelled" in dashboard
- [ ] **Repeat all steps on production with new test payment**

**Expected**: Full subscription lifecycle works with emails and dashboard updates

---

### 4. Calendar & Booking System Audit

**⚠️ NOTE: Calendar integration is not yet implemented. This section documents current state and blockers.**

- [ ] Login as test user with active subscription on localhost
- [ ] Navigate to `/booking` page
- [ ] **Observe**: Calendar events display (or don't display)
- [ ] **Document**: What calendar slots are visible? (e.g., 10am-4pm, 1-hour intervals)
- [ ] **Document**: What is the current capacity per slot?
- [ ] Attempt to create a booking:
  - [ ] Click on available time slot
  - [ ] Verify booking form appears
  - [ ] Submit booking
  - [ ] **Observe**: Does booking succeed or fail?
  - [ ] If successful: Does it appear in user's booking list?
- [ ] **KEY TEST**: After booking is created, check if:
  - [ ] A calendar event is automatically created for the admin (⚠️ LIKELY NOT IMPLEMENTED)
  - [ ] Booking appears on shared calendar view (⚠️ LIKELY NOT IMPLEMENTED)
  - [ ] Calendar slot shows updated capacity (⚠️ LIKELY NOT IMPLEMENTED)
- [ ] Test capacity enforcement:
  - [ ] Find a slot with available capacity
  - [ ] Create booking (should succeed)
  - [ ] Try to create another booking in same slot
  - [ ] **Observe**: Is booking rejected if capacity exceeded?
- [ ] Verify booking confirmation email arrives
- [ ] **Repeat on production**

**Expected**: Bookings create calendar events, capacity is enforced, calendar integrates with booking system

**Known Blocker**: Booking→Calendar integration not yet programmed. Current state is separate systems.

---

### 5. Session Usage Tracking Audit
- [ ] Login as test user with subscription (e.g., Standard with 5 sessions/month) on localhost
- [ ] Navigate to dashboard and check displayed session count (should show "5 sessions available")
- [ ] Create first booking
- [ ] Return to dashboard
- [ ] **Observe**: Does session count decrement to 4? (⚠️ LIKELY NOT TRACKING)
- [ ] Create 4 more bookings
- [ ] **Observe**: Is user blocked from creating 6th booking? (⚠️ LIKELY NOT ENFORCED)
- [ ] Attempt to create booking when no sessions left
- [ ] **Observe**: Error message shown? Or allowed despite limit?
- [ ] Cancel a booking
- [ ] **Observe**: Does session count increment back? (⚠️ LIKELY NOT IMPLEMENTED)
- [ ] **Repeat on production**

**Expected**: Session count tracks and enforces limits per plan

**Known Blocker**: Session tracking may not be implemented yet

---

### 6. Courses Feature Audit
- [ ] Login as test user without any courses on localhost
- [ ] Navigate to `/courses` page
- [ ] **Observe**: What courses are displayed?
- [ ] **Document**: Course titles, descriptions, prices, thumbnails
- [ ] Click on a course
- [ ] **Observe**: Does course detail page load?
- [ ] **Document**: What information is shown (duration, difficulty, prerequisites, etc.)?
- [ ] Attempt to purchase a course:
  - [ ] Click "Purchase Course" or "Enroll" button
  - [ ] Does it require active subscription?
  - [ ] Does it open payment flow?
  - [ ] Complete purchase with test payment
- [ ] Navigate to dashboard → `/dashboard/courses`
- [ ] **Observe**: Does purchased course appear in user's course library?
- [ ] Click on purchased course
- [ ] **Observe**: Can user access course content or video?
- [ ] Test plan tier restrictions:
  - [ ] Create new user and subscribe to Basic plan (no courses included)
  - [ ] Try to view courses page
  - [ ] **Observe**: Can Basic user see/purchase courses, or is access blocked?
  - [ ] Create user with Standard plan (partial courses)
  - [ ] **Observe**: Which courses can they see?
  - [ ] Create user with Premium plan (full courses)
  - [ ] **Observe**: Which courses can they see?
- [ ] **Admin Feature**: Login as admin on localhost
  - [ ] Navigate to admin dashboard
  - [ ] **Observe**: Is there a "Courses Management" section?
  - [ ] **Document**: Can admin create new courses? Edit courses? Delete courses?
  - [ ] **Document**: Can admin set which courses are available per plan tier?
  - [ ] **MISSING FEATURE**: Document what course editing functionality is missing
- [ ] **Repeat on production**

**Expected**: Users can browse, purchase, and access courses based on subscription tier. Admin can manage courses.

**Known Gaps**: Course editing in admin panel likely needs implementation

---

### 7. Gift Card System Audit
- [ ] Login as test user on localhost
- [ ] Navigate to `/gift-certificates` page
- [ ] **Observe**: Can user purchase gift cards?
- [ ] Select gift card amount (e.g., $50)
- [ ] Complete purchase with test payment
- [ ] Verify confirmation email arrives with gift card code/number
- [ ] Verify gift card appears in dashboard → `/dashboard/gift-cards`
- [ ] **Observe**: Does it show:
  - [ ] Card balance ($50)?
  - [ ] Expiration date?
  - [ ] Redemption status?
  - [ ] Transaction history?
- [ ] Test gift card redemption:
  - [ ] Create new test user or use different account
  - [ ] Navigate to gift card balance check page
  - [ ] Enter gift card number/code
  - [ ] **Observe**: Does it show balance and validity?
- [ ] Test using gift card in checkout:
  - [ ] While purchasing subscription or course
  - [ ] Enter gift card code in payment section
  - [ ] **Observe**: Does it apply balance to purchase?
  - [ ] Complete payment with test card to cover remainder
  - [ ] Verify original account's gift card shows updated balance
- [ ] **Admin Testing**: Login as admin
  - [ ] Navigate to admin dashboard
  - [ ] **Observe**: Is there "Gift Card Management" section?
  - [ ] Can admin create gift cards?
  - [ ] Can admin view all gift cards issued?
  - [ ] Can admin view redemption history?
  - [ ] Can admin disable/revoke gift cards?
  - [ ] Can admin see transaction tracking?
  - [ ] Can admin see analytics (total issued, redeemed, remaining balance)?
- [ ] **Repeat on production**

**Expected**: Users can buy, check, and redeem gift cards. Admin has full management visibility.

---

### 8. Admin Dashboard Audit
- [ ] Login as admin (r.foraker@thetechdeputies.com) on localhost
- [ ] Navigate to `/dashboard/admin`
- [ ] **Observe**: Is admin dashboard/command center present?
- [ ] **Document**: What sections are available in admin panel?

**Test User Management**:
- [ ] Click "User Management" or "Users" section
- [ ] **Observe**: Does list of all users appear?
- [ ] **Observe**: Search/filter functionality?
- [ ] Click on a user to view details
- [ ] **Verify**: Can see:
  - [ ] User email and name
  - [ ] Account status
  - [ ] Subscription history
  - [ ] Bookings made
  - [ ] Created date
  - [ ] Last login
- [ ] **Test Actions**:
  - [ ] Delete a test user (soft delete)
  - [ ] Verify user is marked as deleted
  - [ ] Restore the deleted user
  - [ ] Verify user is restored and can login again
  - [ ] Force password reset on user
  - [ ] Verify password reset email is sent
  - [ ] Create new user from admin panel
  - [ ] Verify new user receives welcome email

**Test Revenue Dashboard**:
- [ ] Click "Revenue" or "Dashboard" section
- [ ] **Verify**: Shows MRR (Monthly Recurring Revenue)
- [ ] **Verify**: Shows active subscription count by plan (Basic, Standard, Premium)
- [ ] **Verify**: Shows subscription status breakdown (Active, Cancelled, Past Due)
- [ ] **Verify**: Shows revenue trend (chart or graph)
- [ ] **Verify**: Shows total revenue all-time

**Test Subscription Management**:
- [ ] Click "Subscriptions" or "Subscription Management"
- [ ] **Observe**: List of all user subscriptions
- [ ] **Observe**: Can admin filter by status, plan, user?
- [ ] Can admin manually create subscription (no payment)?
- [ ] Can admin cancel a subscription?
- [ ] Can admin upgrade/downgrade a subscription?
- [ ] Verify changes trigger appropriate emails

**Test Gift Card Management**:
- [ ] Click "Gift Cards" section
- [ ] Can admin create new gift card?
- [ ] Can admin set amount and expiration?
- [ ] Can admin view all gift cards?
- [ ] Can admin see redemption status?
- [ ] Can admin disable a gift card?

**Test Audit Logs**:
- [ ] Click "Audit Logs" or "Logs" section
- [ ] **Verify**: Can see password change history (who, when, IP, etc.)
- [ ] **Verify**: Can see admin action history (who did what, when)
- [ ] **Verify**: Can see email delivery logs
- [ ] **Verify**: Can filter/search logs

**Test Settings**:
- [ ] Click "Settings" or "System Settings"
- [ ] **Observe**: What configuration options exist?
- [ ] Can admin update system settings?
- [ ] Can admin manage email templates?
- [ ] Can admin view/manage API keys?
- [ ] Can admin view rate limiting config?

- [ ] **Repeat all admin features on production**

**Expected**: Comprehensive admin panel with user, revenue, subscription, gift card, and audit functionality

---

### 9. Email System Audit
- [ ] Throughout previous steps, verify all emails arrive:
  - [ ] Registration verification email
  - [ ] Password reset email
  - [ ] Subscription confirmation email (plan upgrade/downgrade/cancellation)
  - [ ] Booking confirmation email
  - [ ] Gift card purchase email (with code)
  - [ ] Welcome/admin email for manually created accounts

**Test Email Quality**:
- [ ] **Verify**: Each email contains correct information (names, amounts, dates, links)
- [ ] **Verify**: Email formatting is professional
- [ ] **Verify**: Clickable links work
- [ ] **Verify**: No typos or broken references

**Test Email Features** (from admin panel):
- [ ] Check Mailgun integration status
- [ ] Verify email delivery events are tracked
- [ ] Verify bounce/complaint events are recorded
- [ ] Verify spam reporting works
- [ ] **Observe**: Can admin view email delivery logs?
- [ ] **Observe**: Can admin view suppression list (bounced/complained emails)?
- [ ] **Observe**: Can admin manually suppress email addresses?

- [ ] **Repeat on production** - trigger key email flows and verify delivery

**Expected**: All emails deliver reliably with correct content. Delivery tracking works.

---

### 10. Plan Enforcement & Restrictions Audit
- [ ] Create users with different subscription plans (Basic, Standard, Premium)

**Session Limits**:
- [ ] Basic plan (2 sessions): Can create 2 bookings, blocked on 3rd (if implemented)
- [ ] Standard plan (5 sessions): Can create 5 bookings, blocked on 6th
- [ ] Premium plan (unlimited): No session limit

**Course Access**:
- [ ] Basic plan: Cannot see/access courses page or are courses unavailable
- [ ] Standard plan: Can see some courses (partial access)
- [ ] Premium plan: Can see all courses (full access)

**Booking Capacity**:
- [ ] Test that calendar slots have capacity limits (e.g., 2 people per slot)
- [ ] Verify booking is rejected when capacity is full
- [ ] Verify clear error message shown

**Upgrade Prompts**:
- [ ] When Basic user hits session limit, is upgrade prompt shown?
- [ ] When Standard user tries to access Premium course, is upgrade prompt shown?
- [ ] Do prompts redirect to subscription page?

- [ ] **Repeat on production**

**Expected**: Plans are enforced, users see appropriate restrictions and upgrade prompts

---

### 11. Payment Processing & Webhooks Audit
- [ ] During subscription testing (step 3), observe webhook processing

**Webhook Events to Verify**:
- [ ] `checkout.session.completed` - Subscription created in DB ✓
- [ ] `customer.subscription.created` - Record saved with correct plan ✓
- [ ] `customer.subscription.updated` - Plan change updates record ✓
- [ ] `customer.subscription.deleted` - Cancellation recorded ✓
- [ ] `invoice.payment_succeeded` - Payment logged ✓

**Test Webhook Processing**:
- [ ] Each subscription action triggers email within 30 seconds
- [ ] Dashboard updates with subscription details within 30 seconds
- [ ] Stripe customer ID is saved in DB
- [ ] Subscription ID is saved in DB

**Test Payment Failure**:
- [ ] Use test card that declines (check Stripe docs for decline test card)
- [ ] **Observe**: What error message is shown?
- [ ] **Observe**: Can user retry payment?
- [ ] **Observe**: Is failure logged?
- [ ] **Observe**: Is error email sent? (⚠️ MIGHT NOT BE IMPLEMENTED)

**Test Webhook Signature Verification**:
- [ ] (This is internal) Verify that webhook handler validates Stripe signature
- [ ] Webhook endpoint should reject unsigned/invalid requests

- [ ] **Repeat payment tests on production**

**Expected**: Webhooks process correctly, subscription DB records created, emails sent, payment failures handled

---

### 12. Known Issues Verification
- [ ] **Turbopack crashes**: Run `bun run dev` on localhost multiple times
  - [ ] **Observe**: Any bundler crashes or errors?
  - [ ] Navigate between pages, refresh several times
  - [ ] **Document**: Any instability?

- [ ] **React Hydration Errors**: Open browser console (F12)
  - [ ] Load homepage on localhost
  - [ ] **Observe**: Any hydration warnings in console?
  - [ ] Reload multiple times
  - [ ] Test navigation
  - [ ] **Expected**: No hydration errors

- [ ] **Stripe Checkout**: Already tested in step 3
  - [ ] **Verify**: Stripe checkout loads correctly
  - [ ] **Verify**: No 500 errors

- [ ] **Subscriptions Display**: Already tested in step 3
  - [ ] **Verify**: Dashboard shows subscription details

- [ ] **Production Error Logs**: On production (https://thetechdeputies.com)
  - [ ] Check Vercel dashboard for errors
  - [ ] Check application logs for exceptions
  - [ ] **Document**: Any production errors

**Expected**: No known issues; environment is stable

---

### 13. Integration & Edge Cases Audit
- [ ] **Booking + Calendar Integration**: (See step 4 - currently not implemented)

- [ ] **Gift Card + Checkout**: 
  - [ ] Purchase subscription using gift card
  - [ ] Apply gift card code to subscription checkout
  - [ ] **Observe**: Does balance reduce correctly?
  - [ ] Complete payment with partial gift card + credit card

- [ ] **Course Purchase + Gift Card**:
  - [ ] Apply gift card to course purchase
  - [ ] **Observe**: Does balance reduce?

- [ ] **Subscription Downgrade**:
  - [ ] User on Premium with unlimited sessions
  - [ ] Has 10 bookings made
  - [ ] Downgrade to Standard (5 sessions)
  - [ ] **Observe**: What happens to existing bookings?
  - [ ] Can they still access already-purchased courses?

- [ ] **Booking Cancellation**:
  - [ ] User with active subscription and bookings
  - [ ] Cancel a booking
  - [ ] **Observe**: Is session refunded? (⚠️ MIGHT NOT BE IMPLEMENTED)
  - [ ] Verify cancellation confirmation email sent
  - [ ] Calendar slot capacity updated

- [ ] **Email Verification + Registration**:
  - [ ] Register with test email
  - [ ] Don't verify email immediately
  - [ ] Try to login without verification
  - [ ] **Observe**: Is access blocked?
  - [ ] Verify email and retry login
  - [ ] **Expected**: Login succeeds after verification

- [ ] **Cross-Environment Consistency**:
  - [ ] Repeat key flows on production
  - [ ] **Verify**: Same behavior as localhost
  - [ ] **Verify**: Same error messages
  - [ ] **Verify**: Same email delivery

**Expected**: Cross-feature integration works, edge cases handled gracefully

---

### 14. Missing Features Discovery
During all testing, document any features that are missing or incomplete:

- [ ] **Course Editing** - Can admin create/edit/delete courses?
- [ ] **Payment Retry Logic** - Do failed payments retry automatically?
- [ ] **Invoicing** - Are invoices generated and available for download?
- [ ] **Rate Limiting** - Are endpoints protected from abuse?
- [ ] **Notification Preferences** - Can users control email frequency?
- [ ] **Timezone Support** - Do dates/times respect user timezone?
- [ ] **Recurring Events** - Can calendar have recurring bookings?
- [ ] **Calendar Sync** - Can users sync with Google Calendar/Outlook?
- [ ] **SMS Notifications** - Are text message alerts available?
- [ ] **Booking Cancellation Refunds** - Are refunds processed for cancelled bookings?
- [ ] **Admin Reporting** - Can admin generate custom reports?
- [ ] **User Analytics** - Can admin see user engagement metrics?
- [ ] **Support Ticket System** - Are support tickets implemented?
- [ ] **Multi-language Support** - Is site localized?
- [ ] **Dark Mode** - Is dark theme available?

**Document**: For each missing feature, note if it's:
- [ ] Not started
- [ ] Partially implemented
- [ ] Blocked by other features
- [ ] Not yet scoped

---

### 15. Performance & Security Check
- [ ] **HTTPS/SSL**: Verify production URL uses HTTPS
- [ ] **Certificate**: Check SSL certificate is valid
- [ ] **Page Load Time**: 
  - [ ] Measure homepage load time on localhost
  - [ ] Measure homepage load time on production
  - [ ] **Target**: < 3 seconds
- [ ] **Lighthouse Score** (Chrome DevTools):
  - [ ] Run Lighthouse audit on localhost
  - [ ] Run Lighthouse audit on production
  - [ ] **Target**: > 80 for Performance, Accessibility, Best Practices

**Security Checks**:
- [ ] **XSS Testing**: Try entering `<script>alert('xss')</script>` in user inputs
  - [ ] Form fields
  - [ ] Search boxes
  - [ ] **Expected**: Script is escaped or rejected
  
- [ ] **CSRF Protection**: 
  - [ ] Verify forms include CSRF tokens
  - [ ] Inspect form HTML for token field
  
- [ ] **SQL Injection**: Try entering `' OR '1'='1` in search/filter fields
  - [ ] **Expected**: Safe queries, no errors
  
- [ ] **Password Security**:
  - [ ] Passwords hashed (bcrypt)
  - [ ] Minimum length enforced (8+ chars)
  - [ ] Requirements enforced (uppercase, numbers, special chars)
  
- [ ] **API Authentication**:
  - [ ] Try accessing admin endpoints without login
  - [ ] **Expected**: 401 Unauthorized
  - [ ] Try accessing user endpoints as different user
  - [ ] **Expected**: 403 Forbidden
  
- [ ] **Error Messages**:
  - [ ] Trigger errors (404, 500, validation)
  - [ ] **Expected**: Generic error messages, no sensitive data leaked
  - [ ] Check console for detailed errors
  - [ ] **Expected**: Technical errors not exposed to user
  
- [ ] **Sensitive Data**:
  - [ ] Check HTML source (Ctrl+U) for sensitive data
  - [ ] Check console for API keys, tokens, passwords
  - [ ] Check network tab for unencrypted data
  - [ ] **Expected**: No secrets exposed
  
- [ ] **Rate Limiting**:
  - [ ] Test checkout endpoint with rapid requests
  - [ ] **Observe**: Is rate limiting enforced? (⚠️ MIGHT NOT BE ACTIVE)
  - [ ] Spam login attempts
  - [ ] **Observe**: Is account locked after N attempts?

**Expected**: Secure, performant, and well-architected application

---

## Audit Summary Template

After completing each step, fill in this summary:

```
### Step [#]: [Feature Name]

**Status**: ✅ Complete | 🟡 Partial | ❌ Not Working

**Findings**:
- [Finding 1]
- [Finding 2]
- [Finding 3]

**Issues Discovered**:
- [Issue 1]
- [Issue 2]

**Next Steps/Blockers**:
- [Blocker 1]
- [Blocker 2]

**Localhost vs Production**:
- Localhost: [status]
- Production: [status]
- Differences: [any differences between environments]
```

---

## Accessibility Audit (WCAG 2.1 AAA Compliance)

### 16. Aria Labels & Semantic HTML Audit
- [ ] Verify all interactive elements have proper ARIA labels
- [ ] Check for `aria-label`, `aria-labelledby`, `aria-describedby` on:
  - [ ] Buttons (especially icon-only buttons)
  - [ ] Form inputs (labels or aria-label)
  - [ ] Links (descriptive text or aria-label)
  - [ ] Modal dialogs (aria-modal, aria-labelledby)
  - [ ] Navigation menus (aria-expanded, aria-haspopup)
  - [ ] Search inputs (aria-label="Search")
  - [ ] Close buttons (aria-label="Close")
  - [ ] Collapse/expand buttons (aria-expanded states)
- [ ] Verify semantic HTML structure:
  - [ ] Proper heading hierarchy (h1, h2, h3 in order)
  - [ ] Nav elements use `<nav>` tag
  - [ ] Main content in `<main>` tag
  - [ ] Form inputs use proper `<label>` elements
  - [ ] Lists use `<ul>`, `<ol>`, `<li>` appropriately
  - [ ] Tables have `<thead>`, `<tbody>`, `<th>` tags

**Tools**: Browser DevTools (Lighthouse), axe DevTools extension

**Expected**: All interactive elements discoverable and properly labeled for screen readers

---

### 17. Color Contrast Ratio Audit (WCAG AAA Level)

**Standards**:
- **AAA Normal Text**: 7:1 minimum contrast ratio
- **AAA Large Text** (24px+ or bold 19px+): 4.5:1 minimum contrast ratio
- **Enhanced**: 7:1 for all text recommended

**Test Process**:
1. Navigate to https://colorcontrast.app/ or https://webaim.org/resources/contrastchecker/
2. For each page/component on localhost:
   - [ ] Identify all text color + background color combinations
   - [ ] Use eyedropper to get exact colors
   - [ ] Check contrast ratio
   - [ ] Document any violations
   - [ ] Screenshot violations for reference

**Pages to Test** (High Priority):
- [ ] Homepage (`/`)
- [ ] Pricing page (`/subscriptions`)
- [ ] Booking page (`/booking`)
- [ ] Dashboard pages (`/dashboard/*`)
- [ ] Admin panel (`/dashboard/admin/*`)
- [ ] Navigation header
- [ ] Footer

**Common Issues to Look For**:
- [ ] Dark grey text (#666, #999) on dark backgrounds
- [ ] Light grey text (#ccc, #ddd) on white or light backgrounds
- [ ] Placeholder text in form inputs
- [ ] Disabled buttons or form fields
- [ ] Links without underline (rely on color alone)
- [ ] Hover/focus states with insufficient contrast
- [ ] Error messages in red on complex backgrounds

**Example Test**:
- Dark text: #333 on dark background #1a1a1a → **Fail** (1.3:1)
- Dark text: #333 on white background #fff → **Pass** (12.6:1)
- Light text: #fff on primary blue #0066cc → **Pass** (6.5:1)

**Fixes to Apply**:
1. **Increase contrast** by darkening text or lightening background
2. **Use different color pairs** if current colors don't work
3. **Test fixes** with contrast checker to confirm AAA level
4. **Document** all changes in CHANGELOG.md

**Repeat on Production**: After fixes on localhost, verify same contrast ratios on production

---

### 18. Keyboard Navigation Audit
- [ ] Test all pages using only Tab key (no mouse)
- [ ] Verify focus is always visible (focus rings/outline)
- [ ] Check tab order is logical (left-to-right, top-to-bottom)
- [ ] Test all interactive elements are keyboard accessible:
  - [ ] Buttons can be activated with Enter or Space
  - [ ] Form inputs are selectable and editable
  - [ ] Dropdowns/menus open with Enter, navigate with arrow keys
  - [ ] Modals trap focus (can't tab out)
  - [ ] Links activate with Enter
  - [ ] Checkboxes toggle with Space
- [ ] Test escape key closes modals and menus
- [ ] Verify no keyboard trap (can always exit)

**Expected**: Full site navigation using keyboard only

---

### 19. Lighthouse Accessibility Score Audit
- [ ] Open each page in Chrome DevTools
- [ ] Run Lighthouse audit with "Accessibility" category
- [ ] Target: **90+ score** (anything below 90 needs investigation)
- [ ] Document all warnings and failures:
  - [ ] Missing form labels
  - [ ] Buttons without labels
  - [ ] Poor color contrast
  - [ ] Missing alt text
  - [ ] Tap target too small (<48px)
- [ ] Fix issues with highest impact first

**Pages to Test**:
- [ ] Homepage
- [ ] Pricing
- [ ] Booking
- [ ] Dashboard
- [ ] Admin panel

**Expected**: All pages score 90+

---

### 20. Screen Reader Testing (Optional but Recommended)
- [ ] Install screen reader:
  - [ ] Windows: NVDA (free) or JAWS (commercial)
  - [ ] Mac: VoiceOver (built-in)
  - [ ] Chrome: Chrome Vox extension
- [ ] Test major user flows:
  - [ ] Registration flow
  - [ ] Login flow
  - [ ] Subscription purchase
  - [ ] Booking creation
- [ ] Verify:
  - [ ] All text is announced
  - [ ] Form labels are associated with inputs
  - [ ] Button purposes are clear
  - [ ] Error messages are announced
  - [ ] Success confirmations are announced
  - [ ] Navigation structure is clear

**Expected**: Site is usable and understandable with screen reader enabled

---

## Known Blockers (Before Audit Can Complete)

1. **Calendar Integration** (Step 4)
   - Bookings and calendar events are separate systems
   - Bookings don't automatically create calendar entries
   - Calendar slot capacity not updated on booking
   - Needs to be programmed before full testing

2. **Session Tracking** (Step 5)
   - Session count may not be tracked on bookings
   - Enforcement of session limits not implemented
   - Needs programming before can be verified

3. **Course Editing** (Step 6)
   - Admin course management UI likely missing
   - Can create courses in DB, but no admin panel interface
   - Needs implementation before admin can manage courses

---

## Test Data Cleanup

All test accounts, payments, bookings, and data created during audit will be retained for pre-launch reference.

Before going live for real (public launch):
- Database will be reset
- All test accounts will be deleted
- All test transactions will be cleared
- Fresh database snapshot will be taken

---

## Sign-off

- [ ] All audit steps completed on localhost (Steps 1-15)
- [ ] All audit steps completed on production (Steps 1-15)
- [ ] All accessibility audit steps completed on localhost (Steps 16-20)
- [ ] All accessibility audit steps completed on production (Steps 16-20)
- [ ] All findings documented
- [ ] All blockers identified
- [ ] All color contrast violations fixed and verified (AAA level)
- [ ] All ARIA labels verified present
- [ ] Keyboard navigation tested and working
- [ ] Lighthouse accessibility score 90+ on all pages
- [ ] Ready for implementation of missing features
- [ ] Ready for public launch

---

## Audit Tools & Resources

### Color Contrast Testing
- **[WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)** - Official tool
- **[Color Contrast App](https://colorcontrast.app/)** - Visual eyedropper tool
- **Chrome DevTools** - Built-in contrast verification

### Accessibility Testing
- **[axe DevTools](https://www.deque.com/axe/devtools/)** - Chrome extension for automated checks
- **[WAVE](https://wave.webaim.org/)** - WebAIM visual accessibility checker
- **[Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse)** - Built-in audit tool

### Screen Readers
- **NVDA** (Windows, free) - https://www.nvaccess.org/
- **JAWS** (Windows, commercial) - https://www.freedomscientific.com/
- **VoiceOver** (Mac, built-in)
- **Chrome Vox** (Chrome extension, free)

### Documentation
- **[WCAG 2.1 Standards](https://www.w3.org/WAI/WCAG21/quickref/)** - Official guidelines
- **[WebAIM Resources](https://webaim.org/)** - Best practices and tutorials
- **[Deque University](https://dequeuniversity.com/)** - Free accessibility training
- **[A11y Project](https://www.a11yproject.com/)** - Community resources

---

## Standards Summary

**AAA Level Targets**:
- ✅ 7:1 contrast for normal text (or 4.5:1 minimum)
- ✅ 4.5:1 contrast for large text (24px+) or bold (19px+)
- ✅ ARIA labels on all interactive elements
- ✅ Semantic HTML structure
- ✅ Full keyboard navigation
- ✅ Screen reader compatible
- ✅ Lighthouse accessibility score 90+

