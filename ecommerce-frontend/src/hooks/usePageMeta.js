import { useEffect } from 'react';
import { DEFAULT_DESCRIPTION, DEFAULT_IMAGE, pageTitle, snippet } from '@/lib/seo';

/** Finds or creates one tag in <head>, keyed by an attribute. */
function headTag(tag, key, value) {
  let el = document.head.querySelector(`${tag}[${key}="${value}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  return el;
}

const setMeta = (key, name, content) => headTag('meta', key, name).setAttribute('content', content);

/**
 * Keeps <head> in step with the page: title, description, canonical URL,
 * Open Graph and Twitter cards, and the page's JSON-LD. The prerendered HTML
 * carries the same tags for crawlers; this updates them on client-side
 * navigation (and Google's JavaScript render sees the same values).
 *
 * @param {object} meta
 * @param {string} [meta.title] page name; the brand is appended
 * @param {string} [meta.description]
 * @param {string} [meta.path] canonical path, defaults to the current one
 * @param {string} [meta.image] absolute path of the share image
 * @param {'website'|'product'|'article'} [meta.type]
 * @param {object|object[]} [meta.jsonLd] schema.org data
 */
export function usePageMeta({ title, description, path, image, type = 'website', jsonLd }) {
  const ldText = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}${path ?? window.location.pathname}`;
    const fullTitle = pageTitle(title);
    const text = snippet(description || DEFAULT_DESCRIPTION);
    const imageUrl = `${origin}${image || DEFAULT_IMAGE}`;

    document.title = fullTitle;
    setMeta('name', 'description', text);
    headTag('link', 'rel', 'canonical').setAttribute('href', url);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', text);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', imageUrl);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', text);
    setMeta('name', 'twitter:image', imageUrl);

    const ld = headTag('script', 'id', 'ld-json');
    ld.setAttribute('type', 'application/ld+json');
    ld.textContent = ldText;
  }, [title, description, path, image, type, ldText]);
}
