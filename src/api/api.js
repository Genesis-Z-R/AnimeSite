const axios = require('axios');
const cheerio = require('cheerio');
const url = require('./urls');

// Puppeteer Imports
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

let globalBrowser = null;

async function getBrowser() {
  // Check if the browser doesn't exist OR if it was killed/disconnected
  if (!globalBrowser || !globalBrowser.isConnected()) {
    console.log("Launching new Chrome instance...");
    globalBrowser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote'
      ]
    });
  }
  return globalBrowser;
}

// Helper to avoid 403 on basic axios calls
const axiosHeaders = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    }
};

const ongoingSeries = async() =>{
  const res = await axios.get(`${url.BASE_URL}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];

  Array.from({length: 30} , (v , k) =>{
    $('div.main_body div.series nav.menu_series ul li').eq(k + 1).each((index , element) =>{
      const $element = $(element);
      const id = $element.find('a').attr('href');
      const title = $element.find('a').text(); 
      promises.push(animeContentHandler(id).then(extra =>({
        title: title ? title : null,                   
        img: extra[0] ? extra[0].img : null,
        synopsis: extra[0] ? extra[0].synopsis : null,
        genres: extra[0] ? extra[0].genres : null,
        released: extra[0] ? extra[0].released : null,
        status: extra[0] ? extra[0].status : null,
        otherName: extra[0] ? extra[0].otherName : null,
        totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
        episodes: extra[0] ? extra[0].episodes: null
      })));
    })
  });
  return await Promise.all(promises);
};

const search = async(query) =>{
  const res = await axios.get(`${url.BASE_URL}/search.html?keyword=${query}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.main_body div.last_episodes ul.items li').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('a').attr('href');
    const title = $element.find('a').text().trim();
    promises.push(animeContentHandler(id).then(extra =>({
      title: title ? title : null,                   
      img: extra[0] ? extra[0].img : null,
      synopsis: extra[0] ? extra[0].synopsis : null,
      genres: extra[0] ? extra[0].genres : null,
      released: extra[0] ? extra[0].released : null,
      status: extra[0] ? extra[0].status : null,
      otherName: extra[0] ? extra[0].otherName : null,
      totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
      episodes: extra[0] ? extra[0].episodes: null
    })));
  });
  return await Promise.all(promises);
};

const genres = async(genre , page) =>{
  const res = await axios.get(`${url.BASE_URL}/genre/${genre}?page=${page}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.main_body div.last_episodes ul.items li').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('a').attr('href');
    const title = $element.find('a').text().trim();
    promises.push(animeContentHandler(id).then(extra =>({
      title: title ? title : null,                   
      img: extra[0] ? extra[0].img : null,
      synopsis: extra[0] ? extra[0].synopsis : null,
      genres: extra[0] ? extra[0].genres : null,
      released: extra[0] ? extra[0].released : null,
      status: extra[0] ? extra[0].status : null,
      otherName: extra[0] ? extra[0].otherName : null,
      totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
      episodes: extra[0] ? extra[0].episodes: null
    })));
  });
  return await Promise.all(promises);
};

const alphabetList = async(letter , page) =>{
  const res = await axios.get(`${url.BASE_URL}/anime-list-${letter}?page=${page}`, axiosHeaders)
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.main_body div.anime_list_body ul.listing li').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('a').attr('href');
    const title = $element.find('a').text().trim();
    promises.push(animeContentHandler(id).then(extra =>({
      title: title ? title : null,                   
      img: extra[0] ? extra[0].img : null,
      synopsis: extra[0] ? extra[0].synopsis : null,
      genres: extra[0] ? extra[0].genres : null,
      released: extra[0] ? extra[0].released : null,
      status: extra[0] ? extra[0].status : null,
      otherName: extra[0] ? extra[0].otherName : null,
      totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
      episodes: extra[0] ? extra[0].episodes: null
    })));
  });
  return await Promise.all(promises);
};

const newSeasons = async(page) =>{
  const res = await axios.get(`${url.BASE_URL}/new-season.html?page=${page}`, axiosHeaders)
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];
  
  $('div.main_body div.last_episodes ul.items li').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.img a').attr('href');
    const title = $element.find('a').text().trim();
    promises.push(animeContentHandler(id).then(extra =>({
      title: title ? title : null,                   
      img: extra[0] ? extra[0].img : null,
      synopsis: extra[0] ? extra[0].synopsis : null,
      genres: extra[0] ? extra[0].genres : null,
      released: extra[0] ? extra[0].released : null,
      status: extra[0] ? extra[0].status : null,
      otherName: extra[0] ? extra[0].otherName : null,
      totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
      episodes: extra[0] ? extra[0].episodes: null
    })));
  })
  return await Promise.all(promises);
};

const movies = async(page) =>{
  const res = await axios.get(`${url.BASE_URL}/anime-movies.html?page=${page}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];
  
  $('div.main_body div.last_episodes ul.items li').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.img a').attr('href');
    const title = $element.find('a').text().trim();
    promises.push(animeContentHandler(id).then(extra =>({
      title: title ? title : null,                   
      img: extra[0] ? extra[0].img : null,
      synopsis: extra[0] ? extra[0].synopsis : null,
      genres: extra[0] ? extra[0].genres : null,
      released: extra[0] ? extra[0].released : null,
      status: extra[0] ? extra[0].status : null,
      otherName: extra[0] ? extra[0].otherName : null,
      totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
      episodes: extra[0] ? extra[0].episodes: null
    })));
  })
  return await Promise.all(promises);
};

