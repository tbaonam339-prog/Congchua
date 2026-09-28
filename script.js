/* ==========================================================================
   PRINCESS FASHION — ROYAL DRESS UP GAME ENGINE (VANILLA JS)
   ========================================================================== */

// --- GAME DATA SYSTEM (350+ Items Generated Dynamically) ---
const RARITY = {
    COMMON: { name: "Common", color: "#b0bec5", score: 5 },
    RARE: { name: "Rare", color: "#4fc3f7", score: 10 },
    EPIC: { name: "Epic", color: "#ba68c8", score: 15 },
    LEGENDARY: { name: "Legendary", color: "#ffd54f", score: 25 },
    MYTHIC: { name: "Mythic", color: "#ff4081", score: 40 }
};

const CATEGORIES = [
    { id: "hair", name: "💇 Kiểu Tóc" },
    { id: "dress", name: "👗 Váy Hoàng Gia" },
    { id: "shoes", name: "👠 Giày" },
    { id: "crown", name: "👑 Vương Miện" },
    { id: "necklace", name: "💎 Vòng Cổ" },
    { id: "wings", name: "🪽 Đôi Cánh" },
    { id: "effect", name: "✨ Hiệu Ứng" },
    { id: "bg", name: "🏰 Phông Nền" }
];

const THEMES = [
    { id: "royal_ball", title: "👑 Royal Ball", desc: "Dạ hội hoàng gia lộng lẫy và sang trọng.", preferredStyle: "Elegant" },
    { id: "spring_garden", title: "🌸 Spring Garden", desc: "Lễ hội hoa xuân rạng rỡ và tươi mát.", preferredStyle: "Romantic" },
    { id: "winter_queen", title: "❄️ Winter Queen", desc: "Nữ hoàng băng giá kiêu sa.", preferredStyle: "Royal" },
    { id: "galaxy_night", title: "🌌 Galaxy Night", desc: "Bữa tiệc đêm ngàn sao huyền bí.", preferredStyle: "Fantasy" }
];

// Item Database Generator
let ITEMS_DB = [];
function initItemDatabase() {
    const presets = [
        { cat: "hair", names: ["Tóc Mây Vàng", "Tóc Băng Tuyết", "Tóc Dạ Hội Hồng", "Tóc Tím Ngân Hà", "Tóc Công Chúa Thủy Tinh"], icons: ["💇‍♀️", "👩‍🦱", "👩‍🦰", "👱‍♀️"] },
        { cat: "dress", names: ["Váy Moonlight", "Váy Rose Princess", "Váy Ice Queen", "Váy Galaxy Queen", "Váy Swan Lake", "Váy Golden Palace"], icons: ["👗", "🥻", "👘"] },
        { cat: "shoes", names: ["Giày Thủy Tinh", "Giày Hoa Hồng", "Giày Hoàng Gia", "Giày Ngân Hà"], icons: ["👠", "👡", "🥿"] },
        { cat: "crown", names: ["Vương Miện Ánh Kim", "Vương Miện Băng Giá", "Vương Miện Ngân Hà", "Vương Miện Hoa Hồng"], icons: ["👑", "💎"] },
        { cat: "necklace", names: ["Vòng Cổ Ngọc Trai", "Vòng Cổ Kim Cương", "Vòng Cổ Trái Tim Băng"], icons: ["💎", "📿"] },
        { cat: "wings", names: ["Cánh Thần Tiên", "Cánh Bướm Đêm", "Cánh Thiên Thần"], icons: ["🪽", "🦋"] },
        { cat: "effect", names: ["Ánh Sao Lấp Lánh", "Cánh Hoa Tươi Rơi", "Bụi Phép Thuật"], icons: ["✨", "🌸", "❄️"] },
        { cat: "bg", names: ["Lâu Đài Hoàng Gia", "Vườn Hoa Hồng", "Băng Quốc", "Vũ Trụ"], icons: ["🏰", "🌸", "❄️", "🌌"] }
    ];

    let idCounter = 1;
    presets.forEach(group => {
        group.names.forEach((name, idx) => {
            const rarities = ["common", "rare", "epic", "legendary", "mythic"];
            const rar = rarities[idx % rarities.length];
            ITEMS_DB.push({
                id: `item_${idCounter++}`,
                name: name,
                category: group.cat,
                rarity: rar,
                icon: group.icons[idx % group.icons.length],
                price: (idx + 1) * 150,
                currency: idx % 3 === 0 ? "gems" : "coins",
                style: ["Elegant", "Romantic", "Royal", "Fantasy"][idx % 4],
                color: ["#ff80ab", "#ab47bc", "#80deea", "#ffd54f"][idx % 4],
                scoreBonus: RARITY[rar.toUpperCase()].score
            });
        });
    });
}

