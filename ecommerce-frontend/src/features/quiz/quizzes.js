/**
 * The two quizzes, as data. Every label is a translation key under `quiz.*`.
 * Each step names the side image it shows, and an optional pro tip. Options
 * with an `image` render as round swatches; the rest as text tiles.
 *
 * `recommend` turns the answers into product ids, best match first; the
 * results page drops any id the catalog does not have.
 */

const PRICE_LIMITS = { under50: 5000, under100: 10000, any: Infinity };

/** Products by id, named so the rules below read as a routine. */
const P = {
  shampooConditioner: '2628',
  shampoo: '2621',
  conditioner: '26',
  colorShampoo: '1773',
  mask: '28',
  regrowth: '29',
  hairSet: '4824',
  skinSet: '5091',
  darkSpot: '1958',
  collagen: '1550',
  eyeLift: '2394',
  lash: '2547',
  footPeel: '27',
};

const unique = (ids) => [...new Set(ids)];

export const QUIZZES = {
  hair: {
    id: 'hair',
    title: 'quiz.hair.title',
    resultsTitle: 'quiz.hair.resultsTitle',
    steps: [
      {
        id: 'type',
        question: 'quiz.hair.type.question',
        image: 'routine-hair',
        options: [
          { value: 'straight', label: 'quiz.hair.type.straight', image: 'hair-straight' },
          { value: 'wavy', label: 'quiz.hair.type.wavy', image: 'hair-wavy' },
          { value: 'curly', label: 'quiz.hair.type.curly', image: 'hair-curly' },
          { value: 'coily', label: 'quiz.hair.type.coily', image: 'hair-coily' },
        ],
      },
      {
        id: 'texture',
        question: 'quiz.hair.texture.question',
        image: 'category-hair',
        tip: { title: 'quiz.hair.texture.tipTitle', body: 'quiz.hair.texture.tipBody' },
        options: [
          { value: 'fine', label: 'quiz.hair.texture.fine', lines: 1 },
          { value: 'medium', label: 'quiz.hair.texture.medium', lines: 2 },
          { value: 'coarse', label: 'quiz.hair.texture.coarse', lines: 3 },
        ],
      },
      {
        id: 'concern',
        question: 'quiz.hair.concern.question',
        image: 'journal-argan-routine',
        options: [
          { value: 'dry', label: 'quiz.hair.concern.dry' },
          { value: 'thinning', label: 'quiz.hair.concern.thinning' },
          { value: 'colour', label: 'quiz.hair.concern.colour' },
          { value: 'frizz', label: 'quiz.hair.concern.frizz' },
        ],
      },
      {
        id: 'styling',
        question: 'quiz.hair.styling.question',
        image: 'gift-bestsellers',
        tip: { title: 'quiz.hair.styling.tipTitle', body: 'quiz.hair.styling.tipBody' },
        options: [
          { value: 'airDry', label: 'quiz.hair.styling.airDry' },
          { value: 'someHeat', label: 'quiz.hair.styling.someHeat' },
          { value: 'protective', label: 'quiz.hair.styling.protective' },
          { value: 'dailyHeat', label: 'quiz.hair.styling.dailyHeat' },
        ],
      },
    ],
    recommend(answers) {
      const byConcern = {
        dry: [P.mask],
        thinning: [P.regrowth],
        colour: [P.colorShampoo],
        frizz: [P.mask],
      };
      const needsRepair =
        answers.styling === 'dailyHeat' ||
        answers.texture === 'coarse' ||
        answers.type === 'curly' ||
        answers.type === 'coily';
      return unique([
        P.shampooConditioner,
        ...(byConcern[answers.concern] ?? []),
        ...(needsRepair ? [P.mask] : [P.regrowth]),
      ]).slice(0, 3);
    },
  },

  gift: {
    id: 'gift',
    title: 'quiz.gift.title',
    resultsTitle: 'quiz.gift.resultsTitle',
    steps: [
      {
        id: 'who',
        question: 'quiz.gift.who.question',
        image: 'gift-flatlay',
        options: [
          { value: 'partner', label: 'quiz.gift.who.partner' },
          { value: 'parent', label: 'quiz.gift.who.parent' },
          { value: 'friend', label: 'quiz.gift.who.friend' },
          { value: 'self', label: 'quiz.gift.who.self' },
        ],
      },
      {
        id: 'loves',
        question: 'quiz.gift.loves.question',
        image: 'category-skin',
        options: [
          { value: 'hair', label: 'quiz.gift.loves.hair' },
          { value: 'skin', label: 'quiz.gift.loves.skin' },
          { value: 'eyes', label: 'quiz.gift.loves.eyes' },
          { value: 'pampering', label: 'quiz.gift.loves.pampering' },
        ],
      },
      {
        id: 'budget',
        question: 'quiz.gift.budget.question',
        image: 'category-sets',
        tip: { title: 'quiz.gift.budget.tipTitle', body: 'quiz.gift.budget.tipBody' },
        options: [
          { value: 'under50', label: 'quiz.gift.budget.under50' },
          { value: 'under100', label: 'quiz.gift.budget.under100' },
          { value: 'any', label: 'quiz.gift.budget.any' },
        ],
      },
    ],
    recommend(answers, products) {
      const byLove = {
        hair: [P.hairSet, P.shampooConditioner, P.mask, P.shampoo],
        skin: [P.skinSet, P.darkSpot, P.collagen],
        eyes: [P.lash, P.eyeLift, P.skinSet],
        pampering: [P.skinSet, P.hairSet, P.footPeel, P.mask],
      };
      const limit = PRICE_LIMITS[answers.budget] ?? Infinity;
      const price = new Map(products.map((product) => [product.id, product.price]));
      const candidates = byLove[answers.loves] ?? byLove.pampering;
      const affordable = candidates.filter((id) => (price.get(id) ?? Infinity) <= limit);
      // Nothing that loves list fits the budget: fall back to the cheapest of them.
      const picks = affordable.length
        ? affordable
        : [...candidates].sort((a, b) => (price.get(a) ?? 0) - (price.get(b) ?? 0));
      return picks.slice(0, 3);
    },
  },
};

export const isQuiz = (quizId) => Object.hasOwn(QUIZZES, quizId);
