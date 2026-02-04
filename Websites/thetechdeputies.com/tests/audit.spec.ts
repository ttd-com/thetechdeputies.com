import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Step 1: New User Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Fill registration form
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User Two');
    await page.getByRole('textbox', { name: 'Email Address' }).fill('testuser2@sn0n.com');
    await page.getByRole('textbox', { name: /^Password$/ }).fill('testpass123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('testpass123');
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Should show verification message
    await expect(page.getByText('Check Your Email')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('testuser2@sn0n.com')).toBeVisible();
    
    // Screenshot
    await page.screenshot({ path: 'audit-screenshots/step1-registration-success.png' });
  });
  
  test('should reject duplicate email', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Try registering with same email
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Duplicate User');
    await page.getByRole('textbox', { name: 'Email Address' }).fill('testuser2@sn0n.com');
    await page.getByRole('textbox', { name: /^Password$/ }).fill('testpass123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('testpass123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Should show error
    await expect(page.getByText(/email.*already.*exists/i)).toBeVisible({ timeout: 10000 });
  });
  
  test('should validate password requirements', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email Address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: /^Password$/ }).fill('short');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('short');
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Should show validation error
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });
});

test.describe('Step 3: Subscriptions Page', () => {
  test('should display all three subscription tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscriptions`);
    
    // Check for plan titles
    await expect(page.getByRole('heading', { name: 'Basic' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Standard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Premium' })).toBeVisible();
    
    // Check for prices
    await expect(page.getByText('$49')).toBeVisible();
    await expect(page.getByText('$89')).toBeVisible();
    await expect(page.getByText('$149')).toBeVisible();
    
    await page.screenshot({ path: 'audit-screenshots/step3-subscriptions.png' });
  });
  
  test('should show session limits', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscriptions`);
    
    // Basic: 2 sessions
    await expect(page.getByText(/2.*sessions?/i).first()).toBeVisible();
    
    // Standard: 5 sessions
    await expect(page.getByText(/5.*sessions?/i).first()).toBeVisible();
    
    // Premium: Unlimited
    await expect(page.getByText(/unlimited/i)).toBeVisible();
  });
});

test.describe('Step 4: Courses Page', () => {
  test('should display courses page', async ({ page }) => {
    await page.goto(`${BASE_URL}/courses`);
    
    await expect(page.getByRole('heading', { name: /courses/i, level: 1 })).toBeVisible();
    
    await page.screenshot({ path: 'audit-screenshots/step4-courses.png' });
  });
});

test.describe('Step 5: Gift Cards Page', () => {
  test('should display gift cards page', async ({ page }) => {
    await page.goto(`${BASE_URL}/gift-certificates`);
    
    await expect(page.getByRole('heading', { name: /gift/i, level: 1 })).toBeVisible();
    
    await page.screenshot({ path: 'audit-screenshots/step5-giftcards.png' });
  });
});

test.describe('Step 6: Booking Page', () => {
  test('should display booking page', async ({ page }) => {
    await page.goto(`${BASE_URL}/booking`);
    
    await expect(page.getByRole('heading', { name: /book/i, level: 1 })).toBeVisible();
    
    await page.screenshot({ path: 'audit-screenshots/step6-booking.png' });
  });
});

test.describe('Accessibility: ARIA Labels', () => {
  test('homepage should have proper ARIA labels', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for skip link
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeVisible({ visible: false }); // Can be visually hidden
    
    // Check for navigation landmark
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for main landmark
    await expect(page.getByRole('main')).toBeVisible();
    
    // Check for footer landmark
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
  
  test('forms should have accessible labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // All form fields should have labels
    const nameField = page.getByRole('textbox', { name: 'Full Name' });
    await expect(nameField).toBeVisible();
    
    const emailField = page.getByRole('textbox', { name: 'Email Address' });
    await expect(emailField).toBeVisible();
    
    const passwordField = page.getByRole('textbox', { name: /^Password$/ });
    await expect(passwordField).toBeVisible();
    
    const confirmField = page.getByRole('textbox', { name: 'Confirm Password' });
    await expect(confirmField).toBeVisible();
  });
});

test.describe('Accessibility: Keyboard Navigation', () => {
  test('should be able to navigate homepage with keyboard', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    
    // Skip link should be focused
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
    
    // Take screenshot showing focus
    await page.screenshot({ path: 'audit-screenshots/keyboard-navigation-focus.png' });
  });
  
  test('should be able to tab through registration form', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Tab through all fields
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Logo link
    await page.keyboard.press('Tab'); // Services
    await page.keyboard.press('Tab'); // Courses
    await page.keyboard.press('Tab'); // Gift Cards
    await page.keyboard.press('Tab'); // About
    await page.keyboard.press('Tab'); // Sign In button
    await page.keyboard.press('Tab'); // Book Support button
    await page.keyboard.press('Tab'); // Full Name field
    
    const nameField = page.getByRole('textbox', { name: 'Full Name' });
    await expect(nameField).toBeFocused();
  });
});

test.describe('Accessibility: Color Contrast', () => {
  test('should capture screenshots for manual contrast testing', async ({ page }) => {
    const pages = [
      { url: '/', name: 'homepage' },
      { url: '/register', name: 'register' },
      { url: '/login', name: 'login' },
      { url: '/subscriptions', name: 'subscriptions' },
      { url: '/courses', name: 'courses' },
      { url: '/gift-certificates', name: 'giftcards' },
      { url: '/booking', name: 'booking' },
      { url: '/about', name: 'about' },
      { url: '/contact', name: 'contact' },
    ];
    
    for (const pageDef of pages) {
      await page.goto(`${BASE_URL}${pageDef.url}`);
      await page.screenshot({ 
        path: `audit-screenshots/contrast-${pageDef.name}.png`,
        fullPage: true 
      });
    }
  });
});
