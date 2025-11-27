// content.js - Enhanced Version
let collectedTweets = [];

// Listen for messages from injected.js
window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data.type && event.data.type === 'X_SCRAPER_DATA') {
        const newTweets = event.data.data;

        newTweets.forEach(tweet => {
            if (!collectedTweets.some(t => t.expanded === tweet.expanded)) {
                collectedTweets.push(tweet);
            }
        });

        updateButtonLabel();
    }
});

// Search Functions
function performSearch(type, query) {
    if (!query.trim()) {
        alert('Please enter a search term');
        return;
    }

    let searchUrl = '';
    if (type === 'text') {
        searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
    } else if (type === 'hashtag') {
        const cleanQuery = query.replace(/^#/, '');
        searchUrl = `https://x.com/hashtag/${encodeURIComponent(cleanQuery)}`;
    }

    window.location.href = searchUrl;
}

// Create UI
function createUI() {
    if (document.getElementById('x-scraper-fab')) return;

    // Inject Google Fonts (Poppins for modern look)
    if (!document.getElementById('x-scraper-font')) {
        const link = document.createElement('link');
        link.id = 'x-scraper-font';
        link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    // 1. Create Floating Action Button (FAB)
    const fab = document.createElement('div');
    fab.id = 'x-scraper-fab';
    fab.style.position = 'fixed';
    fab.style.bottom = '30px';
    fab.style.right = '30px';
    fab.style.width = '60px';
    fab.style.height = '60px';
    fab.style.backgroundColor = '#1DA1F2';
    fab.style.borderRadius = '50%';
    fab.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    fab.style.cursor = 'pointer';
    fab.style.zIndex = '9999';
    fab.style.display = 'flex';
    fab.style.alignItems = 'center';
    fab.style.justifyContent = 'center';
    fab.style.transition = 'transform 0.2s';
    fab.title = 'View Scraped Data';

    // Icon
    fab.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <div id="x-scraper-badge" style="position: absolute; top: -5px; right: -5px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; font-family: 'Poppins', sans-serif; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);">0</div>
    `;

    fab.onmouseover = () => fab.style.transform = 'scale(1.1)';
    fab.onmouseout = () => fab.style.transform = 'scale(1)';
    fab.onclick = togglePopup;

    document.body.appendChild(fab);

    // 2. Create Popup Modal (Popover style)
    const modal = document.createElement('div');
    modal.id = 'x-scraper-modal';
    modal.style.position = 'fixed';
    modal.style.bottom = '100px';
    modal.style.right = '30px';
    modal.style.width = '400px';
    modal.style.height = '550px';
    modal.style.backgroundColor = 'white';
    modal.style.borderRadius = '16px';
    modal.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
    modal.style.zIndex = '10000';
    modal.style.display = 'none';
    modal.style.flexDirection = 'column';
    modal.style.overflow = 'hidden';
    modal.style.fontFamily = "'Poppins', sans-serif";
    modal.style.border = '1px solid #e1e8ed';

    // Tabs Header
    const tabsHeader = document.createElement('div');
    tabsHeader.style.display = 'flex';
    tabsHeader.style.borderBottom = '2px solid #f0f3f5';
    tabsHeader.style.backgroundColor = '#ffffff';
    tabsHeader.style.padding = '5px';
    tabsHeader.style.textAlign = 'center';

    const createTab = (text, id, active = false) => {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.dataset.tab = id;
        btn.style.flex = '1';
        btn.style.padding = '10px 8px';
        btn.style.border = 'none';
        btn.style.background = active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent';
        btn.style.borderRadius = '8px';
        btn.style.fontWeight = active ? '600' : '500';
        btn.style.fontSize = '13px';
        btn.style.color = active ? 'white' : '#657786';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.3s ease';

        btn.onmouseover = () => {
            if (!active) {
                btn.style.backgroundColor = '#f7f9fa';
            }
        };
        btn.onmouseout = () => {
            if (!active) {
                btn.style.backgroundColor = 'transparent';
            }
        };

        btn.onclick = () => switchTab(id);
        return btn;
    };

    tabsHeader.appendChild(createTab('Users', 'tab-users', true));
    tabsHeader.appendChild(createTab('Content', 'tab-content'));
    tabsHeader.appendChild(createTab('Search', 'tab-search'));
    tabsHeader.appendChild(createTab('About', 'tab-about'));
    modal.appendChild(tabsHeader);

    // Tab Contents Container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'x-scraper-content-container';
    contentContainer.style.flex = '1';
    contentContainer.style.overflowY = 'auto';
    contentContainer.style.padding = '0';
    contentContainer.style.backgroundColor = '#fff';
    modal.appendChild(contentContainer);

    // Footer
    const footer = document.createElement('div');
    footer.style.padding = '12px 15px';
    footer.style.borderTop = '1px solid #e1e8ed';
    footer.style.display = 'flex';
    footer.style.gap = '10px';
    footer.style.backgroundColor = 'white';

    const downloadBtn = document.createElement('button');
    downloadBtn.innerText = 'Download JSON';
    downloadBtn.style.flex = '1';
    downloadBtn.style.padding = '12px';
    downloadBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    downloadBtn.style.color = 'white';
    downloadBtn.style.border = 'none';
    downloadBtn.style.borderRadius = '10px';
    downloadBtn.style.cursor = 'pointer';
    downloadBtn.style.fontWeight = '600';
    downloadBtn.style.fontSize = '14px';
    downloadBtn.style.transition = 'transform 0.2s';
    downloadBtn.onmouseover = () => downloadBtn.style.transform = 'scale(1.02)';
    downloadBtn.onmouseout = () => downloadBtn.style.transform = 'scale(1)';
    downloadBtn.onclick = downloadData;

    const clearBtn = document.createElement('button');
    clearBtn.innerText = 'Clear';
    clearBtn.title = 'Clear Data';
    clearBtn.style.padding = '12px 16px';
    clearBtn.style.backgroundColor = '#ff4757';
    clearBtn.style.color = 'white';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '10px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.fontWeight = '600';
    clearBtn.style.fontSize = '14px';
    clearBtn.onclick = () => {
        if (confirm('Clear all collected data?')) {
            collectedTweets = [];
            updateButtonLabel();
            const activeBtn = modal.querySelector('div:first-child > button[style*="linear-gradient"]');
            if (activeBtn) {
                renderTabContent(activeBtn.dataset.tab);
            }
        }
    };

    footer.appendChild(downloadBtn);
    footer.appendChild(clearBtn);
    modal.appendChild(footer);

    document.body.appendChild(modal);
}

function switchTab(tabId) {
    const modal = document.getElementById('x-scraper-modal');
    if (!modal) return;

    // Update Tab Buttons
    const buttons = modal.querySelectorAll('div:first-child > button');
    buttons.forEach(btn => {
        const isActive = btn.dataset.tab === tabId;
        btn.style.background = isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent';
        btn.style.fontWeight = isActive ? '600' : '500';
        btn.style.color = isActive ? 'white' : '#657786';
    });

    renderTabContent(tabId);
}

function renderTabContent(tabId) {
    const container = document.getElementById('x-scraper-content-container');
    if (!container) return;
    container.innerHTML = '';

    if (tabId === 'tab-users') {
        const uniqueUsers = new Map();
        collectedTweets.forEach(t => {
            if (t.profile && t.profile.core && t.profile.core.screen_name) {
                uniqueUsers.set(t.profile.core.screen_name, t.profile);
            }
        });

        if (uniqueUsers.size === 0) {
            container.innerHTML = '<div style="padding: 40px 20px; text-align: center; color: #aab8c2;">No users found yet.<br><small style="font-size: 12px;">Start scrolling to collect data</small></div>';
            return;
        }

        const list = document.createElement('div');
        uniqueUsers.forEach(user => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.padding = '12px 15px';
            item.style.borderBottom = '1px solid #f0f3f5';
            item.style.transition = 'background 0.2s';
            item.onmouseover = () => item.style.backgroundColor = '#f7f9fa';
            item.onmouseout = () => item.style.backgroundColor = 'transparent';

            const img = document.createElement('img');
            img.src = user.avatar?.image_url || '';
            img.style.width = '48px';
            img.style.height = '48px';
            img.style.borderRadius = '50%';
            img.style.marginRight = '12px';
            img.style.backgroundColor = '#e1e8ed';
            img.style.objectFit = 'cover';

            const info = document.createElement('div');
            info.style.flex = '1';
            info.innerHTML = `
                <div style="font-weight: 600; font-size: 14px; color: #14171a; display: flex; align-items: center; margin-bottom: 2px;">
                    ${user.core.name}
                    ${user.is_blue_verified ? '<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-left: 4px; fill: #1DA1F2;"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>' : ''}
                </div>
                <div style="font-size: 13px; color: #657786; margin-bottom: 6px;">@${user.core.screen_name}</div>
                <div style="font-size: 12px; color: #657786; display: flex; gap: 12px;">
                    <span><b style="color: #14171a;">${user.followers_count || 0}</b> Followers</span>
                    <span><b style="color: #14171a;">${user.friends_count || 0}</b> Following</span>
                </div>
                ${user.location?.location ? `<div style="font-size: 12px; color: #657786; margin-top: 4px;">📍 ${user.location.location}</div>` : ''}
            `;

            item.appendChild(img);
            item.appendChild(info);
            list.appendChild(item);
        });
        container.appendChild(list);

    } else if (tabId === 'tab-content') {
        if (collectedTweets.length === 0) {
            container.innerHTML = '<div style="padding: 40px 20px; text-align: center; color: #aab8c2;">No tweets found yet.<br><small style="font-size: 12px;">Start scrolling to collect data</small></div>';
            return;
        }
        const list = document.createElement('div');
        collectedTweets.forEach(t => {
            const item = document.createElement('div');
            item.style.padding = '12px 15px';
            item.style.borderBottom = '1px solid #f0f3f5';
            item.style.fontSize = '14px';
            item.style.color = '#14171a';
            item.style.lineHeight = '1.5';
            item.style.transition = 'background 0.2s';
            item.onmouseover = () => item.style.backgroundColor = '#f7f9fa';
            item.onmouseout = () => item.style.backgroundColor = 'transparent';
            item.innerText = t.full_text;
            list.appendChild(item);
        });
        container.appendChild(list);

    } else if (tabId === 'tab-search') {
        container.innerHTML = `
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 8px 0; color: #14171a; font-size: 16px; font-weight: 600;">Search X</h3>
                    <p style="margin: 0; font-size: 13px; color: #657786;">Search by text or hashtag</p>
                </div>

                <!-- Text Search -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: #14171a;">Text Search</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="text-search-input" placeholder="Enter search term..." style="flex: 1; padding: 10px 12px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 14px; font-family: 'Poppins', sans-serif; outline: none; transition: border 0.3s;" onfocus="this.style.borderColor='#1DA1F2'" onblur="this.style.borderColor='#e1e8ed'">
                        <button id="text-search-btn" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px;">Go</button>
                    </div>
                    <small style="display: block; margin-top: 6px; font-size: 11px; color: #657786;">Example: "artificial intelligence"</small>
                </div>

                <!-- Hashtag Search -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: #14171a;">Hashtag Search</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="hashtag-search-input" placeholder="Enter hashtag..." style="flex: 1; padding: 10px 12px; border: 2px solid #e1e8ed; border-radius: 10px; font-size: 14px; font-family: 'Poppins', sans-serif; outline: none; transition: border 0.3s;" onfocus="this.style.borderColor='#1DA1F2'" onblur="this.style.borderColor='#e1e8ed'">
                        <button id="hashtag-search-btn" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px;">Go</button>
                    </div>
                    <small style="display: block; margin-top: 6px; font-size: 11px; color: #657786;">Example: "Covid19" or "#Covid19"</small>
                </div>

                <!-- Quick Tips -->
                <div style="background: #f7f9fa; padding: 12px; border-radius: 10px; border-left: 3px solid #1DA1F2;">
                    <div style="font-weight: 600; font-size: 12px; color: #14171a; margin-bottom: 6px;">Tips</div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #657786; line-height: 1.6;">
                        <li>Search results show latest tweets</li>
                        <li>Data is collected as you scroll</li>
                    </ul>
                </div>
            </div>
        `;

        // Add event listeners for search
        setTimeout(() => {
            const textBtn = document.getElementById('text-search-btn');
            const textInput = document.getElementById('text-search-input');
            const hashtagBtn = document.getElementById('hashtag-search-btn');
            const hashtagInput = document.getElementById('hashtag-search-input');

            if (textBtn && textInput) {
                textBtn.onclick = () => performSearch('text', textInput.value);
                textInput.onkeypress = (e) => {
                    if (e.key === 'Enter') performSearch('text', textInput.value);
                };
            }

            if (hashtagBtn && hashtagInput) {
                hashtagBtn.onclick = () => performSearch('hashtag', hashtagInput.value);
                hashtagInput.onkeypress = (e) => {
                    if (e.key === 'Enter') performSearch('hashtag', hashtagInput.value);
                };
            }
        }, 100);

    } else if (tabId === 'tab-about') {
        container.innerHTML = `
            <div style="padding: 30px 20px; text-align: center;">
                <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                    <span style="font-size: 40px; color: white; font-weight: bold;">X</span>
                </div>
                
                <h3 style="margin: 0 0 8px 0; color: #14171a; font-weight: 700; font-size: 20px;">X Scraper Extension</h3>
                <p style="margin: 0 0 30px 0; color: #657786; font-size: 13px;">Advanced data collection tool for X (Twitter)</p>
                
                <div style="background: #f7f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: left;">
                    <div style="font-weight: 600; font-size: 13px; color: #14171a; margin-bottom: 12px;">Features</div>
                    <div style="font-size: 12px; color: #657786; line-height: 1.8;">
                        • Collect user profiles & tweets<br>
                        • Advanced search functionality<br>
                        • Export data as JSON<br>
                        • Real-time data tracking
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <a href="https://github.com/leemrtnzz" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; font-size: 13px; font-weight: 600; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        leemrtnzz
                    </a>
                </div>

                <div style="margin-bottom: 25px;">
                    <a href="https://instagram.com/yovtrash" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white; border-radius: 10px; font-size: 13px; font-weight: 600; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        @yovtrash
                    </a>
                </div>

                <div style="font-size: 12px; color: #666; margin-top: 30px;">
                    <b>Muhammad Ichsan Haekal</b>
                </div>
            </div>
        `;
    }
}

function togglePopup() {
    const modal = document.getElementById('x-scraper-modal');
    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
        // Default to Users tab if no tab selected
        const activeBtn = modal.querySelector('div:first-child > button[style*="linear-gradient"]');
        if (activeBtn) {
            renderTabContent(activeBtn.dataset.tab);
        } else {
            switchTab('tab-users');
        }
    } else {
        modal.style.display = 'none';
    }
}

function updateJsonPreview() {
    // No longer needed for JSON preview, but we might want to refresh content if open
    const modal = document.getElementById('x-scraper-modal');
    if (modal && modal.style.display !== 'none') {
        const activeBtn = modal.querySelector('div:first-child > button[style*="linear-gradient"]');
        if (activeBtn) {
            renderTabContent(activeBtn.dataset.tab);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUI);
} else {
    createUI();
}

function updateButtonLabel() {
    const badge = document.getElementById('x-scraper-badge');
    if (badge) {
        badge.innerText = collectedTweets.length;
    }
    // Also update JSON if modal is open
    const modal = document.getElementById('x-scraper-modal');
    if (modal && modal.style.display !== 'none') {
        updateJsonPreview();
    }
}

function downloadData() {
    const dataStr = JSON.stringify(collectedTweets, null, 4);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `x_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}