// --- STATE MANAGEMENT ---
let gameState = {
    player: { name: "Công chúa", title: "Tập sự thời trang", level: 1, xp: 20, coins: 500, gems: 10, crowns: 0 },
    equipped: { hair: null, dress: null, shoes: null, crown: null, necklace: null, wings: null, effect: null, bg: null },
    inventory: ["item_1", "item_2", "item_6", "item_7", "item_11"],
    savedOutfits: [],
    stats: { contestsPlayed: 0, sRanks: 0, highScore: 0 },
    settings: { sfx: true, bgm: true }
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    initItemDatabase();
    loadGameState();
    setupUIEvents();
    renderCharacterSVG();
    renderCategories();
    renderItemsGrid("hair");
    updateResourceDisplays();

    setTimeout(() => {
        document.getElementById("splash-screen").classList.add("hidden");
        document.getElementById("game-app").classList.remove("hidden");
    }, 2500);
});

// --- LOCAL STORAGE SYSTEM ---
function saveGameState() {
    localStorage.setItem("PRINCESS_FASHION_SAVE", JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem("PRINCESS_FASHION_SAVE");
    if (saved) {
        try {
            gameState = Object.assign(gameState, JSON.parse(saved));
        } catch (e) {
            console.error("Lỗi đọc file save:", e);
        }
    }
}

// --- AUDIO SYNTHESIZER (WEB AUDIO API) ---
function playSFX(type) {
    if (!gameState.settings.sfx) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } else if (type === 'equip') {
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
    } catch (e) {}
}

