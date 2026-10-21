'use strict';

window.MediaDiscovery = (() => {
    const root = document.querySelector('[data-media-discovery]');
    let result = null;
    let filter = 'all';
    const downloads = new Set();
    const text = key => window.t ? window.t(key) : key;

    function element(tag, className, content) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (content !== undefined) node.textContent = content;
        return node;
    }

    function setStatus(message) {
        root.querySelector('[data-media-status]').textContent = message;
    }

    async function copyUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const input = element('textarea');
            input.value = url;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.append(input);
            input.select();
            const copied = document.execCommand('copy');
            input.remove();
            if (!copied) throw new Error(text('mediaCopyFailed'));
        }
    }

    function download(asset, status, button, cancel) {
        const params = new URLSearchParams({ resolution_id: result.resolution_id, asset_id: asset.id });
        const output = document.getElementById('quickDownloadFolder')?.value.trim();
        if (output) params.set('output', output);
        const source = new EventSource(`/api/media-download?${params}`);
        downloads.add(source);
        root.querySelectorAll('[data-media-filter]').forEach(item => { item.disabled = true; });
        button.disabled = true;
        cancel.hidden = false;
        status.textContent = text('mediaDownloading');
        const finish = () => { source.close(); downloads.delete(source); button.disabled = false; cancel.hidden = true; if (!downloads.size) root.querySelectorAll('[data-media-filter]').forEach(item => { item.disabled = false; }); };
        cancel.onclick = () => { finish(); status.textContent = text('mediaCancelled'); };
        source.onmessage = event => {
            let data;
            try { data = JSON.parse(event.data); } catch { return; }
            if (data.progress?.percent != null) status.textContent = `${text('mediaDownloading')} ${Math.round(data.progress.percent)}%`;
            if (data.done) {
                status.textContent = data.code === 0 ? `${text('mediaSaved')} ${data.fileName || ''}` : text(`mediaError_${data.error}`);
                if (data.code !== 0 && status.textContent === `mediaError_${data.error}`) status.textContent = text('mediaDownloadFailed');
                finish();
            }
        };
        source.onerror = () => { finish(); status.textContent = text('mediaDownloadFailed'); };
    }

    function assetCard(asset) {
        const row = element('article', 'media-asset');
        const kind = asset.role === 'thumbnail' ? 'thumbnail' : asset.type;
        if (asset.type === 'image' && ['verified', 'available'].includes(asset.status)) {
            const image = element('img', 'media-asset-preview');
            image.src = `/api/media-preview?${new URLSearchParams({ resolution_id: result.resolution_id, asset_id: asset.id })}`;
            image.alt = asset.title || text('mediaImage');
            image.loading = 'lazy';
            image.onerror = () => { image.hidden = true; };
            row.append(image);
        }
        const body = element('div', 'media-asset-body');
        const title = element('h3', '', asset.title || new URL(asset.url).pathname.split('/').pop() || new URL(asset.url).hostname);
        const meta = element('div', 'media-asset-meta');
        meta.append(element('span', 'media-type-badge', text(`mediaType_${kind}`)), element('span', '', asset.quality || asset.ext.toUpperCase()), element('span', `media-status-${asset.status}`, text(`mediaStatus_${asset.status}`)));
        if (asset.filesize) meta.append(element('span', '', `${(asset.filesize / 1024 / 1024).toFixed(2)} MB`));
        const input = element('input', 'media-asset-url');
        input.readOnly = true;
        input.value = asset.url;
        input.setAttribute('aria-label', `${text('mediaSourceUrl')}: ${title.textContent}`);
        input.addEventListener('focus', () => input.select());
        body.append(title, meta, input);
        if (asset.type === 'manifest') body.append(element('p', 'media-asset-hint', text('mediaManifestHint')));
        const status = element('output', 'media-download-status');
        status.setAttribute('aria-live', 'polite');
        body.append(status);
        const actions = element('div', 'media-asset-actions');
        const copy = element('button', 'btn-secondary', text('mediaCopy'));
        const save = element('button', 'btn-primary', text('mediaSave'));
        const cancel = element('button', 'btn-secondary', text('mediaCancel'));
        for (const button of [copy, save, cancel]) button.type = 'button';
        cancel.hidden = true;
        copy.addEventListener('click', async () => {
            try { await copyUrl(asset.url); copy.textContent = text('mediaCopied'); }
            catch { status.textContent = text('mediaCopyFailed'); }
        });
        save.disabled = !['verified', 'available', 'unverified'].includes(asset.status);
        save.addEventListener('click', () => download(asset, status, save, cancel));
        actions.append(copy, save, cancel);
        row.append(body, actions);
        return row;
    }

    function render(next = result) {
        if (next && downloads.size) return;
        result = next;
        root.classList.toggle('hidden', !result);
        root.closest('.workstation-grid')?.classList.toggle('media-discovery-active', !!result && !result.info);
        if (!result) return;
        const list = root.querySelector('[data-media-assets]');
        list.replaceChildren();
        const items = result.assets.filter(asset => filter === 'all' || asset.type === filter);
        for (const asset of items) list.append(assetCard(asset));
        if (!items.length) list.append(element('p', 'media-empty', text('mediaNoResults')));
        setStatus(`${result.title || ''} · ${result.assets.length} ${text('mediaSources')}`);
        const notice = root.querySelector('[data-media-notice]');
        notice.textContent = result.warnings.includes('BROWSER_UNAVAILABLE') ? text('mediaBrowserUnavailable') : result.assets.some(asset => asset.status !== 'verified') ? text('mediaPartial') : text('mediaUrlHint');
        for (const button of root.querySelectorAll('[data-media-filter]')) {
            button.classList.toggle('active', button.dataset.mediaFilter === filter);
            button.setAttribute('aria-pressed', String(button.dataset.mediaFilter === filter));
        }
    }

    root.querySelectorAll('[data-media-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.mediaFilter; render(); }));
    return {
        render,
        reset: () => { filter = 'all'; for (const source of downloads) source.close(); downloads.clear(); root.querySelectorAll('[data-media-filter]').forEach(item => { item.disabled = false; }); render(null); },
        browserMode: () => document.querySelector('[data-media-deep]')?.checked ? 'always' : 'auto',
        errorText: code => text(`mediaError_${code}`) === `mediaError_${code}` ? text('mediaResolveFailed') : text(`mediaError_${code}`),
    };
})();
