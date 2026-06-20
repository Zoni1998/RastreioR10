async function scrapeParcelsApp(code) {
  try {
    const res = await fetch(`https://parcelsapp.com/pt/tracking/${code}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    if (html.includes('Cloudflare') || html.includes('Just a moment')) {
      console.log('Blocked by Cloudflare');
      return;
    }
    console.log('Got HTML, length:', html.length);
    const match = html.match(/class="tracking-status"([^>]*)>(.*?)<\//);
    console.log('Match:', match ? match[2] : 'Not found');
  } catch (err) {
    console.error(err);
  }
}
scrapeParcelsApp('PW826279930BR');
