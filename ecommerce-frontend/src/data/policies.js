/**
 * Store policies: shipping, returns, privacy, terms and accessibility.
 *
 * One source for both the React pages (src/pages/PolicyPage.jsx) and the
 * prerendered HTML (scripts/prerender.mjs), so crawlers and shoppers read the
 * same text. Contact details, delivery estimates and codes come from
 * constants.js, so the pages match what checkout does.
 *
 * Rewritten Nov 2026 in a formal style modeled on the structure of large US
 * haircare stores' policies (Olaplex: question-style shipping FAQ, short
 * returns policy, numbered Terms sections, privacy notice organised by what we
 * collect, how we use and share it, choices and California rights, and an
 * accessibility statement). The wording is SK Envision's own. Owner's choices
 * kept: 30-day returns on unopened products, customer pays return shipping
 * unless it is our error, damage and lost parcels reported within 14 days,
 * California law and Orange County courts.
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
    'Shipping questions answered: where SK Envision ships, shipping costs, order processing, delivery times, tracking, carriers, sales tax and lost or damaged packages.',
  intro:
    'Answers to the most common questions about how SK Envision ships your order. If you cannot find what you need here, our customer care team is happy to help.',
  summary: [
    'We ship to all 50 US states.',
    'Orders are processed within 1 to 2 business days.',
    'Shipping options and costs are shown at checkout before you pay.',
    'A tracking number is emailed as soon as your order ships.',
  ],
  sections: [
    {
      heading: 'Where do you ship?',
      blocks: [
        'We currently ship to street addresses in all 50 United States. Delivery to PO boxes and APO/FPO/DPO military addresses may be available for some orders; please contact us before ordering and we will confirm.',
      ],
    },
    {
      heading: 'Do you ship internationally?',
      blocks: [
        'Not at this time. SK Envision ships within the United States only. We hope to offer international shipping in the future.',
      ],
    },
    {
      heading: 'How much does shipping cost?',
      blocks: [
        'Shipping costs are calculated at checkout based on your shipping address and the delivery method you choose, and are shown before you complete your purchase. When a free shipping promotion is running, the terms are shown on our site and qualifying orders receive it automatically at checkout.',
      ],
    },
    {
      heading: 'When will my order be processed?',
      blocks: [
        'Orders are processed and handed to the carrier within 1 to 2 business days, Monday through Friday, excluding US federal holidays. Orders placed on a weekend or holiday begin processing the next business day.',
        'During peak periods, including Black Friday, the holiday season and new product launches, processing may take a few additional business days. If your order will be delayed beyond our normal timeframe, we will contact you by email.',
      ],
    },
    {
      heading: 'When will I receive my order?',
      blocks: [
        'Delivery time depends on the shipping method selected at checkout and is counted from the day your order ships:',
        {
          list: [`Standard shipping: ${standard.detail}.`, `Express shipping: ${express.detail}.`],
        },
        'Delivery times are estimates provided by our carriers and are not guaranteed. Weather, carrier delays and high seasonal volume may extend delivery times. Deliveries to Alaska, Hawaii and remote areas may take longer.',
      ],
    },
    {
      heading: 'How do I track my order?',
      blocks: [
        'Once your order ships, you will receive a shipping confirmation email with your tracking number and a link to follow your package. If you have an account, you can also view your order status under My Account. Please allow up to 24 hours for tracking information to update.',
      ],
    },
    {
      heading: 'Who is your courier service?',
      blocks: [
        'We ship with major US carriers. The carrier handling your order is shown in your shipping confirmation email.',
      ],
    },
    {
      heading: 'Can I change or cancel my order?',
      blocks: [
        `Orders are processed quickly, so please contact us at ${EMAIL} as soon as possible with your order number. We will do our best to accommodate changes to the shipping address or to cancel an order that has not yet shipped. Once an order has shipped it can no longer be changed or cancelled, but it may be returned in accordance with our Returns Policy.`,
      ],
    },
    {
      heading: 'What if my shipping address is incorrect?',
      blocks: [
        'Please review your shipping address carefully at checkout, including any apartment or suite number. SK Envision is not responsible for orders delivered to an incorrect address entered at checkout.',
        'If a package is returned to us as undeliverable or unclaimed, we will contact you. We can reship the order once the correct address is confirmed (additional shipping charges apply), or issue a refund for the products, less the original shipping charge.',
      ],
    },
    {
      heading: 'What if my package is lost, stolen or damaged?',
      blocks: [
        { subheading: 'Lost in transit' },
        `If your tracking information has not updated for 7 days, or your order has not arrived within ${REPORT_WINDOW_DAYS} days of the estimated delivery date, contact us with your order number. We will open a trace with the carrier and, if the package cannot be located, send a replacement or issue a refund.`,
        { subheading: 'Marked as delivered but not received' },
        `Please check around your property, with neighbors and with your building's mail room, and allow one additional business day, as carriers sometimes mark packages as delivered early. If the package still has not arrived, contact us within ${REPORT_WINDOW_DAYS} days of the delivery date and we will file a claim with the carrier and work with you on a resolution.`,
        { subheading: 'Damaged, leaking or missing items' },
        `Contact us within ${REPORT_WINDOW_DAYS} days of delivery with your order number and photos of the product and packaging. We will send a replacement or issue a refund at no cost to you.`,
      ],
    },
    {
      heading: 'Do you charge sales tax on orders through your website?',
      blocks: [
        'Yes, where required by law. Applicable sales tax is calculated at checkout based on your shipping address and is shown in your order total before you complete your purchase.',
      ],
    },
    {
      heading: 'Is there a quantity limit per product?',
      blocks: [
        'Our products are sold for personal use and not for resale. SK Envision reserves the right to limit quantities per order, per customer or per household, and to cancel orders that appear to be placed for resale.',
      ],
    },
    {
      heading: 'Contact us',
      blocks: [
        `For any questions about shipping, please contact us at ${EMAIL} or ${PHONE}. We respond within one business day.`,
        'SK Envision reserves the right to modify this policy at any time. Changes take effect when posted on this page.',
      ],
    },
  ],
};

/* ------------------------------ returns ------------------------------- */

