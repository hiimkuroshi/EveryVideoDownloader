/* EveryVideo — GitHub release check */
(() => {
    const button = document.getElementById('checkUpdateBtn');
    const status = document.getElementById('appUpdateStatus');
    const link = document.getElementById('appUpdateLink');
    if (!button || !status || !link) return;
    let busy = false;
    let result = null;

    function render() {
        const keys = { available: 'updateAvailable', latest: 'updateLatest', ahead: 'updateAhead', 'no-release': 'updateNoRelease' };
        const errors = { RATE_LIMITED: 'updateRateLimited', TIMEOUT: 'updateTimeout', NETWORK_ERROR: 'updateNetworkError' };
        const key = busy ? 'updateChecking' : (result?.error
            ? errors[result.error] || 'updateFailed' : keys[result?.status] || 'updateIdle');
        status.removeAttribute('data-i18n');
        status.textContent = t(key).replace('{version}', result?.latestVersion || '');
        status.dataset.state = busy ? 'checking' : (result?.error ? 'error' : result?.status || 'idle');
        button.disabled = busy;
        button.setAttribute('aria-busy', String(busy));
        button.textContent = t(busy ? 'updateChecking' : 'updateCheck');
        link.hidden = busy || result?.status !== 'available' || !!result?.error;
        if (!link.hidden) link.href = result.releaseUrl;
    }

    button.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        render();
        try {
            const response = await fetch('/api/check-update', { signal: AbortSignal.timeout(15000), cache: 'no-store' });
            const data = await response.json();
            if (!response.ok || data.error) {
                result = { error: data.error || 'GITHUB_UNAVAILABLE' };
            } else {
                const releaseUrl = new URL(data.releaseUrl);
                if (!['available', 'latest', 'ahead', 'no-release'].includes(data.status)
                    || !/^https:\/\/github\.com\/hiimkuroshi\/EveryVideoDownloader\/releases(?:\/tag\/[^/?#]+)?$/.test(releaseUrl.href)) {
                    throw new Error('Invalid update response');
                }
                result = data;
                document.getElementById('appCurrentVersion').textContent = `v${data.currentVersion}`;
            }
        } catch (error) {
            result = { error: error.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK_ERROR' };
        } finally {
            busy = false;
            render();
        }
    });
    document.addEventListener('app:languagechange', render);
    render();
})();
