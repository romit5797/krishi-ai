import puppeteer from "puppeteer";

async function getProductsFromAmazon(searchTerm) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(
      `https://www.amazon.in/s?k=${encodeURIComponent(searchTerm)}`,
      {
        waitUntil: "load",
        timeout: 0,
      }
    );

    const products = await page.evaluate(() => {
      const items = [];
      const productElements = document.querySelectorAll(
        "div.s-main-slot div.s-result-item"
      );

      // Use a regular for loop to control the limit more precisely
      for (let i = 0; i < productElements.length && items.length < 5; i++) {
        const product = productElements[i];
        const title = product.querySelector("h2 a span")?.innerText;
        const price = product.querySelector(".a-price-whole")?.innerText;
        const link = product.querySelector("h2 a")?.href;
        const imageUrl = product.querySelector(".s-image")?.src;

        // Ensure title and link are present
        if (title && link && imageUrl) {
          items.push({
            title,
            price: price ? price : "Price not available",
            link,
            imageUrl,
          });
        }
      }

      return items;
    });

    await browser.close();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

export default { getProductsFromAmazon };