/** @type {Policy} */
const returns = {
  slug: 'returns',
  path: '/returns',
  title: 'Returns policy',
  label: 'Returns',
  description: `SK Envision returns policy: returns of unopened products within ${RETURN_WINDOW_DAYS} days of delivery, how to start a return, return shipping, refunds, exchanges and damaged or incorrect orders.`,
  intro: `If you are not completely satisfied with your purchase from SK Envision, you may return unopened products within ${RETURN_WINDOW_DAYS} days of delivery. Because our products are hair and skin care, the conditions below help keep every product safe and hygienic for all of our customers.`,
  summary: [
    `${RETURN_WINDOW_DAYS} days from delivery to return unopened products.`,
    'Damaged, defective or incorrect items are replaced or refunded at no cost.',
    'Return shipping is paid by the customer unless the return is due to our error.',
    'Refunds are issued to the original payment method.',
  ],
  sections: [
    {
      heading: 'Return eligibility',
      blocks: [
        'To be eligible for a return, items must be:',
        {
          list: [
            'Unopened, unused and in their original packaging, with any safety seal intact.',
            `Returned within ${RETURN_WINDOW_DAYS} days of the delivery date.`,
            'Purchased directly from SK Envision through our website.',
          ],
        },
        'Bundles and sets must be returned complete and unopened. To return part of a set, please contact us first so we can calculate the refund for the items being returned.',
        'If your purchase was made from another retailer, salon or marketplace, please contact that seller directly for a return in line with its own return policy.',
      ],
    },
    {
      heading: 'Non-returnable items',
      blocks: [
        'For health and hygiene reasons, we cannot accept returns of opened or used products, except as described under "Damaged, defective or incorrect items" below. The following are also not eligible for return:',
        {
          list: [
            `Items returned more than ${RETURN_WINDOW_DAYS} days after delivery.`,
            'Items identified as final sale at the time of purchase.',
            'Free gifts and samples.',
            'Products damaged after delivery through misuse, exposure to heat or improper storage.',
          ],
        },
      ],
    },
    {
      heading: 'Damaged, defective or incorrect items',
      blocks: [
        'We will make it right at no cost to you, whether or not the product has been opened, if:',
        {
          list: [
            `Your item arrived damaged, leaking or defective, and you contact us within ${REPORT_WINDOW_DAYS} days of delivery with photos.`,
            `You received the wrong item, or an item was missing from your order, and you contact us within ${REPORT_WINDOW_DAYS} days of delivery.`,
            'You experienced a skin or scalp reaction. Please stop using the product immediately and contact us with your order number. Each case is reviewed individually.',
          ],
        },
        'In these cases we will send a replacement or issue a full refund, including any shipping charges. We may not require the item to be returned.',
      ],
    },
    {
      heading: 'How to start a return',
      blocks: [
        {
          list: [
            `Email ${EMAIL} with your order number, the items you wish to return and the reason for the return.`,
            'We will respond within one business day with your return authorization, the return address and instructions. Please do not send items back without a return authorization, as unauthorized returns may be delayed or lost.',
            'Pack the items securely and ship them using a trackable service. Keep your tracking number until your refund has been issued.',
          ],
        },
      ],
    },
    {
      heading: 'Return shipping',
      blocks: [
        'Return shipping costs are the responsibility of the customer, unless the return is the result of our error or a damaged or defective product. We recommend using a trackable shipping service, as SK Envision cannot issue refunds for returns that are not received.',
      ],
    },
    {
      heading: 'Refunds',
      blocks: [
        'Once your return is received and inspected, we will notify you by email. Approved refunds are issued within 5 business days to your original payment method, either your PayPal account or the card used through PayPal.',
        'Refunds are for the amount paid for the returned items, after any discounts. Original shipping charges are refunded only when the return is the result of our error or a damaged or defective product.',
        'Depending on your bank or card issuer, it may take up to 10 business days, or one billing cycle, for the refund to appear on your statement.',
      ],
    },
    {
      heading: 'Exchanges',
      blocks: [
        `To exchange an item for a different product or shade, contact us within ${RETURN_WINDOW_DAYS} days of delivery. Exchanges are subject to the same conditions as returns: the item must be unopened, and return shipping is the responsibility of the customer unless the exchange is due to our error.`,
      ],
    },
    {
      heading: 'Order cancellations',
      blocks: [
        `To cancel an order, contact us at ${EMAIL} as soon as possible. If the order has not yet shipped, we will cancel it and issue a full refund. Orders that have already shipped are subject to this Returns Policy.`,
      ],
    },
    {
      heading: 'Gifts',
      blocks: [
        'Refunds for orders received as gifts are issued to the original purchaser. Please contact us with the order number and we will assist you.',
      ],
    },
    {
      heading: 'Contact us',
      blocks: [
        `For any further questions about returns, please contact us at ${EMAIL} or ${PHONE}.`,
        'SK Envision reserves the right to modify this policy at any time. Changes take effect when posted on this page and do not apply to orders placed before the change.',
      ],
    },
  ],
};

