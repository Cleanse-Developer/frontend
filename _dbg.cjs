const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 2940, height: 1000, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  // sample several LIVE frames: for each, find the min x where the row has text (scan tm-text rects)
  const results = [];
  for (let k=0;k<6;k++){
    const r = await page.evaluate(() => {
      const vw = window.innerWidth;
      const rows = [...document.querySelectorAll('.tm-row')].map(row => {
        const texts=[...row.querySelectorAll('.tm-text')];
        // leftmost painted x = min over texts of max(left,?) where text intersects [0,vw]
        let minVisibleLeft = Infinity, maxVisibleRight=-Infinity;
        for(const t of texts){const b=t.getBoundingClientRect(); if(b.right>0 && b.left<vw){ minVisibleLeft=Math.min(minVisibleLeft, Math.max(0,b.left)); maxVisibleRight=Math.max(maxVisibleRight, Math.min(vw,b.right)); }}
        return { leftCovered: Math.round(minVisibleLeft), rightCovered: Math.round(maxVisibleRight) };
      });
      return { vw, rows };
    });
    results.push(r.rows.map(x=>`[L${x.leftCovered},R${x.rightCovered}]`).join(' '));
    await new Promise(res=>setTimeout(res,500));
  }
  results.forEach((r,i)=>console.log(`frame${i}: ${r}`));
  // box screenshot
  await page.addStyleTag({ content: `.tm-track{animation-play-state:paused !important;} .tm-text{ background: rgba(0,128,255,0.20);} ` });
  const y = await page.evaluate(()=>Math.round(document.querySelector('.hero-bottom-tagline').getBoundingClientRect().top));
  await page.screenshot({ path: '/tmp/boxes2940b.png', clip:{x:0, y:Math.max(0,y), width:2940, height:280} });
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
