const apiKeys = process.env.OWM_API_KEYS
    ? process.env.OWM_API_KEYS.split(",").map(k => k.trim()).filter(Boolean)
    : [];
let currentKeyIndex = 0;

async function fetchWithFallback(urlBuilder) {
    for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[currentKeyIndex];
        const url = urlBuilder(key);
        try {
            const res = await fetch(url);
            if (res.status !== 200) {
                console.warn(`⚠ API key ${key} bị lỗi ${res.status}, thử key khác...`);
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                continue;
            }
            return await res.json();
        } catch (err) {
            console.error("❌ Lỗi khi fetch:", err);
        }
    }
    return { error: true, content: "❌ Tất cả API key đều không dùng được." };
}

module.exports = { fetchWithFallback };