/**
 * Store policies: shipping, returns, privacy, terms and accessibility.
 *
 * One source for both the React pages (src/pages/PolicyPage.jsx) and the
 * prerendered HTML (scripts/prerender.mjs), so crawlers and shoppers read the
 * same text. Contact details, delivery estimates and codes come from
 * constants.js, so the pages match what checkout does.
 *
 * Rebuilt Nov 2026 to cover what large US hair and beauty stores cover
 * (processing, carriers, lost and stolen parcels, return conditions, CCPA/CPRA
 * notices including the financial incentive and "sale or sharing", Shine the
 * Light, the California Civil Code 1789.3 notice, accessibility), written in
 * SK Envision's own words. Owner's choices kept: 30-day returns on unopened
 * products, customer pays return shipping unless it is our error, damage and
 * lost parcels reported within 14 days, California law and Orange County
 * courts.
 *
 * Shipping prices are left to checkout until the owner sets final rates.
 *
 * Plain JavaScript with relative imports so Node can load it at build time.
 */
import { CONTACT, PROMO_CODES, SHIPPING_METHODS } from '../lib/constants.js';

/** Shown at the top of every policy. Change it whenever a policy changes. */
export const POLICY_UPDATED = 'November 11, 2026';

/** Days a shopper has to start a return, counted from delivery. */
export const RETURN_WINDOW_DAYS = 30;

/** Days to tell us about a damaged, wrong, missing or lost order. */
const REPORT_WINDOW_DAYS = 14;

const standard = SHIPPING_METHODS.find((m) => m.id === 'standard');
const express = SHIPPING_METHODS.find((m) => m.id === 'express');
const ADDRESS = CONTACT.ADDRESS_LINES.join(', ');
const EMAIL = CONTACT.EMAIL;
const PHONE = CONTACT.PHONE;
const WELCOME = PROMO_CODES.WELCOME25;

/**
 * A section is a heading plus blocks. A block is a paragraph string,
 * `{ list: string[] }` for a bulleted list, or `{ subheading: string }`.
 *
 * Every section gets an anchor from its heading (or `id`); `hasAdChoices`
 * shows the advertising opt-out switch at the end of the section (React page
 * only). `summary` is the "At a glance" box at the top of the page.
 *
 * @typedef {string | { list: string[] } | { subheading: string }} PolicyBlock
 * @typedef {{ heading: string, id?: string, hasAdChoices?: boolean,
 *   blocks: PolicyBlock[] }} PolicySection
 * @typedef {{ slug: string, path: string, title: string, label: string,
 *   description: string, intro: string, summary: string[],
 *   sections: PolicySection[] }} Policy
 */

/* ------------------------------ shipping ------------------------------ */