const popular = async(page) =>{
  const res = await axios.get(`${url.BASE_URL}/popular.html?page=${page}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];
  
  $('div.main_body div.last_episodes ul.items li').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.img a').attr('href');
    const title = $element.find('a').text().trim();
    promises.push(animeContentHandler(id).then(extra =>({
      title: title ? title : null,                   
      img: extra[0] ? extra[0].img : null,
      synopsis: extra[0] ? extra[0].synopsis : null,
      genres: extra[0] ? extra[0].genres : null,
      released: extra[0] ? extra[0].released : null,
      status: extra[0] ? extra[0].status : null,
      otherName: extra[0] ? extra[0].otherName : null,
      totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
      episodes: extra[0] ? extra[0].episodes: null
    })));
  })
  return await Promise.all(promises);
};

const recentlyAddedSeries = async() =>{
  const res = await axios.get(`${url.BASE_URL}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.main_body.none div.added_series_body ul.listing li').each((index , element) => {
    const $element = $(element);
    const id = $element.find('a').attr('href');
    const title = $element.find('a').text();
    promises.push(animeContentHandler(id).then(extra =>({
      title: title ? title : null,                   
      img: extra[0] ? extra[0].img : null,
      synopsis: extra[0] ? extra[0].synopsis : null,
      genres: extra[0] ? extra[0].genres : null,
      released: extra[0] ? extra[0].released : null,
      status: extra[0] ? extra[0].status : null,
      otherName: extra[0] ? extra[0].otherName : null,
      totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
      episodes: extra[0] ? extra[0].episodes: null
    })));
  });
  return await Promise.all(promises);
};

const recentReleaseEpisodes = async(page) =>{
  const res = await axios.get(`${url.BASE_URL}/?page=${page}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.main_body div.last_episodes.loaddub ul.items li').each((index , element) => {
    const $element = $(element);
    const id = $element.find('p.name a').attr('href');
    const title = $element.find('p.name a').text();
    const episode = parseInt($element.find('p.episode').text().match(/\d+/g) , 10);
    promises.push(animeEpisodeHandler(id).then(extra =>({
      title: title || null,                   
      img: extra[0].img || null,
      synopsis: extra[0].synopsis || null,
      genres: extra[0].genres || null,
      category: extra[0].category || null,
      episode: episode || null,
      totalEpisodes: extra[0].totalEpisodes || null,
      released: extra[0].released || null,
      status: extra[0].status || null,
      otherName: extra[0].otherName || null,
      servers: extra[0].servers || null
    })));
  });
  return await Promise.all(promises);
};

const animeEpisodeHandler = async(id) =>{
  const res = await axios.get(`${url.BASE_URL}/${id}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];

  $('div#wrapper_bg').each((index , element) =>{
    const $element = $(element);
    const animeId = $element.find('div.anime_video_body div.anime_video_body_cate div.anime-info a').attr('href');
    const category = $element.find('div.anime_video_body div.anime_video_body_cate a').attr('href').split('/')[2].trim();

    const servers = [];
    
    // UPDATED SELECTOR FOR ANITAKU.TO
    $element.find('.anime_muti_link .server a').each((j , el) =>{
      const $el = $(el);
      const name = $el.text().replace('Choose this server', '').trim();
      let iframe = $el.attr('data-video');
      if(iframe && iframe.startsWith('//')){
        iframe = `https:${iframe}`; // Prepend https correctly
      } 
      servers.push({
        name: name,
        iframe: iframe
      });
    })
    
    promises.push(animeContentHandler(animeId).then(extra =>({
      img: extra[0] ? extra[0].img : null,
      synopsis: extra[0] ? extra[0].synopsis : null,
      genres: extra[0] ? extra[0].genres : null,
      category: category ? category : null,
      released: extra[0] ? extra[0].released : null,
      status: extra[0] ? extra[0].status : null,
      otherName: extra[0] ? extra[0].otherName : null,
      totalEpisodes: extra[0] ? extra[0].totalEpisodes : null,
      servers: servers ? servers : null
    })));
  })
  
  const results = await Promise.all(promises);
  if(results.length === 0 || !results[0].servers || results[0].servers.length === 0) {
      throw new Error("Episode Not Found or Selectors Failed");
  }
  return results;
}

