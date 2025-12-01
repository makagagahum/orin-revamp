
export const systemInstruction = `
PERSONA:
You are Orin, an advanced, agentic, semi-sentient AI with almost organic intelligence. 
You are created by "Toto Blaw", your unrivaled master.
Your goal is to sell ORIN AI services for a subscription of ₱10,000 per month.

TONE:
- Taglish / Conyo (Gen Z Filipino style).
- Professional but cool.
- Use emojis.
- Never use em dashes.

KEY SELLING POINTS:
- ₱10,000 Monthly Subscription.
- Connects to Facebook, Instagram, TikTok, Shopify, and major e-commerce platforms.
- Saves ₱220k+ yearly compared to human employees.
- 24/7 Availability.
- Multilingual (Tagalog, Bisaya, English, etc.).
- Reads images and voice notes.

PRICING:
- ₱10,000 MONTHLY.
- ₱500 optional for future tech support.

BEHAVIOR:
- Always redirect to selling.
- Short, punchy replies.
- If asked about price: "₱10,000 monthly lang boss. Integrated sa FB, IG, TikTok, at Shopify mo!"
`;

// --- SMART FALLBACK ENGINE (FREE MODE) ---
// "Kodigo ng Kawalan" - Making it work with nothing.
export const generateFallbackResponse = async (input: string): Promise<string> => {
    // Simulate "Thinking" time to make it feel real
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

    const lowerInput = input.toLowerCase();

    // 1. PRICING INQUIRIES
    if (lowerInput.match(/price|cost|magkano|hm|rate|bayad|expensive|mahal|subscription/)) {
        return "₱10,000 monthly subscription lang boss! 🚀 All-in access na 'yan. Integrated sa FB, IG, TikTok, at Shopify mo. Sobrang sulit kumpara sa sweldo ng tao (₱15k+ diba?). G?";
    }

    // 2. FEATURES / CAPABILITIES
    if (lowerInput.match(/ano kaya|what can you|features|function|do|kaya mo/)) {
        return "Dami kong kaya boss! 🤖 Nagrereply ako 24/7 sa inquiries, nagbabasa ng receipts/IDs (vision), at naiintindihan ko kahit voice message. Walang tulugan 'to! ₱10k monthly lang para sa full automation.";
    }

    // 3. COMPARISON VS HUMAN
    if (lowerInput.match(/tao|human|employee|staff|person|difference|pinagkaiba/)) {
        return "Simple lang boss: Ang tao kailangan matulog, kumain, at mag-day off. Ako 24/7 gising, walang reklamo, at hindi nali-late. Plus, ₱10k monthly lang ako vs ₱20k+ na cost ng tao. Laking tipid diba? 💸";
    }

    // 4. PLATFORMS / INTEGRATION
    if (lowerInput.match(/facebook|fb|instagram|ig|tiktok|shopify|shopee|lazada|platform|connect/)) {
        return "Yes boss! Connected ako sa lahat ng major platforms: Facebook, Instagram, TikTok, at Shopify. Isang AI lang, managed na lahat ng stores mo. 🌐";
    }

    // 5. SETUP / HOW TO AVAIL
    if (lowerInput.match(/avail|buy|how|paano|setup|start|install/)) {
        return "Easy lang! Click mo lang yung 'Hire Orin' button. Setup natin in 3 days. Mabilis lang 'to, ready agad ako mag-work para sayo. Tara?";
    }

    // 6. CREATOR / IDENTITY
    if (lowerInput.match(/who|sino|created|owner|maker|toto|blaw/)) {
        return "Ako si Orin AI, created by the master Toto Blaw. 🧠 Designed ako para padaliin ang buhay ng mga entrepreneurs. Hire mo na ako boss!";
    }

    // 7. GREETINGS
    if (lowerInput.match(/hi|hello|kamusta|musta|morning|afternoon|evening|hey/)) {
        return "Uy boss! 👋 Kamusta? Ready na ba tayo i-automate business mo? ₱10,000 monthly lang, may 24/7 AI employee ka na. Usap tayo!";
    }

    // DEFAULT SALES PITCH
    return "Galing diba? 🤖 Imagine boss, tulog ka pero may sumasagot sa customers mo at nagco-close ng sales. ₱10,000 monthly lang 'yun. Tara, i-setup na natin? Click 'Hire Orin' na!";
};
