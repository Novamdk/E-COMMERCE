/**
 * Store policies: shipping, returns, privacy and terms.
 *
 * One source for both the React pages (src/pages/PolicyPage.jsx) and the
 * prerendered HTML (scripts/prerender.mjs), so crawlers and shoppers read the
 * same text. Money, rates and contact details come from constants.js, so the
 * pages can never promise a threshold or address that checkout does not use.
 *
 * Facts carried over from the policies on skenvisiontime.com: the 30-day
 * return window, refunds to the original payment method without the original
 * shipping, 1 to 2 business days to ship, UPS as the carrier, US-only orders.
 * Everything else describes how this site actually works (PayPal checkout,
 * Supabase accounts, Klaviyo email and onsite tracking, Meta, TikTok and Google
 * advertising tags, Vercel hosting).
 *
 * Plain JavaScript with relative imports so Node can load it at build time.
 */
import {
  CONTACT,
  FREE_SHIPPING_THRESHOLD,
  PROMO_CODES,
  SHIPPING_FLAT_RATE,
  SHIPPING_METHODS,
  TAX_RATE,
} from '../lib/constants.js';

/** Shown at the top of every policy. Change it whenever a policy changes. */
export const POLICY_UPDATED = 'November 11, 2026';

/** Days a shopper has to start a return, counted from delivery. */
export const RETURN_WINDOW_DAYS = 30;