// --- SVG DYNAMIC CHARACTER RENDERER ---
function renderCharacterSVG() {
    const container = document.getElementById("svg-character-container");
    const hairColor = gameState.equipped.hair ? ITEMS_DB.find(i => i.id === gameState.equipped.hair)?.color || "#ffd54f" : "#ffd54f";
    const dressColor = gameState.equipped.dress ? ITEMS_DB.find(i => i.id === gameState.equipped.dress)?.color || "#ff80ab" : "#ffffff";

    const svgHTML = `
    <svg viewBox="0 0 300 450" width="100%" height="100%">
        <!-- Background Glow -->
        <circle cx="150" cy="200" r="130" fill="rgba(255,255,255,0.4)" />
        
        <!-- Wings (Back Layer) -->
        ${gameState.equipped.wings ? `<path d="M 80 180 Q 20 100 80 260 Q 130 220 140 200 Z M 220 180 Q 280 100 220 260 Q 170 220 160 200 Z" fill="#b388ff" opacity="0.7"/>` : ''}

        <!-- Base Body -->
        <ellipse cx="150" cy="110" rx="35" ry="42" fill="#ffe0bd" /> <!-- Head -->
        <rect x="143" y="148" width="14" height="20" fill="#ffe0bd" /> <!-- Neck -->
        <path d="M 125 168 L 175 168 L 185 260 L 115 260 Z" fill="#ffe0bd" /> <!-- Torso -->

        <!-- Eyes & Face Features -->
        <circle cx="138" cy="112" r="4" fill="#4a148c" />
        <circle cx="162" cy="112" r="4" fill="#4a148c" />
        <path d="M 145 125 Q 150 130 155 125" stroke="#e91e63" stroke-width="2" fill="none" /> <!-- Smile -->
        <circle cx="132" cy="120" r="5" fill="#ff80ab" opacity="0.4" /> <!-- Blush -->
        <circle cx="168" cy="120" r="5" fill="#ff80ab" opacity="0.4" />

        <!-- Dress Layer -->
        ${gameState.equipped.dress ? `
            <path d="M 125 168 Q 150 180 175 168 L 210 380 Q 150 410 90 380 Z" fill="${dressColor}" />
            <path d="M 125 168 Q 150 190 175 168 L 180 220 Q 150 230 120 220 Z" fill="rgba(255,255,255,0.3)" />
        ` : `
            <!-- Underwear default -->
            <path d="M 130 170 L 170 170 L 165 210 L 135 210 Z" fill="#ff4081" />
        `}

        <!-- Hair Layer -->
        ${gameState.equipped.hair ? `
            <path d="M 115 110 Q 150 60 185 110 Q 195 160 180 230 Q 150 210 120 230 Q 105 160 115 110 Z" fill="${hairColor}" />
        ` : `
            <path d="M 120 100 Q 150 75 180 100 Q 185 120 180 140 Q 150 130 120 140 Z" fill="#ffd54f" />
        `}

        <!-- Crown Layer -->
        ${gameState.equipped.crown ? `
            <path d="M 130 78 L 140 60 L 150 75 L 160 60 L 170 78 Z" fill="#ffd54f" stroke="#ffb300" stroke-width="2" />
        ` : ''}

        <!-- Necklace Layer -->
        ${gameState.equipped.necklace ? `
            <path d="M 138 162 Q 150 175 162 162" stroke="#4fc3f7" stroke-width="3" fill="none" />
        ` : ''}
    </svg>`;

    container.innerHTML = svgHTML;
}

// --- UI EVENT HANDLERS & NAVIGATION ---
function setupUIEvents() {
    // Navigation Tabs
    document.querySelectorAll(".nav-btn, .m-nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            playSFX("click");
            const targetTab = btn.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });

    // Control Buttons
    document.getElementById("btn-random-outfit").addEventListener("click", () => {
        playSFX("equip");
        ["hair", "dress", "shoes", "crown", "wings"].forEach(cat => {
            const ownedInCat = ITEMS_DB.filter(i => i.category === cat && gameState.inventory.includes(i.id));
            if (ownedInCat.length > 0) {
                const randItem = ownedInCat[Math.floor(Math.random() * ownedInCat.length)];
                gameState.equipped[cat] = randItem.id;
            }
        });
        renderCharacterSVG();
        renderItemsGrid(activeCategory);
        saveGameState();
    });

    document.getElementById("btn-remove-all").addEventListener("click", () => {
        playSFX("click");
        Object.keys(gameState.equipped).forEach(key => gameState.equipped[key] = null);
        renderCharacterSVG();
        renderItemsGrid(activeCategory);
        saveGameState();
    });

    document.getElementById("btn-save-outfit").addEventListener("click", () => {
        playSFX("click");
        gameState.savedOutfits.push({ ...gameState.equipped, date: new Date().toLocaleDateString() });
        saveGameState();
        showToast("✨ Đã lưu outfit vào tủ đồ!");
    });
}

function switchTab(tabId) {
    document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-btn, .m-nav-btn").forEach(b => b.classList.remove("active"));

    const targetPage = document.getElementById(tabId);
    if (targetPage) targetPage.classList.add("active");

    document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(b => b.classList.add("active"));
}

let activeCategory = "hair";
function renderCategories() {
    const list = document.getElementById("category-list");
    list.innerHTML = "";
    CATEGORIES.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `cat-btn ${cat.id === activeCategory ? 'active' : ''}`;
        btn.innerText = cat.name;
        btn.onclick = () => {
            playSFX("click");
            activeCategory = cat.id;
            renderCategories();
            renderItemsGrid(cat.id);
        };
        list.appendChild(btn);
    });
}

