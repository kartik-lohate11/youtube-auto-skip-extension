/**
 * YouTube Auto Skip - Content Script
 * Automatically skips, fast-forwards, and silences YouTube ads.
 */

(function () {
    'use strict';

    // Extension configuration state
    let config = {
        enabled: true,
        fastForward: true,
        autoMute: true,
        adsSkipped: 0
    };

    let extensionMuted = false;
    let originalPlaybackRate = 1;
    let lastSkippedTime = 0;
    let isHandlingAd = false;

    // Load initial settings from chrome.storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(
            { enabled: true, fastForward: true, autoMute: true, adsSkipped: 0 },
            (items) => {
                config = { ...config, ...items };
            }
        );

        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local') {
                for (const key of Object.keys(changes)) {
                    config[key] = changes[key].newValue;
                }
                // If extension was just disabled, revert any mute or playback alterations
                if (changes.enabled && changes.enabled.newValue === false) {
                    revertAdModifications();
                }
            }
        });
    }

    // Modern & legacy selectors for YouTube skip buttons
    const SKIP_BUTTON_SELECTORS = [
        '.ytp-skip-ad-button',
        '.ytp-ad-skip-button-modern',
        '.ytp-ad-skip-button',
        '.ytp-skip-ad-button-modern',
        'button.ytp-ad-skip-button-modern',
        '.ytp-ad-skip-button-container button',
        '.ytp-skip-ad-button-container button',
        '.ytp-ad-skip-button-slot button',
        'button[id^="skip-button"]',
        'button[aria-label*="Skip ad" i]',
        'button[aria-label*="Skip" i]',
        '.videoAdUiSkipButton',
        '.ytp-ad-preview-container button'
    ];

    // Selectors for banner and overlay ad close buttons
    const OVERLAY_CLOSE_SELECTORS = [
        '.ytp-ad-overlay-close-button',
        '.ytp-ad-overlay-close-container button',
        'button.ytp-ad-overlay-close-button',
        '.ytp-ad-image-overlay .ytp-ad-overlay-close-button'
    ];

    // Selectors indicating an ad is currently playing
    const AD_CONTAINER_SELECTORS = [
        '.ad-showing',
        '.ad-interrupting',
        '.ytp-ad-player-overlay',
        '.ytp-ad-player-overlay-layout'
    ];

    function isAdPlaying(player) {
        if (!player) return false;

        for (const selector of AD_CONTAINER_SELECTORS) {
            if (player.matches && player.matches(selector)) return true;
            if (player.querySelector && player.querySelector(selector)) return true;
        }

        // Also check document root for ad-showing
        if (document.querySelector('.ad-showing') || document.querySelector('.ad-interrupting')) {
            return true;
        }

        return false;
    }

    function triggerClick(element) {
        if (!element) return;
        try {
            element.click();
        } catch (e) {
            // Fallback synthetic mouse events
            const mouseEvents = ['mousedown', 'mouseup', 'click'];
            mouseEvents.forEach(evt => {
                element.dispatchEvent(new MouseEvent(evt, {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
            });
        }
    }

    function incrementSkipCount() {
        const now = Date.now();
        // Prevent duplicate counting for the same ad within 2.5 seconds
        if (now - lastSkippedTime > 2500) {
            lastSkippedTime = now;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get({ adsSkipped: 0 }, (items) => {
                    const updated = (items.adsSkipped || 0) + 1;
                    chrome.storage.local.set({ adsSkipped: updated });
                });
            }
        }
    }

    function clickSkipButtons() {
        for (const selector of SKIP_BUTTON_SELECTORS) {
            const btn = document.querySelector(selector);
            if (btn && btn.offsetParent !== null) { // visible in DOM
                triggerClick(btn);
                incrementSkipCount();
                return true;
            }
        }
        return false;
    }

    function closeOverlays() {
        for (const selector of OVERLAY_CLOSE_SELECTORS) {
            const closeBtn = document.querySelector(selector);
            if (closeBtn && closeBtn.offsetParent !== null) {
                triggerClick(closeBtn);
            }
        }
    }

    function dismissAntiAdblockModal() {
        // Dismiss YouTube warning/block modals if present
        const enforcementDialog = document.querySelector(
            'ytd-enforcement-message-view-model, tp-yt-paper-dialog.ytd-popup-container'
        );
        if (enforcementDialog) {
            const dismissBtn = enforcementDialog.querySelector(
                'button[aria-label*="Dismiss" i], #dismiss-button, button.yt-spec-button-shape-next--filled'
            );
            if (dismissBtn) {
                triggerClick(dismissBtn);
            }
        }
    }

    function revertAdModifications() {
        const video = document.querySelector('video');
        if (video) {
            if (extensionMuted) {
                video.muted = false;
                extensionMuted = false;
            }
            if (video.playbackRate > 2) {
                video.playbackRate = originalPlaybackRate || 1;
            }
        }
        isHandlingAd = false;
    }

    function processAds() {
        if (!config.enabled) return;

        const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
        const video = document.querySelector('video');

        // Always check and dismiss banner overlays
        closeOverlays();
        dismissAntiAdblockModal();

        const adActive = isAdPlaying(player);

        if (adActive && video) {
            isHandlingAd = true;

            // 1. Click skip button if available
            const skipped = clickSkipButtons();

            // 2. Auto-mute during ads if enabled
            if (config.autoMute && !video.muted) {
                video.muted = true;
                extensionMuted = true;
            }

            // 3. Fast-forward / jump through unskippable ad or countdown
            if (config.fastForward && !skipped) {
                try {
                    // Set maximum playback rate
                    if (video.playbackRate < 16) {
                        originalPlaybackRate = (video.playbackRate <= 2) ? video.playbackRate : 1;
                        video.playbackRate = 16;
                    }

                    // Jump near or to the end of the ad to trigger completion
                    if (video.duration && isFinite(video.duration) && video.currentTime < video.duration - 0.1) {
                        video.currentTime = video.duration - 0.05;
                    }
                } catch (err) {
                    // Ignore transient seek errors
                }

                // Check again for skip button after time change
                clickSkipButtons();
            }
        } else if (isHandlingAd) {
            // Ad has ended; restore audio and playback rate
            revertAdModifications();
        }
    }

    // Throttled handler for high frequency events
    let scheduled = false;
    function scheduleCheck() {
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(() => {
                processAds();
                scheduled = false;
            });
        }
    }

    // Set up MutationObserver
    function setupObserver() {
        const target = document.getElementById('movie_player') || document.body || document.documentElement;

        const observer = new MutationObserver(() => {
            scheduleCheck();
        });

        observer.observe(target, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'src']
        });

        return observer;
    }

    let observer = null;
    function init() {
        if (!observer) {
            observer = setupObserver();
        }

        // Periodic fallback interval to catch any state transitions
        setInterval(processAds, 250);

        // Listen for YouTube SPA page transitions
        window.addEventListener('yt-navigate-finish', () => {
            revertAdModifications();
            setTimeout(processAds, 100);
            setTimeout(processAds, 500);
        });

        // Listen to video time updates
        document.addEventListener('timeupdate', (e) => {
            if (e.target && e.target.tagName === 'VIDEO') {
                scheduleCheck();
            }
        }, true);

        console.log('[YouTube Auto Skip] Extension initialized successfully.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();