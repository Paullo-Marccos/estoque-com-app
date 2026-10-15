// Guarda os arquivos do app no aparelho para abrir sem internet
var NOME_CACHE = "estoque-v4";
var ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/css.css",
  "./java/java.js",
  "./icones/icone-192.png",
  "./icones/icone-512.png"
];

// Quando instala: guarda os arquivos
self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(NOME_CACHE).then(function (cache) {
      return cache.addAll(ARQUIVOS);
    })
  );
  self.skipWaiting();
});

// Quando ativa: apaga caches de versões antigas
self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.map(function (nome) {
        if (nome != NOME_CACHE) {
          return caches.delete(nome);
        }
      }));
    })
  );
  self.clients.claim();
});

// Quando pede um arquivo: tenta a internet; se falhar, usa o guardado
self.addEventListener("fetch", function (evento) {
  evento.respondWith(
    fetch(evento.request).then(function (resposta) {
      var copia = resposta.clone();
      caches.open(NOME_CACHE).then(function (cache) {
        cache.put(evento.request, copia);
      });
      return resposta;
    }).catch(function () {
      return caches.match(evento.request);
    })
  );
});
