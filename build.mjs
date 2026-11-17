// Monta o site em dist/ a partir do mesmo index.html usado no Claude.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";

const page = readFileSync("index.html", "utf8");
const head = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#130f11">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Gabrielle">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" href="icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", head + page + "\n</body>\n</html>\n");
for (const f of readdirSync("site")) copyFileSync("site/" + f, "dist/" + f);
console.log("dist/ pronto");
