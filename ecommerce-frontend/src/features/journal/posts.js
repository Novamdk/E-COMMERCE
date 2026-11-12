/**
 * Journal posts, written in-house. Each post carries its copy per language;
 * a language missing from a post falls back to English. `products` are
 * catalog ids the post links to at the end, in order.
 *
 * @typedef {{title: string, excerpt: string, sections: {heading: string, body: string}[]}} PostCopy
 * @typedef {{slug: string, image: string, date: string, readMinutes: number,
 *   products: string[], copy: Record<string, PostCopy>}} Post
 */

/** @type {Post[]} */
export const POSTS = [
  {
    slug: 'holiday-gift-guide',
    image: 'journal-gift-guide',
    date: '2026-11-07',
    readMinutes: 4,
    products: ['5091', '2547', '4824'],
    copy: {
      en: {
        title: 'The SK Envision holiday gift guide',
        excerpt:
          'Five gifts for everyone on your list, from the skin-care devotee to the friend who has everything.',
        sections: [
          {
            heading: 'For the skin-care devotee',
            body: 'The Dark Spot Beauty Package brings our Dark Spot Collagen Cream together with its routine partners in one box. It is our bestseller for a reason, and it arrives ready to give.',
          },
          {
            heading: 'For the one who loves a lash',
            body: 'The Collagen Lash & Brow Serum is a small gift with a visible pay-off: one stroke along the lash line each night, and lashes and brows that look fuller and longer.',
          },
          {
            heading: 'For great hair days, every day',
            body: 'The Hair Care Package Deal is a complete three-step routine built around argan oil: shampoo, conditioner and the Protein Repair Hair Mask for a weekly reset.',
          },
          {
            heading: 'Wrap it in gold',
            body: 'Every order ships in our signature packaging. Holiday sets are a limited-time edition, so order early if you have a date in mind.',
          },
        ],
      },
      fr: {
        title: 'Le guide cadeaux des fêtes SK Envision',
        excerpt:
          'Cinq idées pour toute votre liste, de la passionnée de soins au proche qui a déjà tout.',
        sections: [
          {
            heading: 'Pour la passionnée de soins',
            body: 'Le Dark Spot Beauty Package réunit notre Crème collagène anti-taches et ses alliés de routine dans un seul coffret. Notre best-seller, prêt à offrir.',
          },
          {
            heading: 'Pour les amoureuses des cils',
            body: 'Le Sérum cils et sourcils au collagène est un petit cadeau aux résultats visibles : un trait chaque soir, et des cils et sourcils visiblement plus fournis et plus longs.',
          },
          {
            heading: 'Pour de beaux cheveux, chaque jour',
            body: 'Le Hair Care Package Deal est une routine complète en trois étapes à l’huile d’argan : shampooing, après-shampooing et le Masque réparateur aux protéines.',
          },
          {
            heading: 'Emballé d’or',
            body: 'Chaque commande est expédiée dans notre emballage signature. Les coffrets des fêtes sont en édition limitée : commandez tôt.',
          },
        ],
      },
      es: {
        title: 'La guía de regalos navideños de SK Envision',
        excerpt:
          'Cinco regalos para toda tu lista, desde la fan del cuidado de la piel hasta quien ya lo tiene todo.',
        sections: [
          {
            heading: 'Para la fan del cuidado de la piel',
            body: 'El Dark Spot Beauty Package reúne nuestra Crema de colágeno antimanchas y sus aliados de rutina en una sola caja. Nuestro más vendido, listo para regalar.',
          },
          {
            heading: 'Para quien ama sus pestañas',
            body: 'El Sérum de pestañas y cejas con colágeno es un regalo pequeño con resultados visibles: un trazo cada noche y pestañas y cejas de aspecto más poblado y largo.',
          },
          {
            heading: 'Para un pelo increíble cada día',
            body: 'El Hair Care Package Deal es una rutina completa de tres pasos con aceite de argán: champú, acondicionador y la Mascarilla reparadora de proteínas.',
          },
          {
            heading: 'Envuelto en oro',
            body: 'Cada pedido se envía en nuestro empaque exclusivo. Los sets navideños son de edición limitada: pide con tiempo.',
          },
        ],
      },
      it: {
        title: 'La guida ai regali di Natale SK Envision',
        excerpt:
          'Cinque regali per tutta la tua lista, dall’appassionata di skincare a chi ha già tutto.',
        sections: [
          {
            heading: 'Per l’appassionata di skincare',
            body: 'Il Dark Spot Beauty Package riunisce la nostra Crema al collagene anti-macchie e i suoi alleati in un’unica confezione. Il nostro best seller, pronto da regalare.',
          },
          {
            heading: 'Per chi ama le ciglia',
            body: 'Il Siero ciglia e sopracciglia al collagene è un piccolo regalo dai risultati visibili: una passata ogni sera e ciglia e sopracciglia dall’aspetto più folto e lungo.',
          },
          {
            heading: 'Per capelli splendidi ogni giorno',
            body: 'L’Hair Care Package Deal è una routine completa in tre passaggi all’olio di argan: shampoo, balsamo e la Maschera riparatrice alle proteine.',
          },
          {
            heading: 'Avvolto nell’oro',
            body: 'Ogni ordine viaggia nella nostra confezione firmata. I set natalizi sono in edizione limitata: ordina in anticipo.',
          },
        ],
      },
      vi: {
        title: 'Gợi ý quà lễ hội từ SK Envision',
        excerpt:
          'Năm món quà cho mọi người trong danh sách, từ người mê chăm sóc da đến người đã có tất cả.',
        sections: [
          {
            heading: 'Cho người mê chăm sóc da',
            body: 'Bộ làm đẹp trị đốm nâu gồm Kem collagen trị đốm nâu và các sản phẩm đi kèm trong một hộp. Đây là sản phẩm bán chạy nhất của chúng tôi và đã sẵn sàng để tặng.',
          },
          {
            heading: 'Cho người yêu hàng mi',
            body: 'Serum dưỡng mi và lông mày collagen là món quà nhỏ với hiệu quả thấy rõ: mỗi tối một đường dọc chân mi, mi và lông mày trông dày và dài hơn.',
          },
          {
            heading: 'Cho mái tóc đẹp mỗi ngày',
            body: 'Bộ chăm sóc tóc ưu đãi là quy trình ba bước với dầu argan: dầu gội, dầu xả và Mặt nạ phục hồi tóc protein để phục hồi mỗi tuần.',
          },
          {
            heading: 'Gói trong sắc vàng',
            body: 'Mọi đơn hàng đều được giao trong bao bì đặc trưng của chúng tôi. Bộ quà lễ hội là phiên bản giới hạn, hãy đặt sớm nếu bạn cần đúng ngày.',
          },
        ],
      },
    },
  },
  {
    slug: 'argan-oil-hair-routine',
    image: 'journal-argan-routine',
    date: '2026-10-28',
    readMinutes: 3,
    products: ['2628', '28', '29'],
    copy: {
      en: {
        title: 'Your three-step argan oil hair routine',
        excerpt:
          'How to build a wash day around argan oil for softer, shinier hair, whatever your hair type.',
        sections: [
          {
            heading: 'Step 1: Cleanse',
            body: 'Massage the Argan Oil Shampoo into wet roots and let the lather run through the lengths. It cleans without stripping, so hair stays soft rather than squeaky.',
          },
          {
            heading: 'Step 2: Condition',
            body: 'Work the Argan Oil Conditioner from mid-lengths to ends, comb it through with your fingers, and rinse after a minute or two to detangle and add shine.',
          },
          {
            heading: 'Step 3: Repair, once a week',
            body: 'Swap the conditioner for the Protein Repair Hair Mask once a week. Leave it on for five to ten minutes. Dry, coloured or heat-styled hair will feel the difference.',
          },
          {
            heading: 'Bonus: care for the roots',
            body: 'For a nourished scalp and fuller-looking hair, finish with a few drops of the Organic Scalp & Hair Serum on a clean scalp, massaged in with your fingertips. It conditions; it is not a treatment for hair loss.',
          },
        ],
      },
      fr: {
        title: 'Votre routine capillaire à l’huile d’argan en trois étapes',
        excerpt:
          'Construire un jour de lavage autour de l’huile d’argan pour des cheveux plus doux et brillants.',
        sections: [
          {
            heading: 'Étape 1 : laver',
            body: 'Massez le Shampooing à l’huile d’argan sur racines mouillées et laissez la mousse glisser sur les longueurs. Il nettoie sans décaper.',
          },
          {
            heading: 'Étape 2 : démêler',
            body: 'Appliquez l’Après-shampooing des longueurs aux pointes, démêlez avec les doigts et rincez après une à deux minutes.',
          },
          {
            heading: 'Étape 3 : réparer, une fois par semaine',
            body: 'Remplacez l’après-shampooing par le Masque réparateur aux protéines une fois par semaine, cinq à dix minutes de pose.',
          },
          {
            heading: 'Bonus : soigner les racines',
            body: 'Pour un cuir chevelu nourri et des cheveux visiblement plus denses, terminez par quelques gouttes de Sérum bio cuir chevelu et cheveux massées sur le cuir chevelu propre. C’est un soin, pas un traitement contre la chute des cheveux.',
          },
        ],
      },
      es: {
        title: 'Tu rutina capilar de tres pasos con aceite de argán',
        excerpt:
          'Cómo organizar el día de lavado en torno al aceite de argán para un pelo más suave y brillante.',
        sections: [
          {
            heading: 'Paso 1: limpiar',
            body: 'Masajea el Champú de aceite de argán en las raíces húmedas y deja que la espuma recorra el largo. Limpia sin resecar.',
          },
          {
            heading: 'Paso 2: acondicionar',
            body: 'Aplica el Acondicionador de medios a puntas, desenreda con los dedos y aclara tras uno o dos minutos.',
          },
          {
            heading: 'Paso 3: reparar, una vez por semana',
            body: 'Cambia el acondicionador por la Mascarilla reparadora de proteínas una vez por semana y déjala actuar de cinco a diez minutos.',
          },
          {
            heading: 'Extra: cuida las raíces',
            body: 'Para un cuero cabelludo nutrido y un cabello de aspecto más denso, termina con unas gotas del Sérum orgánico para cuero cabelludo y cabello sobre el cuero cabelludo limpio. Es un cuidado, no un tratamiento para la caída del cabello.',
          },
        ],
      },
      it: {
        title: 'La tua routine capelli all’olio di argan in tre passaggi',
        excerpt:
          'Come organizzare il lavaggio attorno all’olio di argan per capelli più morbidi e luminosi.',
        sections: [
          {
            heading: 'Passaggio 1: detergere',
            body: 'Massaggia lo Shampoo all’olio di argan sulle radici bagnate e lascia scorrere la schiuma sulle lunghezze. Deterge senza seccare.',
          },
          {
            heading: 'Passaggio 2: condizionare',
            body: 'Applica il Balsamo dalle lunghezze alle punte, districa con le dita e risciacqua dopo uno o due minuti.',
          },
          {
            heading: 'Passaggio 3: riparare, una volta a settimana',
            body: 'Sostituisci il balsamo con la Maschera riparatrice alle proteine una volta a settimana, in posa da cinque a dieci minuti.',
          },
          {
            heading: 'Extra: cura delle radici',
            body: 'Per un cuoio capelluto nutrito e capelli dall’aspetto più folto, concludi con qualche goccia di Siero biologico per cuoio capelluto e capelli massaggiato sul cuoio capelluto pulito. È un trattamento cosmetico, non una cura per la caduta dei capelli.',
          },
        ],
      },
      vi: {
        title: 'Quy trình chăm sóc tóc 3 bước với dầu argan',
        excerpt:
          'Cách xây dựng ngày gội đầu quanh dầu argan cho mái tóc mềm và bóng hơn, dù tóc bạn thuộc loại nào.',
        sections: [
          {
            heading: 'Bước 1: Làm sạch',
            body: 'Massage Dầu gội Argan Oil lên chân tóc ướt và để bọt chảy dọc thân tóc. Làm sạch mà không làm khô, nên tóc vẫn mềm.',
          },
          {
            heading: 'Bước 2: Dưỡng',
            body: 'Thoa Dầu xả Argan Oil từ thân đến ngọn, gỡ rối bằng ngón tay và xả sau một đến hai phút để tóc suôn và bóng.',
          },
          {
            heading: 'Bước 3: Phục hồi, mỗi tuần một lần',
            body: 'Mỗi tuần một lần, thay dầu xả bằng Mặt nạ phục hồi tóc protein và ủ năm đến mười phút. Tóc khô, nhuộm hoặc hay dùng nhiệt sẽ thấy khác biệt.',
          },
          {
            heading: 'Thêm: chăm sóc chân tóc',
            body: 'Để da đầu được nuôi dưỡng và tóc trông dày hơn, kết thúc bằng vài giọt Serum hữu cơ dưỡng da đầu và tóc trên da đầu sạch và massage bằng đầu ngón tay. Đây là sản phẩm dưỡng, không phải thuốc trị rụng tóc.',
          },
        ],
      },
    },
  },
];

/**
 * @param {Post} post
 * @param {string} language
 * @returns {Post & PostCopy}
 */
export function localizePost(post, language) {
  return { ...post, ...(post.copy[language] ?? post.copy.en) };
}

/** @param {string} slug @returns {Post|undefined} */
export const findPost = (slug) => POSTS.find((post) => post.slug === slug);