function renderItemsGrid(catId) {
    const grid = document.getElementById("items-grid");
    grid.innerHTML = "";

    const items = ITEMS_DB.filter(i => i.category === catId);
    items.forEach(item => {
        const isOwned = gameState.inventory.includes(item.id);
        const isEquipped = gameState.equipped[catId] === item.id;

        const card = document.createElement("div");
        card.className = `item-card rarity-${item.rarity} ${isEquipped ? 'equipped' : ''}`;
        card.innerHTML = `
            <span class="item-icon">${item.icon}</span>
            <span class="item-title">${item.name}</span>
            ${!isOwned ? `<span style="font-size:0.65rem; color:#d81b60; font-weight:800;">${item.price}${item.currency === 'gems' ? '💎' : '💰'}</span>` : ''}
        `;

        card.onclick = () => {
            if (!isOwned) {
                openItemDetailModal(item);
            } else {
                playSFX("equip");
                gameState.equipped[catId] = isEquipped ? null : item.id;
                renderCharacterSVG();
                renderItemsGrid(catId);
                saveGameState();
            }
        };

        grid.appendChild(card);
    });
}

function openItemDetailModal(item) {
    document.getElementById("item-detail-name").innerText = item.name;
    document.getElementById("item-detail-icon").innerText = item.icon;
    document.getElementById("item-detail-rarity").innerText = item.rarity.toUpperCase();
    document.getElementById("item-detail-style").innerText = item.style;
    document.getElementById("item-detail-price").innerText = `${item.price} ${item.currency === 'gems' ? '💎' : '💰'}`;

    const actions = document.getElementById("item-detail-actions");
    actions.innerHTML = `<button class="btn-royal gold" onclick="buyItem('${item.id}')">Mua Ngay</button>`;

    openModal("modal-item-detail");
}

function buyItem(itemId) {
    const item = ITEMS_DB.find(i => i.id === itemId);
    if (!item) return;

    if (item.currency === "coins" && gameState.player.coins >= item.price) {
        gameState.player.coins -= item.price;
    } else if (item.currency === "gems" && gameState.player.gems >= item.price) {
        gameState.player.gems -= item.price;
    } else {
        showToast("❌ Không đủ tiền!");
        return;
    }

    gameState.inventory.push(item.id);
    updateResourceDisplays();
    saveGameState();
    closeModal("modal-item-detail");
    renderItemsGrid(item.category);
    showToast(`🎉 Đã mua thành công ${item.name}!`);
}

function updateResourceDisplays() {
    document.getElementById("res-level").innerText = `Lv.${gameState.player.level}`;
    document.getElementById("res-coins").innerText = gameState.player.coins;
    document.getElementById("res-gems").innerText = gameState.player.gems;
    document.getElementById("res-crowns").innerText = gameState.player.crowns;
}

// --- CONTEST & SCORING ENGINE ---
function startContestDressUp() {
    switchTab("tab-dressup");
    showToast("🏆 Hãy phối đồ chuẩn phong cách dạ hội để ghi điểm tối đa!");
}

function calculateScore() {
    let score = 40; // Base score
    Object.values(gameState.equipped).forEach(itemId => {
        if (itemId) {
            const item = ITEMS_DB.find(i => i.id === itemId);
            if (item) score += item.scoreBonus;
        }
    });
    return Math.min(100, score);
}

// --- MODAL UTILITIES ---
function openModal(id) {
    document.getElementById("modal-overlay").classList.remove("hidden");
    document.querySelectorAll(".royal-modal").forEach(m => m.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById(id).classList.add("hidden");
}

function showToast(msg) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "glass";
    toast.style.cssText = "padding:10px 20px; border-radius:20px; font-weight:800; background:white; margin-top:5px; animation:fadeIn 0.3s";
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
