const YahooFinance = require("yahoo-finance2").default;

const yahooFinance = new YahooFinance();

async function test() {
  try {
    const stocks = [
  "IDEA.NS",
  "OFSS.NS",
  "GESHIP.NS",
  "SAREGAMA.NS",
  "OLAELEC.NS"
];

for (const symbol of stocks) {
  try {
    const quote = await yahooFinance.quote(symbol);
    console.log(symbol, "✅", quote.regularMarketPrice);
  } catch (error) {
    console.log(symbol, "❌");
  }
}
    console.log(quote);
  } catch (error) {
    console.error(error);
  }
}

test();