/** @type {Policy} */
const shipping = {
  slug: 'shipping',
  path: '/shipping',
  title: 'Shipping policy',
  label: 'Shipping',
  description:
    'How SK Envision ships within the United States: processing times, delivery estimates, tracking, address changes and what to do if a package is lost, stolen or damaged.',
  intro:
    'Everything you need to know about getting your order: when it leaves us, how long it takes, how to track it and what we do if something goes wrong along the way.',
  summary: [
    'Orders ship within 1 to 2 business days.',
    'We ship to street addresses in all 50 US states.',
    'Shipping options and costs are shown at checkout before you pay.',
    'A tracking number is emailed as soon as your order ships.',
    `Tell us within ${REPORT_WINDOW_DAYS} days if a package is lost, damaged or missing an item.`,
  ],
  sections: [
    {
      heading: 'Order processing',
      blocks: [
        'Orders are packed and handed to the carrier within 1 to 2 business days (Monday to Friday, excluding US holidays). Orders placed on a weekend or holiday start processing the next business day.',
        'During busy periods such as Black Friday, holiday sales and new launches, processing can take a few extra days. We will email you if your order is going to be later than expected.',
        'You will get an order confirmation email straight after you pay. If you do not see it within an hour, check your spam folder or email us.',
      ],
    },
    {
      heading: 'Where we ship',
      blocks: [
        'We ship to street addresses in all 50 US states.',
        `We do not ship outside the United States at the moment. If you need delivery to a PO box or an APO/FPO military address, email ${EMAIL} before you order and we will tell you whether we can send it.`,
      ],
    },
    {
      heading: 'Shipping options and costs',
      blocks: [
        'The shipping options available for your address, and their exact cost, are shown at checkout before you pay. Any free-shipping offer that is running is shown on the site and applied at checkout automatically when your order qualifies.',
        {
          list: [
            `Standard shipping: usually arrives ${standard.detail} after your order ships.`,
            `Express shipping: usually arrives ${express.detail} after your order ships.`,
          ],
        },
        'Delivery times are estimates from the carrier, not guarantees. Weather, carrier delays and holiday volume can add time, and Alaska and Hawaii usually take longer.',
      ],
    },
    {
      heading: 'Tracking your order',
      blocks: [
        'When your order ships, we email a tracking number and a link to follow it. If you have an account, you can also see your orders and tracking under My account.',
        'Tracking can take up to 24 hours to update after you receive it.',
      ],
    },
    {
      heading: 'Changing or cancelling an order',
      blocks: [
        `We start packing orders quickly, so email ${EMAIL} as soon as possible with your order number if you need to change your address or cancel. We will do our best, but once an order has shipped we cannot change or cancel it. You can return it instead under our returns policy.`,
      ],
    },
    {
      heading: 'Check your address',
      blocks: [
        'Please make sure your shipping address is complete and correct, including any apartment or suite number. We are not responsible for orders delivered to an address entered incorrectly at checkout.',
        'If a package comes back to us as undeliverable or unclaimed, we will contact you. We can reship it once you confirm the address (you pay the new shipping cost) or refund the products, less the original shipping.',
      ],
    },
    {
      heading: 'Lost, stolen or damaged packages',
      blocks: [
        { subheading: 'Lost in transit' },
        `If your tracking has not moved for 7 days, or your order has not arrived within ${REPORT_WINDOW_DAYS} days of the latest delivery estimate, email us with your order number. We will open a trace with the carrier and, if the package cannot be found, send a replacement or a refund.`,
        { subheading: 'Marked as delivered but not received' },
        'Please check around your property, with neighbours and with your building or mail room, and wait one more business day, since carriers sometimes mark packages delivered early. If it still has not turned up, email us within 14 days of the delivery date and we will file a claim with the carrier and help you get it sorted.',
        { subheading: 'Damaged, leaking or missing items' },
        `Email us within ${REPORT_WINDOW_DAYS} days of delivery with your order number and a photo of the product and the box. We will send a replacement or a refund, at no cost to you.`,
      ],
    },
    {
      heading: 'Sales tax',
      blocks: [
        'Sales tax, where it applies, is added at checkout and shown in your order total before you pay.',
      ],
    },
    {
      heading: 'Questions',
      blocks: [`Email ${EMAIL} or call ${PHONE}. We reply within one business day.`],
    },
  ],
};

/* ------------------------------ returns ------------------------------- */