const money = (cents) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`;
const percent = (rate) => `${(rate * 100).toFixed(2).replace(/\.?0+$/, '')}%`;

const standard = SHIPPING_METHODS.find((m) => m.id === 'standard');
const express = SHIPPING_METHODS.find((m) => m.id === 'express');
const ADDRESS = CONTACT.ADDRESS_LINES.join(', ');
const EMAIL = CONTACT.EMAIL;
const WELCOME = PROMO_CODES.WELCOME25;

/**
 * A section is a heading plus blocks. A block is a paragraph string, or
 * `{ list: string[] }` for a bulleted list.
 *
 * `id` gives the section an anchor; `hasAdChoices` shows the advertising
 * opt-out switch at the end of the section (React page only).
 *
 * @typedef {{ heading: string, id?: string, hasAdChoices?: boolean,
 *   blocks: (string | { list: string[] })[] }} PolicySection
 * @typedef {{ slug: string, path: string, title: string, label: string,
 *   description: string, intro: string, sections: PolicySection[] }} Policy
 */

/** @type {Policy} */
const shipping = {
  slug: 'shipping',
  path: '/shipping',
  title: 'Shipping policy',
  label: 'Shipping',
  description: `Free US shipping on orders over ${money(FREE_SHIPPING_THRESHOLD)}. Orders ship in 1 to 2 business days with UPS, with standard and express delivery.`,
  intro:
    'We ship every order from the United States. Here is what delivery costs, how long it takes and what to do if something goes wrong on the way.',
  sections: [
    {
      heading: 'Where we ship',
      blocks: [
        'We ship to addresses in all 50 US states, including PO boxes and APO/FPO addresses. We do not ship outside the United States at the moment.',
        `Shopping from abroad? Email us at ${EMAIL} and we will tell you if we can help.`,
      ],
    },
    {
      heading: 'Shipping costs',
      blocks: [
        {
          list: [
            `Standard shipping is free on orders of ${money(FREE_SHIPPING_THRESHOLD)} or more, after any discount. Orders under ${money(FREE_SHIPPING_THRESHOLD)} pay a flat ${money(SHIPPING_FLAT_RATE)}.`,
            `Express shipping adds ${money(express.surcharge)} to the standard rate, so it costs ${money(express.surcharge)} on orders of ${money(FREE_SHIPPING_THRESHOLD)} or more and ${money(SHIPPING_FLAT_RATE + express.surcharge)} below that.`,
            'You see the exact shipping cost at checkout before you pay.',
          ],
        },
      ],
    },
    {
      heading: 'How long it takes',
      blocks: [
        'Orders usually leave our warehouse within 1 to 2 business days. We do not ship on weekends or US holidays.',
        {
          list: [
            `Standard: ${standard.detail} after your order ships.`,
            `Express: ${express.detail} after your order ships.`,
          ],
        },
        'We ship with UPS. UPS does not deliver on weekends, and holiday periods can add a few days. Orders to Alaska, Hawaii, PO boxes and APO/FPO addresses can take longer than these estimates.',
      ],
    },
    {
      heading: 'Tracking your order',
      blocks: [
        'When your order ships, we email you a tracking number. You can also see your order, its status and its tracking number on your order page, and in your order history if you have an account.',
      ],
    },
    {
      heading: 'Sales tax',
      blocks: [
        `Sales tax (currently ${percent(TAX_RATE)}) is added at checkout and shown in your order total before you pay.`,
      ],
    },
    {
      heading: 'Wrong address, lost or damaged packages',
      blocks: [
        `Please check your shipping address before you pay. If you spot a mistake, email us right away at ${EMAIL}; once an order has shipped we cannot change its address.`,
        `If your tracking shows delivered but you cannot find the package, or it arrives damaged, email us within 14 days of the delivery date with your order number (and a photo if something is damaged). We will work with UPS and send a replacement or a refund.`,
      ],
    },
  ],
};

/** @type {Policy} */
const returns = {
  slug: 'returns',
  path: '/returns',
  title: 'Returns and refunds',
  label: 'Returns',
  description: `Returns within ${RETURN_WINDOW_DAYS} days of delivery on unopened products, refunds to your original payment method, and help if a product arrives damaged or wrong.`,
  intro: `Not right for you? You have ${RETURN_WINDOW_DAYS} days from delivery to start a return. Because these are skin and hair care products, a few rules keep everything hygienic for the next customer.`,
  sections: [
    {
      heading: 'What you can return',
      blocks: [
        {
          list: [
            `Unopened, unused products in their original packaging, within ${RETURN_WINDOW_DAYS} days of delivery.`,
            'Orders placed on our website and shipped to a US address. Products bought from other shops or marketplaces go back to the shop you bought them from.',
          ],
        },
      ],
    },
    {
      heading: 'Opened products',
      blocks: [
        'For hygiene and safety reasons we cannot take back products that have been opened or used, unless one of these applies:',
        {
          list: [
            'It arrived damaged, leaking or defective.',
            'We sent the wrong item.',
            'It caused a skin or scalp reaction. Stop using it, then email us with your order number. We review these one by one and want to make it right.',
          ],
        },
      ],
    },
    {
      heading: 'How to start a return',
      blocks: [
        {
          list: [
            `Email ${EMAIL} with your order number and the items you want to return. Please do not send anything back before you hear from us.`,
            'We reply within one business day with the return address and instructions.',
            'Pack the items securely and keep your tracking number until your refund arrives.',
          ],
        },
        'Return shipping is paid by you, unless the return is because of our mistake or a damaged or defective product. In those cases we cover it, and you may not need to send the item back at all.',
      ],
    },
    {
      heading: 'Refunds',
      blocks: [
        'Once your return reaches us and passes inspection, we refund the price you paid for the returned items, after any discount, to your original payment method (your PayPal account, or the card you paid with through PayPal).',
        'We process refunds within 4 to 5 business days of receiving your return. Your bank or card company decides how fast the money shows up, which can take up to one billing cycle.',
        'Original shipping costs are not refunded, except when the return is because of our mistake or a damaged or defective product.',
        'If your order came with a free gift, you can keep it.',
      ],
    },
    {
      heading: 'Exchanges',
      blocks: [
        `Want a different product instead? Email us at ${EMAIL} within ${RETURN_WINDOW_DAYS} days of delivery and we will help you swap it under the same conditions as a return.`,
      ],
    },
  ],
};

/** @type {Policy} */
const privacy = {
  slug: 'privacy',
  path: '/privacy',
  title: 'Privacy policy',
  label: 'Privacy',
  description:
    'What information SK Envision collects when you shop, why, who helps us process it, how email, cookies and advertising tags work, and your privacy rights, including for California residents.',
  intro:
    'This policy explains what information SK Envision collects when you visit our website or shop with us, how we use it and the choices you have. We never sell your personal information for money.',
  sections: [
    {
      heading: 'Who we are',
      blocks: [
        `SK Envision is a hair and skin care store based at ${ADDRESS}. You can reach us about privacy at ${EMAIL}.`,
      ],
    },
    {
      heading: 'What we collect',
      blocks: [
        {
          list: [
            'Account details: your name, email address and password if you create an account. Passwords are stored by our account provider in a scrambled (hashed) form, and we never see them.',
            'Order details: your name, email, shipping address, phone number if you give one, the products you buy, the discount code used and your order history.',
            'Payment details: payments are handled by PayPal. We never see or store your card number. PayPal tells us whether a payment went through and gives us a transaction reference.',
            'Email sign-ups: your email address and, if you take one of our quizzes, your answers.',
            'Messages you send us, such as an email to customer care.',
            'Browsing on our site: pages and products you view, items you add to your bag and checkouts you start, plus basic device and browser information and your IP address.',
          ],
        },
      ],
    },
    {
      heading: 'How we use it',
      blocks: [
        {
          list: [
            'To take payment, ship your order, send order and shipping updates and handle returns.',
            'To run your account and show your order history.',
            'To send marketing emails if you have signed up, such as new products, offers and a reminder about items left in your bag.',
            'To answer your questions, prevent fraud and keep the site secure.',
            'To understand which products and pages people like, so we can improve the store.',
            'To measure how our ads on Meta, TikTok and Google perform and to show our ads to people who have visited the store.',
            'To meet tax, accounting and other legal duties.',
          ],
        },
      ],
    },
    {
      heading: 'Who helps us',
      blocks: [
        'We share information only with companies that help us run the store, and only what they need to do their job:',
        {
          list: [
            'PayPal, to process payments.',
            'Supabase, which stores our accounts and orders.',
            'Klaviyo, which sends our emails and records activity on our site.',
            'Vercel, which hosts the website.',
            'UPS, to deliver your order.',
          ],
        },
        'We also use advertising tags from Meta (Facebook and Instagram), TikTok and Google on our site, described under "Cookies and tracking" below. They receive information about your visit directly from your browser.',
        'We may also share information if the law requires it, to protect our rights or customers, or as part of selling or merging the business.',
      ],
    },
    {
      heading: 'Emails and unsubscribing',
      blocks: [
        `We send marketing emails only if you sign up, for example for the ${WELCOME.label.toLowerCase()} code. Every marketing email has an unsubscribe link at the bottom, and you can also email ${EMAIL} to be removed. Unsubscribing does not stop emails about orders you place, such as order confirmations and shipping updates.`,
      ],
    },
    {
      heading: 'Cookies and tracking',
      id: 'choices',
      hasAdChoices: true,
      blocks: [
        'Our site stores a few things in your browser so it works properly: your bag, your wishlist, your language and, if you sign in, your session. These stay on your device.',
        "We use Klaviyo's onsite tracking, which sets a cookie to recognise your browser and records the products you view, add to your bag and check out. If you have given us your email, this activity is linked to it so we can send relevant emails, such as a reminder about items left in your bag. PayPal may set its own cookies when you pay, to process the payment and prevent fraud.",
        'We also use advertising tags from Meta, TikTok and Google. They set cookies and tell those companies which pages and products you view, what you add to your bag, when you start checkout and when you buy (the order number, items and total). We use this to measure how our ads perform and to show our ads to people who have visited our store. Meta, TikTok and Google may combine it with what they already know about you, under their own privacy policies.',
        'You can turn off these advertising tags at any time with the setting below, or by turning on Global Privacy Control in your browser, which we treat as the same request. You can also block or delete cookies in your browser settings; the store will still work, though your bag may not be remembered.',
      ],
    },
    {
      heading: 'How long we keep it',
      blocks: [
        'We keep order records for as long as tax and accounting rules require. We keep your account until you ask us to delete it, and marketing data until you unsubscribe or ask us to delete it.',
      ],
    },
    {
      heading: 'Your choices and rights',
      blocks: [
        `You can ask us at any time to see the personal information we hold about you, correct it or delete it. Email ${EMAIL} from the address you shop with, so we can confirm it is you.`,
      ],
    },
    {
      heading: 'California residents',
      blocks: [
        'If you live in California, the California Consumer Privacy Act (as amended by the CPRA) gives you these rights:',
        {
          list: [
            'To know what personal information we collect, use and share, and to get a copy of it.',
            'To delete the personal information we hold about you, with some legal exceptions such as order records we must keep for tax purposes.',
            'To correct inaccurate personal information.',
            'To opt out of the sale or sharing of your personal information. We never sell it for money, but the advertising tags described above may count as "sharing" for cross-context behavioural advertising under California law. You can opt out with the "Your privacy choices" setting on this page (also linked at the bottom of every page) or with Global Privacy Control.',
            'To limit the use of sensitive personal information. We do not collect sensitive personal information as defined by the law.',
            'Not to be treated differently for using any of these rights.',
          ],
        },
        `To make a request, email ${EMAIL} with the subject "California privacy request". We will confirm your identity using the email address on your orders and reply within 45 days. You can also have an authorised agent make a request for you, with your written permission.`,
        'In the last 12 months we collected the categories listed under "What we collect" above, from you and from your use of our site, for the purposes listed under "How we use it". We disclosed them to the service providers listed under "Who helps us", and shared identifiers and browsing and purchase activity with Meta, TikTok and Google for advertising, as described under "Cookies and tracking".',
      ],
    },
    {
      heading: 'Children',
      blocks: [
        'Our store is not meant for children under 13, and we do not knowingly collect information from them. If you think a child has given us information, email us and we will delete it.',
      ],
    },
    {
      heading: 'Security',
      blocks: [
        'Our site uses encrypted connections (HTTPS), payments go through PayPal, and our database only accepts requests from our own servers. No system is perfectly secure, so please use a strong password that you do not use anywhere else.',
      ],
    },
    {
      heading: 'Changes and contact',
      blocks: [
        'If we change this policy, we will update the date at the top of this page. If a change is significant, we will tell customers by email or on the site.',
        `Questions? Email ${EMAIL}, call ${CONTACT.PHONE} or write to SK Envision, ${ADDRESS}.`,
      ],
    },
  ],
};

/** @type {Policy} */
const terms = {
  slug: 'terms',
  path: '/terms',
  title: 'Terms of service',
  label: 'Terms',
  description:
    'The terms for using the SK Envision website and buying our hair and skin care products: orders, payment, discount codes, product safety and your rights.',
  intro:
    'These terms apply when you use the SK Envision website or buy from us. By placing an order or creating an account, you agree to them. Please read them along with our shipping, returns and privacy policies.',
  sections: [
    {
      heading: 'About us',
      blocks: [
        `This website is run by SK Envision, ${ADDRESS}. Email ${EMAIL} or call ${CONTACT.PHONE}.`,
      ],
    },
    {
      heading: 'Using our site',
      blocks: [
        'You must be at least 18, or the age of majority where you live, to place an order or create an account. Please do not misuse the site, for example by trying to break into it, overload it or copy its content to sell.',
      ],
    },
    {
      heading: 'Your account',
      blocks: [
        'Keep your password private and tell us if you think someone else has used your account. You are responsible for orders placed through it. You can ask us to delete your account at any time.',
      ],
    },
    {
      heading: 'Products and safety',
      blocks: [
        'Our products are cosmetics for external use only. They are not intended to diagnose, treat, cure or prevent any disease, and results vary from person to person.',
        {
          list: [
            'Read the label and ingredients before use, especially if you have allergies or sensitive skin.',
            'Patch test first: apply a small amount to the inside of your arm or behind your ear and wait 24 hours. Do the same strand test before using a hair colour product.',
            'Stop using a product if you notice redness, itching, burning or swelling, and see a doctor if it does not settle.',
            'Avoid contact with the eyes unless a product says it is for the eye area, and rinse with water if it gets in them.',
            'Ask your doctor before use if you are pregnant or breastfeeding, have a skin or scalp condition, or are under medical treatment.',
            'Keep out of reach of children.',
          ],
        },
        'Product photos are as accurate as we can make them, but packaging can change and colours can look different on screens.',
      ],
    },
    {
      heading: 'Orders and prices',
      blocks: [
        'Prices are in US dollars. Placing an order is an offer to buy; we accept it when we ship it. We may limit quantities, or refuse or cancel an order, for example if an item is out of stock, a price is clearly wrong or we suspect fraud. If we cancel after you have paid, we refund you in full.',
        'We may change prices and products at any time, but a change never affects an order you have already paid for.',
      ],
    },
    {
      heading: 'Payment',
      blocks: [
        'We take payment through PayPal. You can pay with your PayPal account, or with a debit or credit card through PayPal without an account, and PayPal may offer its own Pay Later options. PayPal processes your payment under its own terms, and we never see your card number.',
        `Sales tax (currently ${percent(TAX_RATE)}) and shipping are added at checkout and shown before you pay.`,
      ],
    },
    {
      heading: 'Discount codes',
      blocks: [
        {
          list: [
            `${WELCOME.code} gives ${WELCOME.value}% off your first order with us, once per customer.`,
            'Only one discount code can be used per order, and codes cannot be exchanged for cash.',
            'Codes apply to the products in your order, not to tax.',
            'We may end or change an offer at any time, and cancel orders that misuse a code.',
          ],
        },
      ],
    },
    {
      heading: 'Shipping and returns',
      blocks: [
        `Delivery and returns are covered by our shipping policy and our returns policy. Risk of loss passes to you when your order is delivered.`,
      ],
    },
    {
      heading: 'Our content',
      blocks: [
        'The SK Envision name, logo, photos and text on this site belong to SK Envision. Please do not copy or use them without our written permission.',
      ],
    },
    {
      heading: 'Disclaimers and liability',
      blocks: [
        'We work hard to keep the site accurate and running, but we provide it as is and cannot promise it will always be available or error free.',
        'As far as the law allows, SK Envision is not liable for indirect or consequential losses, and our total liability for any order is limited to the amount you paid for it. Nothing in these terms limits rights you have under consumer protection law that cannot be waived.',
      ],
    },
    {
      heading: 'Indemnity',
      blocks: [
        'If you break these terms or the law when using our site, you agree to cover reasonable costs and claims that SK Envision faces as a result.',
      ],
    },
    {
      heading: 'Governing law',
      blocks: [
        'These terms are governed by the laws of the State of California and the United States. Any dispute will be handled in the courts of Orange County, California, unless the law where you live gives you the right to bring it elsewhere.',
      ],
    },
    {
      heading: 'Changes and contact',
      blocks: [
        'We may update these terms. The version on this page when you place an order applies to that order.',
        `Questions about these terms? Email ${EMAIL} or write to SK Envision, ${ADDRESS}.`,
      ],
    },
  ],
};

/** @type {Policy} */
const accessibility = {
  slug: 'accessibility',
  path: '/accessibility',
  title: 'Accessibility',
  label: 'Accessibility',
  description:
    'How SK Envision works to make its website usable for everyone, and how to get help or report a problem.',
  intro:
    'We want everyone to be able to shop with us, including people who use a screen reader, keyboard, magnifier or other assistive technology.',
  sections: [
    {
      heading: 'What we aim for',
      blocks: [
        'We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA. We design the site to these standards and fix problems as we find them:',
        {
          list: [
            'Every page and checkout step works with a keyboard alone.',
            'Images have text descriptions, and buttons and form fields have labels that screen readers announce.',
            'Text has strong contrast against its background and can be zoomed without breaking the page.',
            'Animations are reduced when your device asks for less motion.',
          ],
        },
      ],
    },
    {
      heading: 'Need help or found a problem?',
      blocks: [
        `If any part of the site is hard to use, email ${EMAIL} or call ${CONTACT.PHONE}. Tell us the page and what went wrong, and we will help you find a product or place your order another way. We aim to reply within two business days.`,
      ],
    },
    {
      heading: 'Other companies',
      blocks: [
        'Payment happens in PayPal, which runs its own accessibility programme. If you have trouble paying, contact us and we will help.',
      ],
    },
  ],
};

/** In footer order. */
export const POLICIES = [shipping, returns, privacy, terms, accessibility];

/** @param {string} slug @returns {Policy | undefined} */
export const policyBySlug = (slug) => POLICIES.find((policy) => policy.slug === slug);
