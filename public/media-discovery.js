'use strict';

window.MediaDiscovery = (() => {
    const root = document.querySelector('[data-media-discovery]');
    const tabs = [...document.querySelectorAll('[data-explorer-tab]')];
    const formatsPanel = document.querySelector('[data-explorer-panel="formats"]');
    let result = null;
    let activeTab = 'formats';
    let filter = 'all';
    const downloads = new Set();
    const audioChoices = new Map();
    const text = key => window.t ? window.t(key) : key;

    function syncTabs() {
        for (const tab of tabs) {
            const selected = tab.dataset.explorerTab === activeTab;
            tab.disabled = tab.dataset.explorerTab === 'media' ? !result : !!result && !result.info;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        }
        formatsPanel.hidden = activeTab !== 'formats';
        root.hidden = activeTab !== 'media' || !result;
        document.querySelector('[data-media-source-count]').textContent = result ? `(${result.assets.length})` : '';
    }

    function selectTab(tab, moveFocus = false) {
        if (tab.disabled) return;
        activeTab = tab.dataset.explorerTab;
        syncTabs();
        if (moveFocus) tab.focus();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', event => {
            const available = tabs.filter(item => !item.disabled);
            const index = available.indexOf(tab);
            let next;
            if (event.key === 'ArrowRight') next = available[(index + 1) % available.length];
            if (event.key === 'ArrowLeft') next = available[(index - 1 + available.length) % available.length];
            if (event.key === 'Home') next = available[0];
            if (event.key === 'End') next = available[available.length - 1];
            if (!next) return;
            event.preventDefault();
            selectTab(next, true);
        });
    });

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

    function download(asset, status, button, cancel, audioSelect) {
        const params = new URLSearchParams({ resolution_id: result.resolution_id, asset_id: asset.id });
        if (audioSelect) params.set('audio_asset_id', audioSelect.value);
        const output = document.getElementById('quickDownloadFolder')?.value.trim();
        if (output) params.set('output', output);
        const source = new EventSource(`/api/media-download?${params}`);
        downloads.add(source);
        root.querySelectorAll('[data-media-filter]').forEach(item => { item.disabled = true; });
        button.disabled = true;
        if (audioSelect) audioSelect.disabled = true;
        cancel.hidden = false;
        status.textContent = text('mediaDownloading');
        const finish = () => { source.close(); downloads.delete(source); button.disabled = false; if (audioSelect) audioSelect.disabled = false; cancel.hidden = true; if (!downloads.size) root.querySelectorAll('[data-media-filter]').forEach(item => { item.disabled = false; }); };
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
        let audioSelect;
        if (['video', 'manifest'].includes(asset.type) && !asset.audio_only) {
            const tracks = result.assets.filter(item => (item.audio_only || item.type === 'audio') && ['verified', 'available', 'unverified'].includes(item.status));
            if (tracks.length) {
                const label = element('label', 'media-audio-choice', text('mediaAudioTrack'));
                audioSelect = element('select', 'merge-track-select');
                audioSelect.setAttribute('aria-label', `${text('mediaAudioTrack')}: ${title.textContent}`);
                audioSelect.append(new Option(text('mediaVideoOnly'), 'none'));
                for (const track of tracks) audioSelect.append(new Option(`${track.id === asset.audio_asset_id ? text('mediaAutoAudio') + ' · ' : ''}${track.quality || track.ext.toUpperCase()} · ${track.title || text('mediaType_audio')}`, track.id));
                audioSelect.value = audioChoices.get(asset.id) || asset.audio_asset_id || 'none';
                label.append(audioSelect);
                body.append(label, element('p', 'media-asset-hint', text(asset.audio_asset_id ? 'mediaAutoMergeHint' : 'mediaChooseAudioHint')));
            } else if (asset.video_only) body.append(element('p', 'media-asset-hint', text('mediaNoAudioHint')));
        }
        const status = element('output', 'media-download-status');
        status.setAttribute('aria-live', 'polite');
        body.append(status);
        const actions = element('div', 'media-asset-actions');
        const copy = element('button', 'btn-secondary', text('mediaCopy'));
        const save = element('button', 'btn-primary', text(audioSelect && audioSelect.value !== 'none' ? 'mediaSaveMerged' : 'mediaSave'));
        audioSelect?.addEventListener('change', () => {
            audioChoices.set(asset.id, audioSelect.value);
            save.textContent = text(audioSelect.value === 'none' ? 'mediaSave' : 'mediaSaveMerged');
        });
        const cancel = element('button', 'btn-secondary', text('mediaCancel'));
        for (const button of [copy, save, cancel]) button.type = 'button';
        cancel.hidden = true;
        copy.addEventListener('click', async () => {
            try { await copyUrl(asset.url); copy.textContent = text('mediaCopied'); }
            catch { status.textContent = text('mediaCopyFailed'); }
        });
        save.disabled = !['verified', 'available', 'unverified'].includes(asset.status);
        save.addEventListener('click', () => download(asset, status, save, cancel, audioSelect));
        actions.append(copy, save, cancel);
        row.append(body, actions);
        return row;
    }

    function render(next = result) {
        if (next && downloads.size) return;
        if (next !== result) { activeTab = next && !next.info ? 'media' : 'formats'; audioChoices.clear(); }
        result = next;
        syncTabs();
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
