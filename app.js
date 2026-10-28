/* Step by Step: small, dependency-free script.
   - mobile menu
   - recipe checklists (saved in this browser), progress, "up next", cook mode
   - recipe search and filters
   - "Surprise me" */
(function () {
    'use strict';

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    function store(op, key, val) {
        try {
            if (op === 'get') return window.localStorage.getItem(key);
            if (op === 'set') window.localStorage.setItem(key, val);
            if (op === 'del') window.localStorage.removeItem(key);
        } catch (e) { /* storage blocked: the page still works, it just won't remember */ }
        return null;
    }

    /* ---------- mobile menu ---------- */
    var menuBtn = $('.menu-btn');
    var nav = $('.nav');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.focus();
            }
        });
    }

    /* ---------- surprise me ---------- */
    $$('[data-random]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var list = window.SBS_SLUGS || [];
            if (!list.length) return;
            e.preventDefault();
            window.location.href = list[Math.floor(Math.random() * list.length)] + '.html';
        });
    });

    /* ---------- hero demo checklist (not saved) ---------- */
    var demo = $('.demo');
    if (demo) {
        var dInputs = $$('input[type=checkbox]', demo);
        var dCount = $('[data-demo-count]', demo);
        var update = function () {
            var n = dInputs.filter(function (i) { return i.checked; }).length;
            dCount.textContent = n === dInputs.length ? 'Everything is ready.' : n + ' of ' + dInputs.length + ' ready';
        };
        dInputs.forEach(function (i) { i.addEventListener('change', update); });
        update();
    }

    /* ---------- recipe page ---------- */
    var recipe = $('[data-recipe]');
    if (recipe) {
        var slug = recipe.getAttribute('data-recipe');
        var key = 'sbs:' + slug;
        var inputs = $$('input[data-id]', recipe);
        var steps = $$('.step', recipe);
        var finish = $('.finish', recipe);

        var saved = {};
        try { saved = JSON.parse(store('get', key) || '{}') || {}; } catch (e) { saved = {}; }

        inputs.forEach(function (i) { i.checked = !!saved[i.getAttribute('data-id')]; });

        var meter = function (kind) {
            var all = inputs.filter(function (i) { return i.getAttribute('data-kind') === kind; });
            var done = all.filter(function (i) { return i.checked; }).length;
            var m = $('[data-meter="' + kind + '"]');
            if (m) {
                $('[data-count]', m).textContent = done + ' of ' + all.length;
                $('.bar i', m).style.width = (all.length ? (done / all.length) * 100 : 0) + '%';
            }
            return { done: done, total: all.length };
        };

        var refresh = function () {
            meter('ing');
            var s = meter('step');
            var nextSet = false;
            steps.forEach(function (li) {
                var cb = $('input', li);
                var next = !cb.checked && !nextSet;
                if (next) nextSet = true;
                li.classList.toggle('is-next', next);
            });
            if (finish) finish.hidden = !(s.total > 0 && s.done === s.total);
        };

        var persist = function () {
            var out = {};
            inputs.forEach(function (i) { if (i.checked) out[i.getAttribute('data-id')] = 1; });
            if (Object.keys(out).length) store('set', key, JSON.stringify(out)); else store('del', key);
        };

        inputs.forEach(function (i) {
            i.addEventListener('change', function () { persist(); refresh(); });
        });

        $$('[data-reset]').forEach(function (b) {
            b.addEventListener('click', function () {
                inputs.forEach(function (i) { i.checked = false; });
                persist(); refresh();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        refresh();
    }

    /* ---------- cook mode (bigger text, screen stays awake) ---------- */
    var cookBtn = $('[data-cook]');
    if (cookBtn) {
        var lock = null;
        var wake = function () {
            if (!('wakeLock' in navigator)) return;
            navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () { lock = null; });
        };
        cookBtn.addEventListener('click', function () {
            var on = document.body.classList.toggle('cook');
            cookBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
            cookBtn.textContent = on ? 'Cook mode is on' : 'Cook mode';
            if (on) { wake(); } else if (lock) { lock.release(); lock = null; }
        });
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible' && document.body.classList.contains('cook')) wake();
        });
    }

    $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

    /* ---------- recipe list: search + course filter ---------- */
    var list = $('[data-list]');
    if (list) {
        var tiles = $$('.tile', list);
        var input = $('[data-search]');
        var buttons = $$('[data-filter]');
        var count = $('[data-count-out]');
        var empty = $('[data-empty]');
        var state = { q: '', cat: document.body.getAttribute('data-default-cat') || 'all' };

        var readHash = function () {
            var h = window.location.hash.replace(/^#/, '');
            if (h === 'search') { input.focus(); return; }
            var p = new URLSearchParams(h);
            if (p.has('q')) state.q = p.get('q') || '';
            if (p.has('cat')) state.cat = p.get('cat') || 'all';
        };

        var writeHash = function () {
            var p = new URLSearchParams();
            if (state.q) p.set('q', state.q);
            if (state.cat !== (document.body.getAttribute('data-default-cat') || 'all')) p.set('cat', state.cat);
            var s = p.toString();
            try { history.replaceState(null, '', window.location.pathname + (s ? '#' + s : '')); } catch (e) { /* ignore */ }
        };

        var render = function () {
            var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean).map(function (w) {
                return new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            });
            var shown = 0;
            tiles.forEach(function (t) {
                var okCat = state.cat === 'all' || t.getAttribute('data-cat') === state.cat;
                var hay = t.getAttribute('data-search');
                var okQ = terms.every(function (re) { return re.test(hay); });
                var show = okCat && okQ;
                t.hidden = !show;
                if (show) shown++;
            });
            buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === state.cat ? 'true' : 'false'); });
            var where = state.cat === 'all' ? '' : ' in ' + state.cat;
            var what = state.q ? ' for “' + state.q + '”' : '';
            count.textContent = shown + (shown === 1 ? ' recipe' : ' recipes') + where + what;
            empty.hidden = shown !== 0;
            list.hidden = shown === 0;
            var qEl = $('[data-empty-q]');
            if (qEl) qEl.textContent = state.q;
        };

        input.addEventListener('input', function () { state.q = input.value.trim(); writeHash(); render(); });
        buttons.forEach(function (b) {
            b.addEventListener('click', function () { state.cat = b.getAttribute('data-filter'); writeHash(); render(); });
        });
        $$('[data-clear]').forEach(function (b) {
            b.addEventListener('click', function () { state.q = ''; state.cat = 'all'; input.value = ''; writeHash(); render(); input.focus(); });
        });
        window.addEventListener('hashchange', function () { readHash(); input.value = state.q; render(); });

        readHash();
        input.value = state.q;
        render();
    }
})();
