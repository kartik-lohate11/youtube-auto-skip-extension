/**
 * YouTube Auto Skip - Popup Logic
 * Handles user controls and synchronization with chrome.storage.
 */

document.addEventListener('DOMContentLoaded', () => {
    const masterToggle = document.getElementById('masterToggle');
    const fastForwardToggle = document.getElementById('fastForwardToggle');
    const autoMuteToggle = document.getElementById('autoMuteToggle');
    const statusCard = document.getElementById('statusCard');
    const statusLabel = document.getElementById('statusLabel');
    const statusSub = document.getElementById('statusSub');
    const ambientGlow = document.getElementById('ambientGlow');
    const adsCount = document.getElementById('adsCount');
    const resetStatsBtn = document.getElementById('resetStatsBtn');

    function updateStatusUI(enabled) {
        if (enabled) {
            statusCard.classList.remove('inactive');
            ambientGlow.classList.remove('disabled');
            statusLabel.textContent = 'Active';
            statusSub.textContent = 'Skipping detected ads';
        } else {
            statusCard.classList.add('inactive');
            ambientGlow.classList.add('disabled');
            statusLabel.textContent = 'Disabled';
            statusSub.textContent = 'Auto-skipping paused';
        }
    }

    // Load initial settings
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(
            {
                enabled: true,
                fastForward: true,
                autoMute: true,
                adsSkipped: 0
            },
            (data) => {
                masterToggle.checked = data.enabled;
                fastForwardToggle.checked = data.fastForward;
                autoMuteToggle.checked = data.autoMute;
                adsCount.textContent = (data.adsSkipped || 0).toLocaleString();
                updateStatusUI(data.enabled);
            }
        );

        // Listen for live storage updates (e.g., ads skipped counter incrementing)
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local') {
                if (changes.adsSkipped) {
                    adsCount.textContent = (changes.adsSkipped.newValue || 0).toLocaleString();
                }
                if (changes.enabled) {
                    masterToggle.checked = changes.enabled.newValue;
                    updateStatusUI(changes.enabled.newValue);
                }
            }
        });
    }

    // Master Toggle Listener
    masterToggle.addEventListener('change', () => {
        const isEnabled = masterToggle.checked;
        updateStatusUI(isEnabled);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ enabled: isEnabled });
        }
    });

    // Fast-Forward Toggle Listener
    fastForwardToggle.addEventListener('change', () => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ fastForward: fastForwardToggle.checked });
        }
    });

    // Auto-Mute Toggle Listener
    autoMuteToggle.addEventListener('change', () => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ autoMute: autoMuteToggle.checked });
        }
    });

    // Reset Counter Listener
    resetStatsBtn.addEventListener('click', () => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ adsSkipped: 0 }, () => {
                adsCount.textContent = '0';
            });
        }
    });
});