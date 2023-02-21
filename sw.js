var APP_PREFIX="Flappybird",VERSION="version_1",CACHE_NAME=APP_PREFIX+VERSION,prefix="/",URLS=[""];function getFiles(){return new Promise((async function(e,t){try{const t=await fetch("asset-manifest.json",{method:"GET"});URLS=(URLS=URLS.concat(Object.values(JSON.parse(await t.text())))).map((function(e){return prefix+e})),e()}catch(e){t(e)}}))}self.addEventListener("fetch",(function(e){e.respondWith(caches.match(e.request).then((function(t){if(t){return t}try{return fetch(e.request).catch((function(e){console.info("Offline mode")}))}catch(e){}})))})),self.addEventListener("install",(function(e){e.waitUntil(getFiles().then((function(){var e=[...new Set(URLS)];caches.open(CACHE_NAME).then((function(t){return t.addAll(e)}))})))})),self.addEventListener("activate",(function(e){e.waitUntil(caches.keys().then((function(e){var t=e.filter((function(e){return e.indexOf(APP_PREFIX)}));return t.push(CACHE_NAME),Promise.all(e.map((function(n,i){if(-1===t.indexOf(n))return caches.delete(e[i])})))})))}));