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

export const fetchAuthors = async (keyword) => {
    let url = `${API_BASE_URL}/api/stats/authors`;
    if (keyword && keyword !== 'All') {
        url += `?keyword=${encodeURIComponent(keyword)}`;
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

export const fetchMentions = async (keyword, page = 0, limit = 50) => {
    const offset = page * limit;
    let url = `${API_BASE_URL}/api/mentions?offset=${offset}&limit=${limit}`;
    if (keyword !== 'All') url += `&keyword=${encodeURIComponent(keyword)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch mentions');
    return res.json();
};

export const fetchUniqueAuthors = async (keyword) => {
    let url = `${API_BASE_URL}/api/stats/unique-authors`;
    if (keyword !== 'All') url += `?keyword=${encodeURIComponent(keyword)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch author stats');
    return res.json();
};
