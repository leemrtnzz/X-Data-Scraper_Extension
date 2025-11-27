// injected.js
(function () {
    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;
    const fetch = window.fetch;

    // Hook Fetch
    window.fetch = async (...args) => {
        const response = await fetch(...args);
        const clone = response.clone();

        const url = response.url;
        if (url.includes('/i/api/graphql/')) {
            clone.json().then(data => {
                processData(data);
            }).catch(err => { }); // Ignore json parse errors
        }

        return response;
    };

    // Hook XHR
    XHR.open = function (method, url) {
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            if (this._url && this._url.includes('/i/api/graphql/')) {
                try {
                    const data = JSON.parse(this.responseText);
                    processData(data);
                } catch (err) { }
            }
        });
        return send.apply(this, arguments);
    };

    function processData(jsonData) {
        try {
            // Logic adapted from index.js
            const instructions = jsonData.data?.search_by_raw_query?.search_timeline?.timeline?.instructions ||
                jsonData.data?.home?.home_timeline_urt?.instructions ||
                jsonData.data?.user?.result?.timeline_v2?.timeline?.instructions ||
                []; // Add more paths if needed for different pages

            // Flatten instructions to find entries
            let entries = [];

            // Handle different instruction types (TimelineAddEntries, TimelineAddToModule, etc.)
            instructions.forEach(instr => {
                if (instr.type === 'TimelineAddEntries') {
                    entries = entries.concat(instr.entries);
                } else if (instr.type === 'TimelineAddToModule') {
                    entries = entries.concat(instr.moduleItems);
                }
            });

            if (!entries.length) return;

            const filteredData = entries
                .filter(entry => entry.entryId && entry.entryId.startsWith('tweet-'))
                .map(entry => {
                    try {
                        const itemContent = entry.content?.itemContent || entry.item?.itemContent;
                        if (!itemContent) return null;

                        const result = itemContent.tweet_results?.result;
                        if (!result) return null;

                        const tweet = result.__typename === 'Tweet' ? result : result.tweet;

                        if (!tweet || !tweet.core || !tweet.core.user_results || !tweet.core.user_results.result) {
                            return null;
                        }

                        const user = tweet.core.user_results.result;
                        const legacy = tweet.legacy;

                        if (!legacy) return null;

                        let urlShort = "";
                        let urlExpanded = "";

                        if (legacy.quoted_status_permalink) {
                            urlShort = legacy.quoted_status_permalink.url;
                            urlExpanded = legacy.quoted_status_permalink.expanded;
                        } else if (legacy.entities.urls && legacy.entities.urls.length > 0) {
                            urlShort = legacy.entities.urls[0].url;
                            urlExpanded = legacy.entities.urls[0].expanded_url;
                        } else {
                            urlExpanded = `https://twitter.com/${user.core.screen_name}/status/${tweet.rest_id}`;
                            urlShort = urlExpanded;
                        }

                        const cleanHashtags = (legacy.entities.hashtags || []).map(tag => ({
                            text: tag.text
                        }));

                        return {
                            profile: {
                                avatar: {
                                    image_url: user.avatar?.image_url
                                },
                                core: {
                                    created_at: user.core?.created_at,
                                    name: user.core?.name,
                                    screen_name: user.core?.screen_name
                                },
                                is_blue_verified: user.is_blue_verified,
                                followers_count: user.legacy?.followers_count,
                                friends_count: user.legacy?.friends_count,
                                location: {
                                    location: user.location?.location || ""
                                },
                                profile_bio: {
                                    description: user.profile_bio?.description || user.legacy?.description
                                }
                            },
                            url: urlShort,
                            expanded: urlExpanded,
                            full_text: legacy.full_text,
                            created_at: legacy.created_at,
                            entities: {
                                hashtags: cleanHashtags
                            },
                        };
                    } catch (err) {
                        return null;
                    }
                })
                .filter(item => item !== null);

            if (filteredData.length > 0) {
                window.postMessage({ type: 'X_SCRAPER_DATA', data: filteredData }, '*');
            }

        } catch (error) {
            console.error("X Scraper Error:", error);
        }
    }
})();