/** @type {Policy} */
const returns = {
  slug: 'returns',
  path: '/returns',
  title: 'Returns and refunds',
  label: 'Returns',
  description: `Returns within ${RETURN_WINDOW_DAYS} days of delivery on unopened products, refunds to your original payment method, and free fixes if an order arrives damaged or wrong.`,
  intro: `We want you to love what you ordered. If something is not right, you have ${RETURN_WINDOW_DAYS} days from delivery to return it. Because these are hair and skin care products, a few rules keep everything safe and hygienic for every customer.`,
  summary: [
    `${RETURN_WINDOW_DAYS} days from delivery to start a return.`,
    'Products must be unopened and unused, in their original packaging.',
    'Damaged, defective or wrong items are on us, opened or not.',
    'Return shipping is paid by you, unless we made a mistake.',
    'Refunds go back to your original payment method.',
  ],
  sections: [
    {
      heading: 'What you can return',
      blocks: [
        {
          list: [
            `Unopened, unused products in their original packaging, with any seal intact, within ${RETURN_WINDOW_DAYS} days of delivery.`,
            'Bundles and sets can be returned whole and unopened. If you want to return part of a set, email us first and we will work out the refund for the items you send back.',
            'Only orders placed on our website. Products bought from another shop, salon or marketplace go back to where you bought them.',
          ],
        },
      ],
    },
    {
      heading: 'What we cannot accept',
      blocks: [
        'For hygiene and safety reasons, we cannot take back products that have been opened, used or had their seal broken, unless one of the cases under "When we cover it" applies. We also cannot accept:',
        {
          list: [
            `Returns started more than ${RETURN_WINDOW_DAYS} days after delivery.`,
            'Items marked as final sale when you bought them.',
            'Free gifts and samples. You are welcome to keep them.',
            'Products damaged after delivery through misuse, heat or storage.',
          ],
        },
      ],
    },
    {
      heading: 'When we cover it',
      blocks: [
        'We will put it right at no cost to you, even if the product has been opened, when:',
        {
          list: [
            `It arrived damaged, leaking or defective, and you tell us within ${REPORT_WINDOW_DAYS} days of delivery with a photo.`,
            `We sent the wrong item, or an item was missing, and you tell us within ${REPORT_WINDOW_DAYS} days of delivery.`,
            'It caused a skin or scalp reaction. Stop using it straight away and email us with your order number. We look at every case individually and will help make it right.',
          ],
        },
        'In these cases we send a replacement or a full refund, including shipping, and we may not need the item back.',
      ],
    },
    {
      heading: 'How to start a return',
      blocks: [
        {
          list: [
            `Email ${EMAIL} with your order number, the items you want to return and the reason.`,
            'We reply within one business day with the return address and instructions. Please wait for our reply before sending anything, since packages sent without instructions can be delayed or lost.',
            'Pack the items securely and send them with a tracked service. Keep your tracking number until your refund arrives.',
          ],
        },
      ],
    },
    {
      heading: 'Return shipping',
      blocks: [
        'You pay for return shipping, unless the return is because of our mistake or a damaged or defective product. We recommend a tracked service, as we cannot refund returns that do not reach us.',
      ],
    },
    {
      heading: 'Refunds',
      blocks: [
        'Once your return arrives and we have checked it, we email you to confirm. Approved refunds are sent within 5 business days, to the original payment method: your PayPal account, or the card you paid with through PayPal.',
        'We refund the price you paid for the returned items, after any discount. Original shipping costs are refunded only when the return is because of our mistake or a damaged or defective product.',
        'Your bank or card company decides how quickly the money shows up, which can take up to 10 business days or one billing cycle. If it has been longer than that, check with PayPal or your bank first, then email us and we will look into it.',
      ],
    },
    {
      heading: 'Exchanges',
      blocks: [
        `Want a different product or shade? Email us within ${RETURN_WINDOW_DAYS} days of delivery. Exchanges follow the same rules as returns: the item must be unopened, and you pay the shipping back to us unless we made a mistake.`,
      ],
    },
    {
      heading: 'Cancelling an order',
      blocks: [
        `If you change your mind before your order ships, email ${EMAIL} right away. If we have not shipped it yet, we cancel it and refund you in full. Once it has shipped, it follows this returns policy.`,
      ],
    },
    {
      heading: 'Gifts',
      blocks: [
        'If you received an order as a gift, the refund goes to the person who paid for it. Email us with the order number and we will help.',
      ],
    },
    {
      heading: 'Questions',
      blocks: [`Email ${EMAIL} or call ${PHONE}. We reply within one business day.`],
    },
  ],
};

/* ------------------------------ privacy ------------------------------- */