/* ------------------------------ privacy ------------------------------- */

/** @type {Policy} */
const privacy = {
  slug: 'privacy',
  path: '/privacy',
  title: 'Privacy notice',
  label: 'Privacy',
  description:
    'How SK Envision collects, uses, shares and protects personal information, your choices about email, texts, cookies and advertising, and the rights of California residents under the CCPA.',
  intro:
    'This Privacy Notice describes how SK Envision ("SK Envision", "we", "us" or "our") collects, uses, shares and protects personal information. It also explains the rights and choices you have regarding your personal information and how you can contact us with questions.',
  summary: [],
  sections: [
    {
      heading: 'What this privacy notice covers',
      blocks: [
        'This Privacy Notice covers personal information that SK Envision obtains when you visit our website (the "Site"), create an account, purchase products, sign up for emails or text messages, take a quiz, communicate with us or otherwise interact with us.',
        'Our Site may contain links to third-party websites and services. We have no control over the privacy practices of websites and services we do not own, and we encourage you to review their privacy notices.',
      ],
    },
    {
      heading: 'Information we collect',
      blocks: [
        'We collect information about you from a variety of sources depending on how you interact with us. Examples of personal information we collect directly from you include:',
        {
          list: [
            'Account registration: when you create an account, we collect your name, email address and login details. Your password is stored by our account provider in encrypted form and is not visible to us.',
            'Purchasing online: when you place an order, we collect your name, email address, phone number, shipping address and billing address. Payments are processed by PayPal; we do not receive or store your full card number.',
            'Quizzes: when you complete our hair quiz or gift finder, we collect your answers, such as your hair type and concerns, and, if you choose to provide it, your email address.',
            'Promotional communications: when you sign up for emails or text messages, we collect your email address or mobile phone number, and information about how you interact with the messages we send.',
            'Communications with us: when you contact us by email, phone or our contact form, we collect your name, contact details and any information you choose to share.',
            'Reviews and content: if you submit a review, photo or other content, we collect the information you share.',
          ],
        },
        { subheading: 'Information from other sources' },
        'We may also receive information about you from third parties, including PayPal (confirmation of payment and a transaction reference), our shipping carriers (delivery status) and advertising partners (aggregated information about the performance of our advertising).',
        { subheading: 'Information we collect automatically' },
        'When you visit our Site, we and our service providers obtain certain information by automated means, such as cookies, pixels, web server logs and similar technologies. This may include your IP address, device and browser type, operating system, language preference, referring URL, approximate location derived from your IP address, pages and products viewed, items added to your bag, checkouts started, purchases, and the dates and times of your visits.',
        'We do not intentionally collect sensitive personal information such as government identification numbers or precise geolocation. If you tell us about a reaction to a product, we use that information only to assist you and resolve the issue.',
      ],
    },
    {
      heading: 'How we use your personal information',
      blocks: [
        'We use personal information to:',
        {
          list: [
            'Process and fulfill your orders, including payment, shipping, returns and refunds, and send you transactional communications about your orders.',
            'Create and maintain your account and order history.',
            'Respond to your questions, requests and feedback, and provide customer support.',
            'Send marketing emails and text messages you have agreed to receive, including product launches, promotions and reminders about items left in your bag.',
            'Personalize your experience, including product recommendations based on your quiz answers and purchases.',
            'Conduct analytics and research to understand how our Site is used and to improve our products and services.',
            'Measure the effectiveness of our advertising and show our advertisements to people who have visited our Site.',
            'Detect, investigate and prevent fraud, security incidents and other unlawful activity, and enforce our Terms & Conditions.',
            'Comply with applicable law, including tax and accounting obligations, and establish, exercise or defend legal claims.',
          ],
        },
        'We may also use personal information for other purposes that we describe to you at the time of collection or with your consent.',
      ],
    },
    {
      heading: 'Cookies, analytics and interest-based advertising',
      id: 'choices',
      hasAdChoices: true,
      blocks: [
        { subheading: 'Essential cookies' },
        'Our Site stores certain information in your browser so that it functions properly, including your shopping bag, wishlist, language preference and, if you sign in, your session. PayPal may set its own cookies during payment to process your transaction and prevent fraud.',
        { subheading: 'Email and site activity' },
        'We use Klaviyo to send emails and text messages and to record activity on our Site, such as products viewed, items added to your bag and checkouts started. If you have provided your email address, this activity is associated with it so that we can send relevant messages, such as a reminder about items left in your bag.',
        { subheading: 'Interest-based advertising' },
        'We use advertising pixels and tags provided by Meta (Facebook and Instagram), TikTok and Google. These technologies collect information about your activity on our Site, including pages and products viewed, items added to your bag, checkouts started and purchases (order number, items and total), and share it with these companies so that we can measure our advertising and show our advertisements to people who have visited our Site. These companies may combine this information with other information they hold about you, in accordance with their own privacy policies.',
        { subheading: 'Your choices' },
        'You may opt out of these advertising technologies at any time using the setting below. We also honor the Global Privacy Control (GPC) signal from your browser as a request to opt out. You may also block or delete cookies through your browser settings; the Site will continue to work, although some features, such as remembering your bag, may not. Other than GPC, our Site does not respond to "Do Not Track" signals.',
      ],
    },
    {
      heading: 'How we share your personal information',
      blocks: [
        'We share personal information only as described in this Privacy Notice:',
        {
          list: [
            'Service providers: companies that perform services on our behalf and may use personal information only to provide those services, including PayPal (payment processing), Supabase (account and order records), Klaviyo (email, text messaging and site activity), Vercel (website hosting) and our shipping carriers.',
            'Advertising partners: Meta, TikTok and Google, through the advertising technologies described above, unless you opt out.',
            'Legal compliance and protection: when required by law or legal process, or when we believe disclosure is necessary to protect the rights, property or safety of SK Envision, our customers or others.',
            'Business transfers: in connection with a merger, acquisition, reorganization or sale of all or part of our business, in which case personal information may be transferred to the successor, subject to this Privacy Notice.',
          ],
        },
        'We do not sell personal information for money.',
      ],
    },
    {
      heading: 'How we protect your personal information',
      blocks: [
        'We maintain reasonable administrative, technical and physical safeguards designed to protect personal information against loss, theft and unauthorized access, use or disclosure. Our Site uses encrypted (HTTPS) connections, payments are handled by PayPal, and our order database accepts requests only from our own servers. However, no method of transmission over the internet or electronic storage is completely secure. Please use a unique, strong password for your account and contact us if you believe your account has been compromised.',
      ],
    },
    {
      heading: 'Data retention',
      blocks: [
        'We retain personal information for as long as necessary to fulfill the purposes described in this Privacy Notice, unless a longer retention period is required or permitted by law. Order and payment records are kept for as long as required by tax and accounting laws. Account information is kept until you ask us to delete your account. Marketing information is kept until you unsubscribe or ask us to delete it. Customer service records are kept for as long as needed to resolve your request and handle any related claims.',
      ],
    },
    {
      heading: 'Your choices',
      blocks: [
        { subheading: 'Marketing emails' },
        `You may unsubscribe from marketing emails at any time by clicking the unsubscribe link in any email or by contacting us at ${EMAIL}.`,
        { subheading: 'Text messages' },
        'If you sign up for text messages, you agree to receive recurring automated marketing text messages at the mobile number you provide. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for help. We do not share your mobile number or text messaging consent with third parties for their own marketing purposes.',
        'Opting out of marketing communications does not stop transactional messages about your orders, such as order confirmations and shipping updates.',
        { subheading: 'Access, correction and deletion' },
        `You may request access to, correction of or deletion of your personal information by emailing ${EMAIL} from the email address associated with your orders. Depending on where you live, you may have additional rights under applicable state privacy laws, which we honor as required. If we decline your request, you may appeal by replying to our decision with the subject line "Privacy Appeal", and we will respond within 45 days.`,
      ],
    },
    {
      heading: 'Information for California residents',
      blocks: [
        'This section applies to California residents and supplements the rest of this Privacy Notice. It is provided under the California Consumer Privacy Act, as amended by the California Privacy Rights Act (together, the "CCPA"), and serves as our notice at collection.',
        { subheading: 'Categories of personal information we collect' },
        'In the preceding 12 months, we have collected the following categories of personal information, from the sources described in "Information we collect" and for the purposes described in "How we use your personal information":',
        {
          list: [
            'Identifiers, such as name, email address, phone number, postal address, IP address and account login.',
            'Customer records, such as billing and shipping address and phone number.',
            'Commercial information, such as products purchased, considered or returned.',
            'Internet or other electronic network activity, such as pages and products viewed and interactions with our emails.',
            'Geolocation data, limited to approximate location derived from IP address.',
            'Inferences, such as product preferences derived from purchases and quiz answers.',
          ],
        },
        'We retain each category for the periods described in "Data retention". We do not collect sensitive personal information as defined by the CCPA, and we do not knowingly sell or share the personal information of consumers under 16 years of age.',
        { subheading: 'Sale and sharing of personal information' },
        'We do not sell personal information for money. However, our use of advertising technologies from Meta, TikTok and Google may be considered a "sale" or "sharing" of personal information for cross-context behavioral advertising under the CCPA. The categories involved are identifiers, internet or other electronic network activity and commercial information. You may opt out at any time using the "Your privacy choices" setting on this page, also linked at the bottom of every page of our Site, or by enabling Global Privacy Control in your browser.',
        { subheading: 'Your California privacy rights' },
        'Subject to certain exceptions, California residents have the right to:',
        {
          list: [
            'Know what personal information we have collected, used, disclosed, sold and shared about you, and obtain a copy of it.',
            'Request deletion of personal information we have collected from you, subject to legal exceptions, such as records we are required to keep for tax purposes.',
            'Correct inaccurate personal information.',
            'Opt out of the sale or sharing of personal information.',
            'Limit the use of sensitive personal information. Because we do not collect sensitive personal information, this right does not currently apply.',
            'Not receive discriminatory treatment for exercising any of these rights.',
          ],
        },
        { subheading: 'Submitting a request' },
        `To submit a request, email ${EMAIL} with the subject line "California Privacy Request" or call ${PHONE}. To protect your information, we verify requests by matching the information you provide with our records, typically by confirming the email address associated with your orders. We will respond within 45 days, or notify you if we need up to an additional 45 days. You may use an authorized agent to submit a request on your behalf; we will require written proof of the agent's authorization and may ask you to verify your identity directly with us.`,
        { subheading: 'Notice of financial incentive' },
        `We offer discounts, such as ${WELCOME.label.toLowerCase()}, to customers who sign up for our emails or text messages or who provide their email address when completing our hair quiz. In exchange, we collect your email address or mobile phone number and, where applicable, your quiz answers. Participation is voluntary, and you may withdraw at any time by unsubscribing or replying STOP; you keep any discount already redeemed. We estimate the value of your personal information to be approximately equal to the value of the discount offered, based on the expected purchases of subscribers and the cost of the offer.`,
        { subheading: 'Shine the Light' },
        `California Civil Code section 1798.83 permits California residents to request, once per year, information about the personal information we disclosed to third parties for their own direct marketing purposes. SK Envision does not disclose personal information to third parties for their own direct marketing purposes. You may submit a request to ${EMAIL}.`,
      ],
    },
    {
      heading: 'Children’s privacy',
      blocks: [
        'Our Site is intended for adults and is not directed to children under 16. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it.',
      ],
    },
    {
      heading: 'Where your information is processed',
      blocks: [
        'SK Envision is located in the United States, and the personal information we collect is stored and processed in the United States by us and our service providers.',
      ],
    },
    {
      heading: 'Communicating with us',
      blocks: [
        `If you have any questions about this Privacy Notice or our privacy practices, please contact us by email at ${EMAIL}, by phone at ${PHONE}, or by mail at SK Envision, Attn: Privacy, ${ADDRESS}.`,
      ],
    },
    {
      heading: 'Changes to this privacy notice',
      blocks: [
        'We may update this Privacy Notice from time to time. When we do, we will update the date at the top of this page. If we make material changes, we will notify you by email or by a notice on our Site before the changes take effect.',
      ],
    },
  ],
};

