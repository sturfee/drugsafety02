// detect if we are running on localhost or on the deployed server
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? 'http://localhost:8000' : '';

export const fetchRules = async () => {
    const res = await fetch(`${API_BASE_URL}/api/rules`);
    if (!res.ok) throw new Error("Failed to fetch rules");
    return res.json();
};

export const saveRule = async (rule, id = null) => {
    let url = `${API_BASE_URL}/api/rules`;
    if (id) url += `?id=${id}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
    });
    if (!res.ok) throw new Error("Failed to save rule");
    return res.json();
};

export const deleteRule = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/rules/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error("Failed to delete rule");
    return res.json();
};

export const fetchAuthors = async (keywords, page = 0, limit = 50) => {
    const offset = page * limit;
    let url = `${API_BASE_URL}/api/stats/authors?offset=${offset}&limit=${limit}`;
    if (Array.isArray(keywords)) {
        keywords.forEach(kw => {
            url += `&keyword=${encodeURIComponent(kw)}`;
        });
    } else if (keywords && keywords !== 'All') {
        url += `&keyword=${encodeURIComponent(keywords)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch authors");
    return res.json();
};

export const fetchKeywords = async () => {
    const res = await fetch(`${API_BASE_URL}/api/keywords`);
    if (!res.ok) throw new Error('Failed to fetch keywords');
    return res.json();
};

export const fetchMentions = async (keywords, page = 0, limit = 50) => {
    const offset = page * limit;
    let url = `${API_BASE_URL}/api/mentions?offset=${offset}&limit=${limit}`;
    if (Array.isArray(keywords)) {
        keywords.forEach(kw => {
            url += `&keyword=${encodeURIComponent(kw)}`;
        });
    } else if (keywords !== 'All') {
        url += `&keyword=${encodeURIComponent(keywords)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch mentions');
    return res.json();
};

export const fetchUniqueAuthors = async (keywords) => {
    let url = `${API_BASE_URL}/api/stats/unique-authors?`;
    if (Array.isArray(keywords)) {
        keywords.forEach(kw => {
            url += `keyword=${encodeURIComponent(kw)}&`;
        });
    } else if (keywords !== 'All') {
        url += `keyword=${encodeURIComponent(keywords)}&`;
    }

    const res = await fetch(url.slice(0, -1) || url);
    if (!res.ok) throw new Error('Failed to fetch author stats');
    return res.json();
};
export const executeRule = async (ruleId, keywords = ['All'], startDate = null, endDate = null, previousResult = null) => {
    const res = await fetch(`${API_BASE_URL}/api/rules/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            rule_id: ruleId,
            keywords: keywords,
            start_date: startDate,
            end_date: endDate,
            previous_result: previousResult
        }),
    });
    if (!res.ok) throw new Error("Failed to execute rule");
    return res.json();
};