/** @type {Policy} */
const privacy = {
  slug: 'privacy',
  path: '/privacy',
  title: 'Privacy policy',
  label: 'Privacy',
  description:
    'What personal information SK Envision collects, how it is used and shared, how cookies, email, texts and advertising tags work, and your privacy rights, including for California residents.',
  intro:
    'This policy explains what personal information SK Envision collects when you visit our website, shop with us or sign up for emails or texts, how we use and share it, and the choices and rights you have. We do not sell your personal information for money.',
  summary: [
    'We collect what we need to run the store, ship your orders and send the emails or texts you sign up for.',
    'We never see your card number: payments are handled by PayPal.',
    'Advertising tags from Meta, TikTok and Google can be turned off below, and we honour Global Privacy Control.',
    `You can ask to see, correct or delete your information at ${EMAIL}.`,
  ],
  sections: [
    {
      heading: 'Who we are',
      blocks: [
        `SK Envision ("we", "us") is a hair and skin care store based at ${ADDRESS}. This policy covers our website and any emails and texts we send. For privacy questions, email ${EMAIL} or call ${PHONE}.`,
      ],
    },
    {
      heading: 'Information we collect',
      blocks: [
        { subheading: 'Information you give us' },
        {
          list: [
            'Contact and account details: name, email address, phone number, shipping and billing address, and your password if you create an account (stored by our account provider in encrypted form, so we never see it).',
            'Order details: the products you buy, prices, discount codes used, order history and any returns.',
            'Sign-ups and quizzes: your email or mobile number when you sign up for offers, and your answers if you take our hair quiz or gift finder.',
            'Messages: anything you send us by email, phone or our contact form.',
          ],
        },
        { subheading: 'Information collected automatically' },
        {
          list: [
            'Browsing activity: pages and products you view, items you add to your bag or wishlist, checkouts you start and purchases, and how you reached our site.',
            'Device information: browser type, device type, IP address and approximate location based on your IP address (city or region, not your precise location).',
            'Cookies and similar technologies, described below.',
          ],
        },
        { subheading: 'Information from others' },
        {
          list: [
            'PayPal tells us whether a payment went through and gives us a transaction reference. We never receive your full card number.',
            'Delivery companies tell us about the status of your shipment.',
            'Advertising platforms may tell us, in summary form, how our ads performed.',
          ],
        },
        'We do not knowingly collect sensitive personal information, such as health information, government ID numbers or precise location. Please do not send us health details by email; if you tell us about a reaction to a product, we use what you share only to help you and handle the issue.',
      ],
    },
    {
      heading: 'How we use it',
      blocks: [
        {
          list: [
            'To process payments, ship orders, send order and delivery updates and handle returns and refunds.',
            'To run your account and show your order history.',
            'To send marketing emails and texts you have signed up for, such as new products, offers and a reminder about items left in your bag.',
            'To recommend products, for example from your quiz answers.',
            'To answer questions and give customer support.',
            'To understand how the store is used and improve it.',
            'To measure our advertising and show our ads to people who have visited our store.',
            'To prevent fraud, keep the site secure and enforce our terms.',
            'To meet tax, accounting and other legal obligations.',
          ],
        },
      ],
    },
    {
      heading: 'How we share it',
      blocks: [
        'We share personal information only as described here:',
        {
          list: [
            'Service providers that run the store for us and may use the information only for that purpose: PayPal (payments), Supabase (accounts and order records), Klaviyo (email, texts and onsite activity), Vercel (website hosting) and our shipping carriers.',
            'Advertising partners: Meta (Facebook and Instagram), TikTok and Google receive information about your visit through tags on our site, as described under "Cookies and advertising". You can opt out below.',
            'Legal and safety: when the law requires it, to respond to valid legal requests, or to protect our customers, our business or others from fraud or harm.',
            'Business changes: if SK Envision is sold, merged or reorganised, customer information may transfer to the new owner, who must continue to protect it under this policy.',
          ],
        },
      ],
    },
    {
      heading: 'Cookies and advertising',
      id: 'choices',
      hasAdChoices: true,
      blocks: [
        { subheading: 'Cookies we need' },
        'Our site stores a few things in your browser so it works: your bag, wishlist, language and, if you sign in, your session. PayPal may set its own cookies when you pay, to process the payment and prevent fraud.',
        { subheading: 'Email and site activity' },
        "We use Klaviyo's onsite tracking, which recognises your browser and records products you view, add to your bag and check out. If you have given us your email, this activity is linked to it so we can send relevant emails, such as a reminder about items left in your bag.",
        { subheading: 'Advertising tags' },
        'We use advertising tags from Meta, TikTok and Google. They set cookies and tell those companies which pages and products you view, what you add to your bag, when you start checkout and when you buy (the order number, items and total). We use this to measure how our ads perform and to show our ads to people who have visited our store. These companies may combine it with other information they hold about you, under their own privacy policies.',
        { subheading: 'Your choices' },
        'You can turn these advertising tags off with the setting below. We also treat a Global Privacy Control signal from your browser as the same request. You can block or delete cookies in your browser settings too; the store will still work, though your bag may not be remembered. Our site does not respond to other "Do Not Track" signals.',
      ],
    },
    {
      heading: 'Emails and texts',
      blocks: [
        `We send marketing emails only if you sign up, for example for the ${WELCOME.label.toLowerCase()} code. Every marketing email has an unsubscribe link, and you can also email ${EMAIL} to be removed.`,
        'If you sign up for texts, we send recurring automated marketing messages to the number you give us. Consent is not a condition of purchase, message frequency varies, and message and data rates may apply. Reply STOP to stop or HELP for help. We do not share your mobile number or text consent with other companies for their own marketing.',
        'Unsubscribing does not stop messages about orders you place, such as order confirmations and delivery updates.',
      ],
    },
    {
      heading: 'How long we keep it',
      blocks: [
        {
          list: [
            'Order and payment records: as long as tax and accounting rules require, usually seven years.',
            'Accounts: until you ask us to delete your account.',
            'Marketing data: until you unsubscribe or ask us to delete it.',
            'Customer service messages: up to three years after the issue is closed.',
          ],
        },
      ],
    },
    {
      heading: 'Security',
      blocks: [
        'Our site uses encrypted connections (HTTPS), payments are handled by PayPal, and our order database only accepts requests from our own servers. No system is perfectly secure, so please use a strong password that you do not use anywhere else, and tell us if you think your account has been misused.',
      ],
    },
    {
      heading: 'Your rights',
      blocks: [
        `You can ask us at any time to tell you what personal information we hold about you, give you a copy, correct it or delete it. Email ${EMAIL} from the address you shop with. Depending on where you live, you may have additional rights under your state's privacy law; we honour them as the law requires.`,
        'If we decline your request, you can appeal by replying to our decision with the subject "Privacy appeal". We will respond within 45 days.',
      ],
    },
    {
      heading: 'California privacy rights',
      blocks: [
        'If you live in California, the California Consumer Privacy Act, as amended by the California Privacy Rights Act (together, the CCPA), gives you the rights below. This section is also our notice at collection.',
        { subheading: 'What we collect and why' },
        'In the last 12 months we collected these categories of personal information, from you, your device and the companies named in "Information we collect", for the purposes in "How we use it":',
        {
          list: [
            'Identifiers, such as name, email, phone number, postal address, IP address and account login.',
            'Customer records, such as billing and shipping address and phone number.',
            'Commercial information, such as products bought, considered or returned.',
            'Internet activity, such as pages and products viewed and interactions with our emails.',
            'Approximate location derived from your IP address.',
            'Inferences, such as product preferences from your purchases and quiz answers.',
          ],
        },
        'We keep each category for the periods in "How long we keep it". We do not collect sensitive personal information as defined by the CCPA, and we do not knowingly sell or share the personal information of anyone under 16.',
        { subheading: 'Selling and sharing' },
        'We do not sell personal information for money. However, the advertising tags from Meta, TikTok and Google may count as "selling" or "sharing" for cross-context behavioural advertising under California law. The categories involved are identifiers, internet activity and commercial information. You can opt out at any time with the "Your privacy choices" setting on this page, which is also linked at the bottom of every page, or with Global Privacy Control.',
        { subheading: 'Your rights' },
        {
          list: [
            'To know what personal information we collect, use, disclose and share, and to get a copy of it.',
            'To delete personal information we hold about you, with some legal exceptions, such as order records we must keep for tax purposes.',
            'To correct inaccurate personal information.',
            'To opt out of the sale or sharing of your personal information.',
            'To limit the use of sensitive personal information. We do not collect it, so there is nothing to limit.',
            'Not to be treated differently for using any of these rights.',
          ],
        },
        { subheading: 'How to make a request' },
        `Email ${EMAIL} with the subject "California privacy request", or call ${PHONE}. To protect you, we verify requests by matching the details you give us with our records, usually by confirming the email address on your orders. We respond within 45 days, or tell you if we need up to 45 more. You can ask someone to act for you as an authorised agent; we will ask for your written permission and may ask you to verify your identity directly.`,
        { subheading: 'Notice of financial incentive' },
        `We offer a discount, such as ${WELCOME.label.toLowerCase()}, to people who sign up for our emails or texts, and a discount for finishing our hair quiz with your email. In exchange we collect your email address or mobile number, and quiz answers where relevant. Joining is optional, and you can leave at any time by unsubscribing or replying STOP; you keep any discount already used. We estimate the value of your information to be roughly equal to the discount offered, based on what we expect a subscriber to spend with us and the cost of the offer.`,
        { subheading: 'Shine the Light' },
        `California's "Shine the Light" law lets residents ask once a year about personal information we disclosed to other companies for their own direct marketing. We do not disclose personal information for that purpose. You can still send a request to ${EMAIL}.`,
      ],
    },
    {
      heading: 'Children',
      blocks: [
        'Our store is for adults. It is not directed to children under 16, and we do not knowingly collect personal information from children under 13. If you believe a child has given us personal information, email us and we will delete it.',
      ],
    },
    {
      heading: 'Changes to this policy',
      blocks: [
        'If we change this policy, we will update the date at the top of this page. If a change is significant, we will tell customers by email or with a notice on the site before it takes effect.',
      ],
    },
    {
      heading: 'Contact us',
      blocks: [`Email ${EMAIL}, call ${PHONE} or write to SK Envision, ${ADDRESS}.`],
    },
  ],
};