/* ------------------------------- terms -------------------------------- */

/** @type {Policy} */
const terms = {
  slug: 'terms',
  path: '/terms',
  title: 'Terms & conditions',
  label: 'Terms',
  description:
    'The Terms & Conditions governing use of the SK Envision website and purchases of SK Envision products, including orders, pricing, product use, liability, governing law and text message terms.',
  intro:
    'PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY, AS THEY AFFECT YOUR LEGAL RIGHTS AND OBLIGATIONS, INCLUDING LIMITATIONS OF LIABILITY AND THE LAW AND COURTS THAT GOVERN ANY DISPUTE.',
  summary: [],
  sections: [
    {
      heading: 'Overview',
      blocks: [
        'This website (the "Site") is operated by SK Envision ("SK Envision", "we", "us" or "our"). SK Envision offers this Site, including all information, tools and services available from it, to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.',
        'By visiting our Site and/or purchasing from us, you agree to be bound by these Terms & Conditions (the "Terms"), including the additional policies referenced here and available by hyperlink, including our Shipping Policy, Returns Policy and Privacy Notice. These Terms apply to all users of the Site, including browsers, customers and contributors of content. If you do not agree to these Terms, you may not access or use the Site.',
        'The headings in these Terms are for convenience only and do not limit or otherwise affect these Terms.',
      ],
    },
    {
      heading: 'Section 1 - Online store terms',
      blocks: [
        'By agreeing to these Terms, you represent that you are at least 18 years of age, or the age of majority in your state of residence. You may not use our products or the Site for any illegal or unauthorized purpose, and you may not violate any laws in your jurisdiction in your use of the Site. A breach of any of these Terms may result in the immediate termination of your use of the Site.',
      ],
    },
    {
      heading: 'Section 2 - General conditions',
      blocks: [
        'We reserve the right to refuse service to anyone, for any lawful reason, at any time. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Site, use of the Site or access to the Site without our express written permission.',
      ],
    },
    {
      heading: 'Section 3 - Accounts',
      blocks: [
        'You are responsible for maintaining the confidentiality of your account login details and for all activity under your account. Please notify us immediately if you believe your account has been used without your authorization. We may suspend or close accounts that violate these Terms. You may request that we delete your account at any time.',
      ],
    },
    {
      heading: 'Section 4 - Accuracy of information',
      blocks: [
        'We make every effort to ensure the information on this Site is accurate and complete. However, the material on this Site is provided for general information only. Occasionally the Site may contain typographical errors, inaccuracies or omissions relating to product descriptions, pricing, promotions, shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions and to change or update information at any time without prior notice.',
      ],
    },
    {
      heading: 'Section 5 - Products and safe use',
      blocks: [
        'SK Envision products are cosmetics intended for external use only. They are not intended to diagnose, treat, cure or prevent any disease. Individual results vary. Information on this Site is not medical advice.',
        'Before using any product, you agree to read the complete label, directions, warnings and ingredient list. We recommend a patch test before first use. For hair color products, perform the allergy test described in the product instructions before every use. Discontinue use if irritation occurs and consult a physician if it persists. Consult your physician before use if you are pregnant or nursing, have a skin or scalp condition or are under medical care. Keep products out of reach of children.',
        'We have made every effort to display the colors and images of our products accurately, but we cannot guarantee that your device will display them accurately. Packaging and formulations may change; the label on the product you receive governs.',
      ],
    },
    {
      heading: 'Section 6 - Orders, pricing and payment',
      blocks: [
        'Your order constitutes an offer to purchase. Our order confirmation email acknowledges that we have received your order; your order is accepted when it ships. We reserve the right to refuse, limit or cancel any order, including orders that exceed quantity limits, appear to be placed by resellers, contain pricing or description errors, or involve suspected fraud or misuse of a promotion. If we cancel an order after payment, we will issue a full refund.',
        'All prices are in US dollars and exclude shipping and applicable sales tax, which are shown at checkout before you complete your purchase. Prices and product availability are subject to change without notice, but changes do not affect orders that have already been paid for. If a product is listed at an incorrect price due to an error, we will contact you before shipping and give you the option to pay the correct price or cancel the order.',
        'Payment is processed by PayPal, using your PayPal account or a debit or credit card. Any PayPal Pay Later options are offered by PayPal under its own terms. Your payment is charged when you place your order. You agree to provide current, complete and accurate purchase information.',
      ],
    },
    {
      heading: 'Section 7 - Promotions and discount codes',
      blocks: [
        `Unless otherwise stated, discount codes are limited to one per order, cannot be combined with other offers, have no cash value, cannot be applied to previous orders and apply to merchandise only, excluding shipping and taxes. ${WELCOME.code} provides ${WELCOME.value}% off a customer's first order and may be used once per customer. Each promotion is subject to the dates and conditions stated with the offer. We reserve the right to modify or end any promotion at any time and to cancel orders that misuse a promotion.`,
      ],
    },
    {
      heading: 'Section 8 - Shipping, returns and risk of loss',
      blocks: [
        'Shipping and returns are governed by our Shipping Policy and Returns Policy, which are incorporated into these Terms. Title and risk of loss for products pass to you upon delivery by the carrier.',
      ],
    },
    {
      heading: 'Section 9 - Third-party services and links',
      blocks: [
        'The Site uses and links to services provided by third parties, such as PayPal and social media platforms. These services are governed by their own terms and privacy policies. We are not responsible for the content, accuracy or practices of third-party websites or services, and any use of them is at your own risk.',
      ],
    },
    {
      heading: 'Section 10 - Reviews, comments and other submissions',
      blocks: [
        'If you submit a review, photo, comment or other content ("Submissions"), you agree that it will be truthful, based on your own experience with the product, and will not contain unlawful, defamatory, obscene or otherwise objectionable material or infringe the rights of any third party. If you received a free product or any other benefit in connection with a Submission, you must clearly disclose it.',
        'By providing a Submission, you grant SK Envision a non-exclusive, royalty-free, perpetual license to use, reproduce, display and distribute it, together with your name or username, on our Site, in emails and on social media. We may, but are not obligated to, remove Submissions that violate these Terms. We do not edit reviews to change their meaning, and we publish both positive and negative reviews.',
      ],
    },
    {
      heading: 'Section 11 - Personal information',
      blocks: [
        'Our collection and use of personal information through the Site is governed by our Privacy Notice.',
      ],
    },
    {
      heading: 'Section 12 - Intellectual property',
      blocks: [
        'The SK Envision name, logo, product names, images, videos, text and other content on the Site are owned by SK Envision or its licensors and are protected by intellectual property laws. You may view and print pages for your personal, non-commercial use only. Any other use without our prior written permission is prohibited.',
      ],
    },
    {
      heading: 'Section 13 - Prohibited uses',
      blocks: [
        'In addition to other prohibitions in these Terms, you may not use the Site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal or state law or regulation; (d) to infringe our intellectual property rights or those of others; (e) to harass, abuse, defame or discriminate against any person; (f) to submit false or misleading information; (g) to upload or transmit viruses or other malicious code; (h) to collect or track the personal information of others; (i) to spam, phish, scrape, crawl or use automated means to access the Site; or (j) to interfere with or circumvent the security features of the Site.',
      ],
    },
    {
      heading: 'Section 14 - Disclaimer of warranties; limitation of liability',
      blocks: [
        'WE DO NOT GUARANTEE, REPRESENT OR WARRANT THAT YOUR USE OF THE SITE WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE. EXCEPT AS EXPRESSLY STATED BY US OR REQUIRED BY LAW, THE SITE AND ALL PRODUCTS AND SERVICES DELIVERED THROUGH IT ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY LAW.',
        'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SK ENVISION OR ITS OWNERS, EMPLOYEES, AGENTS, SUPPLIERS OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS OR LOSS OF DATA, ARISING FROM YOUR USE OF THE SITE OR ANY PRODUCTS PURCHASED THROUGH IT. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO AN ORDER SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THAT ORDER.',
        'SOME STATES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN WARRANTIES OR DAMAGES, SO SOME OF THE ABOVE MAY NOT APPLY TO YOU. NOTHING IN THESE TERMS LIMITS ANY RIGHTS YOU HAVE UNDER CONSUMER PROTECTION LAWS THAT CANNOT BE WAIVED.',
      ],
    },
    {
      heading: 'Section 15 - Indemnification',
      blocks: [
        'You agree to indemnify, defend and hold harmless SK Envision and its owners, employees, agents, suppliers and service providers from any claim or demand, including reasonable attorneys’ fees, made by any third party arising out of your breach of these Terms or your violation of any law or the rights of a third party.',
      ],
    },
    {
      heading: 'Section 16 - Governing law and disputes',
      blocks: [
        `These Terms are governed by the laws of the State of California, without regard to its conflict of law principles, and applicable federal law. If you have a concern, please contact us first at ${EMAIL} so that we can try to resolve it informally. Any dispute that cannot be resolved informally shall be brought exclusively in the state or federal courts located in Orange County, California, and you and SK Envision consent to the personal jurisdiction of those courts, except where applicable law gives you the right to bring a claim elsewhere. Either party may bring an eligible claim in small claims court.`,
      ],
    },
    {
      heading: 'Section 17 - Notice to California residents',
      blocks: [
        'Under California Civil Code section 1789.3, California users are entitled to the following consumer rights notice: the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs may be contacted in writing at 1625 North Market Blvd., Suite N 112, Sacramento, CA 95834, or by telephone at (800) 952-5210.',
      ],
    },
    {
      heading: 'Section 18 - Copyright infringement notice',
      blocks: [
        'We respect the intellectual property rights of others. If you believe that material on the Site infringes your copyright, please send a notice to SK Envision, Attn: Legal, at the address below or by email, including: (1) your physical or electronic signature; (2) a description of the copyrighted work; (3) information sufficient to locate the material on the Site; (4) your name, address, telephone number and email address; (5) a statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent or the law; and (6) a statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on its behalf.',
      ],
    },
    {
      heading: 'Section 19 - Severability and waiver',
      blocks: [
        'If any provision of these Terms is found to be unlawful, void or unenforceable, that provision shall be enforced to the fullest extent permitted by law and the unenforceable portion shall be severed, without affecting the validity of the remaining provisions. Our failure to exercise or enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.',
      ],
    },
    {
      heading: 'Section 20 - Termination',
      blocks: [
        'These Terms are effective unless and until terminated by you or us. You may terminate them at any time by ceasing to use the Site. We may terminate your access to the Site at any time if you fail to comply with these Terms. Obligations and liabilities incurred before termination survive termination.',
      ],
    },
    {
      heading: 'Section 21 - Entire agreement',
      blocks: [
        'These Terms, together with the policies posted on the Site, constitute the entire agreement between you and SK Envision regarding your use of the Site and supersede any prior agreements or communications.',
      ],
    },
    {
      heading: 'Section 22 - Changes to these terms',
      blocks: [
        'We may update these Terms at any time by posting the revised Terms on this page and updating the date at the top. The Terms in effect when you place an order govern that order. Your continued use of the Site after changes are posted constitutes acceptance of the revised Terms.',
      ],
    },
    {
      heading: 'Section 23 - Mobile messaging terms',
      blocks: [
        'By opting in to SK Envision text messages, you agree to receive recurring automated marketing and informational text messages from SK Envision at the mobile number you provide, which may include promotions and cart reminders. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to cancel at any time, or HELP for help. Wireless carriers are not liable for delayed or undelivered messages. Our Privacy Notice explains how we handle your information.',
      ],
    },
    {
      heading: 'Section 24 - Contact information',
      blocks: [
        `Questions about these Terms should be sent to SK Envision at ${EMAIL}, by phone at ${PHONE}, or by mail at ${ADDRESS}.`,
      ],
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
    'SK Envision’s website accessibility statement: how to get assistance, our goal and standard (WCAG 2.1 AA), the steps we are taking, known limitations and how to give feedback.',
  intro:
    'SK Envision is committed to providing a positive experience for all of our customers, including people with disabilities, and to equal access under the Americans with Disabilities Act and California’s Unruh Civil Rights Act.',
  summary: [],
  sections: [
    {
      heading: 'Accessibility assistance',
      blocks: [
        `If you have difficulty using or accessing any part of this website, please email us at ${EMAIL} or call ${PHONE}. We will work with you to provide the information, product or transaction you are looking for through a communication method that is accessible to you, at the same prices available on our website.`,
      ],
    },
    {
      heading: 'Our goal',
      blocks: [
        'Our goal is for every customer to be able to find information, browse products and complete a purchase on our website easily and independently, including customers who use screen readers, keyboard navigation, screen magnification, voice control or other assistive technologies.',
      ],
    },
    {
      heading: 'Our standard',
      blocks: [
        'We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, published by the World Wide Web Consortium (W3C).',
      ],
    },
    {
      heading: 'Actions',
      blocks: [
        'Steps we have taken to support accessibility include:',
        {
          list: [
            'Designing menus, product options and checkout steps to work with a keyboard, with a visible focus indicator.',
            'Providing text alternatives for images and accessible labels for buttons, links and form fields.',
            'Using clear headings and page landmarks to support navigation with assistive technology.',
            'Choosing color combinations with strong contrast, and reducing animation when your device is set to reduce motion.',
            'Providing form error messages that explain how to correct the error.',
          ],
        },
      ],
    },
    {
      heading: 'Known limitations',
      blocks: [
        'Some parts of our website may not yet be fully accessible:',
        {
          list: [
            'Some product photos show text printed on packaging that is not repeated word for word on the page. Product names, sizes and directions are always provided in text on the product page.',
            'Payment is completed in PayPal’s own window, which is governed by PayPal’s accessibility practices.',
          ],
        },
      ],
    },
    {
      heading: 'Ongoing effort',
      blocks: [
        'We view accessibility as an ongoing effort. We review new pages and features against WCAG 2.1 Level AA and address issues as we identify them or as customers report them.',
      ],
    },
    {
      heading: 'Feedback',
      blocks: [
        `We welcome your feedback and suggestions on how we can improve the accessibility of our website. Please contact us at ${EMAIL} or ${PHONE}, and include the page and the issue you encountered. We aim to respond within two business days.`,
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
