const YahooFinance = require("yahoo-finance2").default;

const yahooFinance = new YahooFinance();

async function test() {
  try {
    const quote = await yahooFinance.quote("IDEA.NS");
    console.log(quote);
  } catch (error) {
    console.error(error);
  }
}

test();