/* ------------------------------- terms -------------------------------- */

/** @type {Policy} */
const terms = {
  slug: 'terms',
  path: '/terms',
  title: 'Terms of service',
  label: 'Terms',
  description:
    'The terms for using the SK Envision website and buying our hair and skin care products: orders, pricing, payment, promotions, product use, reviews, liability and governing law.',
  intro:
    'These terms are an agreement between you and SK Envision. They apply when you use our website, create an account, sign up for emails or texts, or buy from us. By doing any of these, you agree to these terms and to our shipping, returns and privacy policies. If you do not agree, please do not use the site.',
  summary: [
    'You must be 18 or older to buy from us.',
    'Our products are cosmetics: read the label and patch test before use.',
    'Prices and promotions can change, but never on an order you have already paid for.',
    'California law applies, with disputes heard in Orange County, California.',
  ],
  sections: [
    {
      heading: 'About us',
      blocks: [`This website is run by SK Envision, ${ADDRESS}. Email ${EMAIL} or call ${PHONE}.`],
    },
    {
      heading: 'Who can use the site',
      blocks: [
        'You must be at least 18, or the age of majority where you live, to create an account or place an order. Our products are sold for personal use, not for resale; we may limit or cancel orders that appear to be placed by resellers.',
      ],
    },
    {
      heading: 'Your account',
      blocks: [
        'Keep your login details private and tell us straight away if you think someone else has used your account. You are responsible for activity on your account. We may suspend or close accounts that break these terms. You can ask us to delete your account at any time.',
      ],
    },
    {
      heading: 'Product information and safe use',
      blocks: [
        'Our products are cosmetics for external use only. They are not intended to diagnose, treat, cure or prevent any disease, and results vary from person to person. Descriptions and photos on our site are for general information and are not medical advice.',
        {
          list: [
            'Read the full label, directions and ingredient list before use, especially if you have allergies or sensitive skin.',
            'Patch test before first use: apply a small amount to the inside of your arm or behind your ear and wait 24 hours. For hair colour products, do the allergy test in the product instructions before every use.',
            'Stop using a product if you notice redness, itching, burning or swelling, and see a doctor if it does not settle.',
            'Keep products away from your eyes unless they are made for the eye area, and rinse with water if they get in them.',
            'Ask your doctor before use if you are pregnant or breastfeeding, have a skin or scalp condition, or are under medical treatment.',
            'Keep out of reach of children.',
          ],
        },
        'We try to show products, colours and ingredients accurately, but packaging and formulas can change, and colours can look different on screens. The label on the product you receive is the one to follow.',
      ],
    },
    {
      heading: 'Orders',
      blocks: [
        'Your order is an offer to buy. Our order confirmation email confirms we received it; we accept your order when we ship it. We may refuse, limit or cancel any order, for example if a product is unavailable, a price or description was wrong, the order looks fraudulent, or a promotion was misused. If we cancel after you have paid, we refund you in full.',
      ],
    },
    {
      heading: 'Prices and availability',
      blocks: [
        'Prices are in US dollars and do not include shipping or sales tax, which are shown at checkout before you pay.',
        'We may change prices, products and promotions at any time, but a change never affects an order you have already paid for. If a product is listed at the wrong price because of an error, we will contact you before shipping and let you choose to pay the correct price or cancel.',
      ],
    },
    {
      heading: 'Payment',
      blocks: [
        'We take payment through PayPal: with your PayPal account, or with a debit or credit card through PayPal without an account. PayPal may also offer its own Pay Later options under its own terms. We never see or store your full card number. Your payment is charged when you place the order.',
      ],
    },
    {
      heading: 'Promotions and discount codes',
      blocks: [
        {
          list: [
            `${WELCOME.code} gives ${WELCOME.value}% off your first order, once per customer.`,
            'Unless an offer says otherwise, one discount code can be used per order, codes cannot be combined, exchanged for cash or applied to past orders, and they apply to products, not to tax or gift cards.',
            'Each promotion may have its own dates and conditions, which are shown with the offer.',
            'We may end or change an offer at any time, and cancel orders that misuse a code.',
          ],
        },
      ],
    },
    {
      heading: 'Shipping, returns and risk of loss',
      blocks: [
        'Delivery and returns follow our shipping policy and returns policy, which are part of these terms. Title and risk of loss pass to you when the carrier delivers your order.',
      ],
    },
    {
      heading: 'Emails and texts',
      blocks: [
        'If you sign up for marketing emails or texts, you agree to receive them at the email address or number you give us. Texts are recurring automated marketing messages; consent is not a condition of purchase, message frequency varies, and message and data rates may apply. Reply STOP to cancel or HELP for help, and use the unsubscribe link in any email. Carriers are not liable for delayed or undelivered messages.',
      ],
    },
    {
      heading: 'Reviews and content you share',
      blocks: [
        'If you post a review, photo or comment on our site or tag us on social media, it must be honest, based on your own experience and free of anything unlawful, offensive or that you do not have the right to share. If you received a free product or other benefit in exchange, you must say so.',
        'By submitting content to us, you allow SK Envision to use, show and share it, with your name or handle, on our website, emails and social media without payment. We may remove content that breaks these rules. We do not edit reviews to change their meaning, and we publish negative reviews as well as positive ones.',
      ],
    },
    {
      heading: 'Our content and trademarks',
      blocks: [
        'The SK Envision name, logo, product names, photos, videos and text on this site belong to SK Envision or our licensors. You may view and print pages for personal shopping, but please do not copy, sell or reuse our content without our written permission.',
      ],
    },
    {
      heading: 'Using the site responsibly',
      blocks: [
        'Please do not use the site to break the law, infringe anyone’s rights, send spam, try to gain access to accounts or systems that are not yours, interfere with the site’s security or performance, or collect data from it with bots or scrapers.',
      ],
    },
    {
      heading: 'Other companies’ services',
      blocks: [
        'Our site links to and uses services run by other companies, such as PayPal and social media sites. Their own terms and privacy policies apply, and we are not responsible for their content or practices.',
      ],
    },
    {
      heading: 'Disclaimers',
      blocks: [
        'We work hard to keep the site accurate and available, but it is provided "as is" and "as available". To the extent the law allows, we do not promise the site will always be available, uninterrupted or error free, and we make no warranties beyond those stated on our products or required by law.',
      ],
    },
    {
      heading: 'Limitation of liability',
      blocks: [
        'To the extent the law allows, SK Envision is not liable for indirect, incidental, special or consequential losses arising from your use of the site or our products, and our total liability for any claim about an order is limited to the amount you paid for that order. Nothing in these terms limits rights you have under consumer protection law that cannot be waived, or our liability where the law does not allow it to be limited.',
      ],
    },
    {
      heading: 'Indemnity',
      blocks: [
        'If you break these terms or the law when using our site, you agree to cover reasonable costs, losses and claims that SK Envision faces as a result.',
      ],
    },
    {
      heading: 'Governing law and disputes',
      blocks: [
        `These terms are governed by the laws of the State of California and applicable US federal law. If you have a concern, please contact us first at ${EMAIL}; most issues can be solved quickly. Any dispute that we cannot resolve will be decided in the state or federal courts located in Orange County, California, unless the law where you live gives you the right to bring it elsewhere. Either of us may bring an eligible claim in small claims court.`,
      ],
    },
    {
      heading: 'Notice for California residents',
      blocks: [
        'Under California Civil Code section 1789.3, California users are entitled to the following consumer rights notice. The Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs can be reached in writing at 1625 North Market Blvd., Suite N 112, Sacramento, CA 95834, or by phone at (800) 952-5210.',
      ],
    },
    {
      heading: 'General',
      blocks: [
        'If any part of these terms cannot be enforced, the rest still applies. If we do not enforce a right straight away, we can still enforce it later. These terms, with the policies they mention, are the whole agreement between you and us about using the site and buying from us.',
      ],
    },
    {
      heading: 'Changes to these terms',
      blocks: [
        'We may update these terms. The date at the top of this page shows when they last changed, and the version on this page when you place an order applies to that order.',
      ],
    },
    {
      heading: 'Contact us',
      blocks: [`Email ${EMAIL}, call ${PHONE} or write to SK Envision, ${ADDRESS}.`],
    },
  ],
};

