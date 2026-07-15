import http from "http";

const PORT = 5001;

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const fail = req.url.includes("fail=1");

      if (fail) {
        console.log("Симулируем ошибку 500");
        res.writeHead(500);
        res.end("Internet Server Error");
      } else {
        console.log("Получили доставку", body);
        res.writeHead(200);
        res.end("OK");
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`Mok подписчики запущены на порту ${PORT}`);
});
