const express = require('express');
const router = express.Router();
const api = require('../api');

router.get('/search/:query', (req, res) => {
  const query = req.params.query;
  api.search(query)
    .then(search => {
      res.status(200).json({ search });
    })
    .catch(err => {
      res.status(500).json({ error: "Search failed", details: err.message });
    });
});

router.get('/animeepisodehandler/:id', (req, res) => {
  const id = req.params.id;
  api.animeEpisodeHandler(id)
    .then(anime => {
      res.status(200).json({ anime });
    })
    .catch(err => {
      res.status(404).json({ error: "Episode Not Found", details: err.message });
    });
});

router.get('/recentreleaseepisodes/:page', (req, res) => {
  const page = parseInt(req.params.page, 10);
  api.recentReleaseEpisodes(page)
    .then(anime => {
      res.status(200).json({ anime });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to fetch recent episodes", details: err.message });
    });
});

router.get('/recentlyaddedseries', (req, res) => {
  api.recentlyAddedSeries()
    .then(anime => {
      res.status(200).json({ anime });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to fetch added series", details: err.message });
    });
});

router.get('/ongoingseries', (req, res) => {
  api.ongoingSeries()
    .then(anime => {
      res.status(200).json({ anime });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to fetch ongoing series", details: err.message });
    });
});

router.get('/alphabet/:letter/:page', (req, res) => {
  const letter = req.params.letter.toUpperCase();
  const page = parseInt(req.params.page, 10);
  api.alphabetList(letter, page)
    .then(anime => {
      res.status(200).json({ anime });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to fetch list", details: err.message });
    });
});

router.get('/newseasons/:page', (req, res) => {
  const page = parseInt(req.params.page, 10);
  api.newSeasons(page)
    .then(anime => {
      res.status(200).json({ anime });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to fetch new seasons", details: err.message });
    });
});

router.get('/movies/:page', (req, res) => {
  const page = parseInt(req.params.page, 10);
  api.movies(page)
    .then(movies => {
      res.status(200).json({ movies });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to fetch movies", details: err.message });
    });
});

router.get('/popular/:page', (req, res) => {
  const page = parseInt(req.params.page, 10);
  api.popular(page)
    .then(popular => {
      res.status(200).json({ popular });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to fetch popular list", details: err.message });
    });
});

router.get('/genre/:genre/:page', (req, res) => {
  const genre = req.params.genre;
  const page = parseInt(req.params.page, 10);
  api.genres(genre, page)
    .then(anime => {
      res.status(200).json({ anime });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to fetch genre", details: err.message });
    });
});

// FIXED: Now uses a query parameter (?url=...) so https:// links stay intact
router.get('/decodevidstreamingiframeURL', (req, res) => {
  const iframeUrl = req.query.url;
  
  if(!iframeUrl) {
      return res.status(400).json({ 
          error: "Missing URL parameter", 
          example: "http://:5001/api/v1/decodevidstreamingiframeURL?url=https://vibeplayer.site/..." 
      });
  }

  api.decodeVidstreamingIframeURL(iframeUrl)
    .then(videos => {
      res.status(200).json({ videos });
    })
    .catch(err => {
      res.status(500).json({ error: "Failed to decode video", details: err.message });
    });
});

module.exports = router;