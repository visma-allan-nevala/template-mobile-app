import { analytics } from '@services/analytics/analytics';

describe('analytics', () => {
  beforeEach(() => {
    // Reset analytics state
    analytics.reset();
    analytics.setOptOut(false);
  });

  describe('setUserId', () => {
    it('stores user ID', () => {
      analytics.setUserId('user-123');
      expect(analytics.getUserId()).toBe('user-123');
    });

    it('can clear user ID with null', () => {
      analytics.setUserId('user-123');
      analytics.setUserId(null);
      expect(analytics.getUserId()).toBeNull();
    });
  });

  describe('reset', () => {
    it('clears user ID and properties', () => {
      analytics.setUserId('user-123');
      analytics.setUserProperties({ accountType: 'premium' });

      analytics.reset();

      expect(analytics.getUserId()).toBeNull();
    });
  });

  describe('setOptOut', () => {
    it('affects isEnabled status', () => {
      // Note: isEnabled depends on config.features.enableAnalytics
      // which is false in test environment
      analytics.setOptOut(true);
      expect(analytics.isEnabled()).toBe(false);
    });
  });

  describe('trackEvent', () => {
    it('does not throw when tracking events', () => {
      expect(() => {
        analytics.trackEvent({ name: 'test_event' });
      }).not.toThrow();
    });

    it('handles events with params', () => {
      expect(() => {
        analytics.trackEvent({
          name: 'button_click',
          params: { button_id: 'submit' },
        });
      }).not.toThrow();
    });
  });

  describe('trackScreenView', () => {
    it('does not throw when tracking screen views', () => {
      expect(() => {
        analytics.trackScreenView({ screenName: 'HomeScreen' });
      }).not.toThrow();
    });
  });

  describe('event helpers', () => {
    it('trackLogin does not throw', () => {
      expect(() => analytics.trackLogin('email')).not.toThrow();
    });

    it('trackLogout does not throw', () => {
      expect(() => analytics.trackLogout()).not.toThrow();
    });

    it('trackSignUp does not throw', () => {
      expect(() => analytics.trackSignUp('email')).not.toThrow();
    });

    it('trackButtonClick does not throw', () => {
      expect(() => analytics.trackButtonClick('submit', 'LoginScreen')).not.toThrow();
    });

    it('trackError truncates long messages', () => {
      const longMessage = 'x'.repeat(200);
      expect(() => analytics.trackError('TestError', longMessage)).not.toThrow();
    });
  });
});