/* ---------------------------- accessibility --------------------------- */

/** @type {Policy} */
const accessibility = {
  slug: 'accessibility',
  path: '/accessibility',
  title: 'Accessibility statement',
  label: 'Accessibility',
  description:
    'SK Envision is committed to a website everyone can use. Our accessibility standard, what we have done, known limitations and how to get help.',
  intro:
    'SK Envision wants everyone to be able to shop with us, including people who use screen readers, keyboard navigation, magnification, voice control or other assistive technology. We are committed to equal access under the Americans with Disabilities Act and California’s Unruh Civil Rights Act.',
  summary: [
    'We aim to meet WCAG 2.1 level AA.',
    'Every page and checkout step can be used with a keyboard and screen reader.',
    `Need help? Email ${EMAIL} or call ${PHONE} and we will help you shop or order.`,
  ],
  sections: [
    {
      heading: 'Our standard',
      blocks: [
        'We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA, the standard published by the World Wide Web Consortium for making websites usable by people with disabilities.',
      ],
    },
    {
      heading: 'What we have done',
      blocks: [
        {
          list: [
            'Every page, menu, product option and checkout step can be used with a keyboard alone, with a visible focus outline.',
            'Images have text descriptions, and buttons, links and form fields have labels that screen readers announce.',
            'Pages use clear headings and landmarks so assistive technology can move around them.',
            'Text and buttons have strong colour contrast, and pages can be zoomed without losing content.',
            'Animations are reduced when your device is set to reduce motion.',
            'Error messages in forms explain what to fix.',
          ],
        },
      ],
    },
    {
      heading: 'Compatibility',
      blocks: [
        'The site is designed to work with current versions of Chrome, Safari, Firefox and Edge, and with common screen readers such as VoiceOver, TalkBack, NVDA and JAWS.',
      ],
    },
    {
      heading: 'Known limitations',
      blocks: [
        'We are still improving the site, and some parts may not be fully accessible yet:',
        {
          list: [
            'Some product photos show text printed on packaging that is not repeated word for word on the page. Product names, sizes and directions are always written on the product page.',
            'Payment happens in PayPal’s own window, which follows PayPal’s accessibility standards rather than ours.',
          ],
        },
      ],
    },
    {
      heading: 'Get help or give feedback',
      blocks: [
        `If anything on our site is hard to use, email ${EMAIL} or call ${PHONE}. Tell us the page and what went wrong. We aim to reply within two business days, and we can help you find products, answer questions about them or place your order by email or phone at the same prices.`,
      ],
    },
    {
      heading: 'Ongoing work',
      blocks: [
        'We review new pages and features against WCAG 2.1 AA and fix problems as we find them or as customers report them.',
        `This statement was last reviewed on ${POLICY_UPDATED}.`,
      ],
    },
  ],
};

/** In footer order. */
export const POLICIES = [shipping, returns, privacy, terms, accessibility];

/** @param {string} slug @returns {Policy | undefined} */
export const policyBySlug = (slug) => POLICIES.find((policy) => policy.slug === slug);

/** Anchor for a section: its own `id`, or one made from its heading. */
export const sectionId = (section) =>
  section.id ??
  section.heading
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
