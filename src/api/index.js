require('dotenv').config(); // Just to be safe

const express = require('express');
const axios = require('axios');
const routes = require('./routes/index');
const router = express.Router();

rorouter.get('/proxy', async (req, res) => {
  const videoUrl = req.query.url;
  
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing video URL' });
  }

  try {
    const isM3u8 = videoUrl.includes('.m3u8');

    // Dynamically grab the current server URL (handles both localhost and Render)
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const currentServerUrl = `${protocol}://${host}`;

    // If it's a playlist (.m3u8), we intercept the text and rewrite the links
    if (isM3u8) {
      const response = await axios.get(videoUrl, {
        headers: {
          'Origin': 'https://vibeplayer.site', 
          'Referer': 'https://vibeplayer.site/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Figure out the base URL to attach to the relative links
      const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1);
      let m3u8Content = response.data;

      // Rewrite every relative link to go through our proxy
      const rewrittenM3u8 = m3u8Content.split('\n').map(line => {
        const trimmed = line.trim();
        // If the line is a file (not a comment or blank space)
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http')) {
          const absoluteUrl = baseUrl + trimmed;
          // Wrap it back into our dynamic proxy!
          return `${currentServerUrl}/api/v1/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        }
        return line;
      }).join('\n');

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(rewrittenM3u8);
    }

    // If it's an actual video chunk (.ts file), just stream it normally
    const response = await axios({
      method: 'GET',
      url: videoUrl,
      responseType: 'stream',
      headers: {
        'Origin': 'https://vibeplayer.site', 
        'Referer': 'https://vibeplayer.site/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'video/MP2T');
    res.setHeader('Access-Control-Allow-Origin', '*');
    response.data.pipe(res);

  } catch (err) {
    console.error("Proxy Error:", err.message);
    res.status(500).json({ error: 'Proxy Error', details: err.message });
  }
});

router.use('/', routes);

module.exports = router;