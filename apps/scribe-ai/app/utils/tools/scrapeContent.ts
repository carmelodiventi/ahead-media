import puppeteer from 'puppeteer';

const scrapeContent = async ({ urls }: {urls: Array<string>}) => {
    const browser = await puppeteer.launch();
    const scrapedContent = [];

    for (const url of urls) {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const content = await page.evaluate(() => {
            // Define a function to clean up the content by removing unwanted sections
            function cleanContent(element: HTMLElement) {
              ["header", "footer", "nav", "img", "aside", ".ad"].forEach(
                (selector) => {
                  const elements = element.querySelectorAll(selector);
                  elements.forEach((el) => el.remove());
                }
              );
              return element.innerText.trim();
            }

            // Get the main content, usually within an article tag or the body
            const mainContent = document.querySelector('article') || document.body;
            return cleanContent(mainContent);
        });

        console.log(content);

        scrapedContent.push(content);
        await page.close();
    }

    await browser.close();
    return scrapedContent;
};

export default scrapeContent;
