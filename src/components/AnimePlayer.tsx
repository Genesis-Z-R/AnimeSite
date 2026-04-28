import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

export default function AnimePlayer({ url, subtitleUrl, id, className }: { url: string, subtitleUrl?: string | null, id: string, className?: string }) {
    const playerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!url || !playerRef.current) return;

        const art = new Artplayer({
            container: playerRef.current,
            url: url,
            type: 'm3u8',
            theme: '#0ea5e9', // RamseyAnime Cyan
            volume: 0.5,
            autoplay: false,
            pip: true,
            fullscreen: true,
            setting: true, // This enables the gear icon
            subtitle: subtitleUrl ? {
                url: subtitleUrl,
                type: 'vtt',
                style: { color: '#ffffff', fontSize: '24px', textShadow: '0px 0px 4px #000000' },
                encoding: 'utf-8',
            } : {},
            customType: {
                m3u8: function (video, m3u8Url, artInstance) {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(m3u8Url);
                        hls.attachMedia(video);
                        
                        // --- QUALITY SELECTOR LOGIC ---
                        // Wait for HLS to read the manifest and find the resolutions
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            // If there's more than one quality, build the menu
                            if (hls.levels.length > 1) {
                                const qualities = hls.levels.map((level, index) => ({
                                    html: level.height + 'P', // e.g., "1080P"
                                    index: index, // The ID Hls.js uses to switch
                                }));

                                // Sort from highest to lowest (1080p at top)
                                qualities.sort((a, b) => parseInt(b.html) - parseInt(a.html));

                                // Add the default "Auto" option at the top
                                qualities.unshift({
                                    html: 'Auto',
                                    index: -1,
                                    default: true // Set Auto as the starting point
                                } as any);

                                // Inject the Quality selector into ArtPlayer's gear menu
                                artInstance.setting.add({
                                    name: 'quality',
                                    html: 'Quality',
                                    width: 200,
                                    tooltip: 'Auto',
                                    selector: qualities,
                                    onSelect: function (item) {
                                        // Tell Hls.js to switch the video track
                                        hls.currentLevel = item.index;
                                        return item.html; // Update the tooltip to show selected quality
                                    },
                                });
                            }
                        });
                        // ------------------------------

                        artInstance.on('destroy', () => hls.destroy());
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        // Fallback for Safari (which has native HLS without Hls.js)
                        video.src = m3u8Url;
                    }
                },
            },
        });

        // --- FEATURE: CONTINUE WATCHING ---
        art.once('video:canplay', () => {
            const savedTime = localStorage.getItem(`ramsey-time-${id}`);
            if (savedTime && Number(savedTime) > 0) {
                art.currentTime = Number(savedTime);
                
                const mins = Math.floor(Number(savedTime) / 60);
                const secs = Math.floor(Number(savedTime) % 60).toString().padStart(2, '0');
                art.notice.show = `Resumed at ${mins}:${secs}`;
            }
        });

        art.on('video:timeupdate', () => {
            if (art.currentTime > 5) {
                localStorage.setItem(`ramsey-time-${id}`, art.currentTime.toString());
            }
        });
        // ----------------------------------

        return () => {
            if (art && art.destroy) {
                art.destroy(false);
            }
        };
    }, [url, subtitleUrl, id]);

    return (
        <div ref={playerRef} className={className || "w-full h-full bg-black"}></div>
    );
}