import {
  BaseDocumentLoader,
  DocumentLoader,
} from "@langchain/core/document_loaders/base";
import type { CheerioAPI, load as LoadT } from "cheerio";
import { Document as LangchainDocument } from "langchain/document";

export class CustomWebLoader
    extends BaseDocumentLoader
    implements DocumentLoader
{
  constructor(public webPath: string) {
    super();
  }

  static async _scrape(url: string): Promise<CheerioAPI> {
    const { load } = await CustomWebLoader.imports();
    const response = await fetch(url);
    const html = await response.text();
    return load(html);
  }

  async scrape(): Promise<CheerioAPI> {
    return CustomWebLoader._scrape(this.webPath);
  }

  async extractMainContent($: CheerioAPI): Promise<string> {
    let content = '';

    // First, try extracting content from 'article' or 'main' elements, these often contain the main content
    content = $("article").text().trim();
    if (content) {
      return content;
    }

    content = $("main").text().trim();
    if (content) {
      return content;
    }

    // Fallback to body if no specific content found
    content = $("body").text().trim();
    return content;
  }

  async cleanHtml(element: CheerioAPI) {
    ["header", "footer", "nav", "img", "aside", ".ad", "style", "script", "iframe"].forEach((selector) => {
      const elements = element(selector);
      elements.each((_, el) => {
        element(el).remove();
      });
    });
    return element.text().trim();
  }

  async cleanContent(pageContent: string): Promise<string> {
    const textContent = pageContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    const scriptContent = textContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    const noTags = scriptContent.replace(/<\/?[^>]+(>|$)/g, "").trim();
    return noTags.replace(/\s+/g, ' ').trim();
  }

  removeExcessWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  async load(): Promise<LangchainDocument[]> {
    const $ = await this.scrape();
    const title = $("body h1").text();
    const content = await this.extractMainContent($);
    const cleanedContent = await this.cleanContent(content);
    const finalContent = this.removeExcessWhitespace(cleanedContent);
    const contentLength =
        (await finalContent)?.match(/\b\w+\b/g)?.length ?? 0;
    const metadata = { source: this.webPath, title, contentLength };

    return [new LangchainDocument({ pageContent: finalContent, metadata })];
  }

  static async imports(): Promise<{
    load: typeof LoadT;
  }> {
    try {
      const { load } = await import("cheerio");
      return { load };
    } catch (e) {
      console.error(e);
      throw new Error(
          "Please install cheerio as a dependency with, e.g. `yarn add cheerio`"
      );
    }
  }
}