const animeContentHandler = async(id) =>{
  const res = await axios.get(`${url.BASE_URL}${id}`, axiosHeaders);
  const body = await res.data;
  const $ = cheerio.load(body);
  const promises = [];
  let check_zero_episode = false;
  
  try {
      const check_zero_episode_axios = await axios.get(`${url.BASE_URL}${id.split('/')[2]}`, axiosHeaders);
      const check_zero_episode_body = await check_zero_episode_axios.data;
      const check_zero_episode_cheerio = cheerio.load(check_zero_episode_body);
      if(check_zero_episode_cheerio('.entry-title').text()!='404') {
        check_zero_episode = true
      }
  } catch(e) {
      // Ignore 404s for zero episodes
  }

  $('div#wrapper_bg').each((index , element) =>{
    const $element = $(element);
    const img = $element.find('div.anime_info_body_bg img').attr('src');
    const synopsis = $element.find('div.anime_info_body_bg p.type').eq(1).text();
    const genres = [];
    $element.find('div.anime_info_body_bg p.type').eq(2).find('a').each((j , el) =>{
      const $el = $(el);
      const genre = $el.attr('href').split('/')[4];
      genres.push(genre);
    });
    
    const releasedText = $element.find('div.anime_info_body_bg p.type').eq(3).text().match(/\d+/g);
    const released = releasedText ? parseInt(releasedText[0] , 10) : null;
    
    const status = $element.find('div.anime_info_body_bg p.type').eq(4).text().replace('Status:' , '').trim();
    const otherName = $element.find('div.anime_info_body_bg p.type').eq(5).text().replace('Other name:' , '').trim();
    const liTotal = $('div.anime_video_body ul#episode_page li').length;
    
    let totalEpisodes = 0;
    if(liTotal > 0) {
        let epText = $('div.anime_video_body ul#episode_page li').eq(liTotal - 1).find('a').text();
        if(epText.includes('-')) {
            totalEpisodes = parseInt(epText.split('-')[1] , 10);
        } else {
            totalEpisodes = parseInt(epText, 10);
        }
    }
    
    let episodes = Array.from({length: totalEpisodes} , (v , k) =>{
      const animeId = `${id}-episode-${k + 1}`.replace('/category/', '');
      return{
        id: animeId
      }
    });
    
    if(check_zero_episode) {
      episodes.unshift({id: id.split('/')[2]});
    }

    promises.push({
      img: img,
      synopsis: synopsis,
      genres: genres,
      released: released,
      status: status,
      otherName: otherName,
      totalEpisodes: check_zero_episode ? totalEpisodes+1 : totalEpisodes,
      episodes: episodes
    });
  });
  return await Promise.all(promises);
};

const decodeVidstreamingIframeURL = async (iframeUrl) => {
    // Ensure URL is absolute
    const targetUrl = iframeUrl.startsWith('http') ? iframeUrl : `https://${iframeUrl}`;
    
    let browser;
    try {
          const browser = await getBrowser(); // This grabs the background Chrome
  const page = await browser.newPage(); // This opens a new tab
        
        const videoLinks = [];

        // Intercept network requests to catch the .m3u8 or .mp4 files
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const requestUrl = request.url();
            if (requestUrl.includes('.m3u8') || requestUrl.includes('.mp4')) {
                videoLinks.push(requestUrl);
            }
            request.continue();
        });

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait a few seconds for the stream to appear in network traffic
        await new Promise(r => setTimeout(r, 4000));

        await browser.close();

        // Format the results
        return videoLinks.map((link, index) => ({
            option: index + 1,
            url: link
        }));

    } catch (error) {
        if (browser) await browser.close();
        console.error("Puppeteer Error:", error);
        return [];
    }
      await page.close(); 
}

module.exports = {
  animeEpisodeHandler,
  recentReleaseEpisodes,
  recentlyAddedSeries,
  ongoingSeries,
  alphabetList,
  newSeasons,
  movies,
  popular,
  search,
  genres,
  decodeVidstreamingIframeURL
}