import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

export default function AnimePlayer({ videoUrl }) {
    const playerRef = useRef(null);

    useEffect(() => {
        // Don't initialize if there's no URL yet
        if (!videoUrl) return;

        const art = new Artplayer({
            container: playerRef.current,
            url: videoUrl,
            theme: '#ff0000', // You can change this to match your app's branding
            volume: 0.5,
            autoplay: false,
            pip: true,
            fullscreen: true,
            setting: true,
            // This customType function is the magic that makes .m3u8 work
            customType: {
                m3u8: function (video, url, art) {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        
                        // Clean up the HLS instance when the player is destroyed
                        art.on('destroy', () => hls.destroy());
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        // Fallback for Safari (which supports HLS natively)
                        video.src = url;
                    } else {
                        art.notice.show = 'Does not support playback of this video format';
                    }
                },
            },
        });

        // Cleanup function when the component unmounts
        return () => {
            if (art && art.destroy) {
                art.destroy(false);
            }
        };
    }, [videoUrl]); // Re-run if the videoUrl changes (like switching episodes)

    // Ensure the container has a defined height/width or it will be invisible
    return (
        <div 
            ref={playerRef} 
            style={{ width: '100%', height: '600px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}
        ></div>
    );
}