import { internalMutation } from "./_generated/server";

/**
 * Seeds the public duas wall with 15 realistic supplications.
 * Run with: npx convex run seed:seedDuas
 */
export const seedDuas = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const seedData = [
      {
        text: "Allahumma inni as'aluka 'ilman nafi'an wa rizqan tayyiban wa 'amalan mutaqabbalan.",
        name: "Ahmad",
        createdAt: now - 3 * day - 2 * 3600000,
        ameen: 4,
      },
      {
        text: "May Allah grant my parents good health and long life. Ya Rabb, protect them and keep them close to You.",
        name: "Fatima",
        createdAt: now - 3 * day + 5 * 3600000,
        ameen: 12,
      },
      {
        text: "Bismillahilladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
        name: undefined,
        createdAt: now - 2 * day - 8 * 3600000,
        ameen: 2,
      },
      {
        text: "Please make the exam easy for my brother. He's been studying so hard. Jazakallah khair to everyone who says Ameen.",
        name: "Sara",
        createdAt: now - 2 * day,
        ameen: 7,
      },
      {
        text: "اللهم اغفر لي ولوالدي وارحمهما كما ربياني صغيراً",
        name: "Omar",
        createdAt: now - 2 * day + 4 * 3600000,
        ameen: 9,
      },
      {
        text: "Dua for my grandmother's surgery tomorrow. May Allah guide the doctors' hands and grant her a speedy recovery.",
        name: undefined,
        createdAt: now - 1 * day - 6 * 3600000,
        ameen: 15,
      },
      {
        text: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
        name: "Anonymous",
        createdAt: now - 1 * day - 2 * 3600000,
        ameen: 3,
      },
      {
        text: "For all those struggling with anxiety and depression. May Allah ease their hearts and grant them peace.",
        name: "Layla",
        createdAt: now - 1 * day + 3 * 3600000,
        ameen: 11,
      },
      {
        text: "Allahumma inni zalamtu nafsi zulman kathiran wa la yaghfirudh-dhunuba illa Anta, faghfir li maghfiratan min 'indika warhamni.",
        name: undefined,
        createdAt: now - 12 * 3600000,
        ameen: 0,
      },
      {
        text: "May Allah bless our new home and fill it with barakah, love, and remembrance of Him.",
        name: "Hassan",
        createdAt: now - 8 * 3600000,
        ameen: 5,
      },
      {
        text: "Dua for Palestine and all oppressed Muslims worldwide. Ya Rabb, grant them victory and relief from hardship.",
        name: undefined,
        createdAt: now - 5 * 3600000,
        ameen: 23,
      },
      {
        text: "Allahumma la sahla illa ma ja'altahu sahla, wa anta taj'alul-hazna idha shi'ta sahla.",
        name: "Yusuf",
        createdAt: now - 3 * 3600000,
        ameen: 1,
      },
      {
        text: "For my job interview next week. May Allah open the right doors and make the path clear.",
        name: "Aisha",
        createdAt: now - 90 * 60000,
        ameen: 6,
      },
      {
        text: "Subhanallahi wa bihamdihi, subhanallahil-'Azim. May we never forget to remember Him.",
        name: undefined,
        createdAt: now - 45 * 60000,
        ameen: 0,
      },
      {
        text: "Dua for unity among the ummah. May we overcome our differences and stand together in love and brotherhood.",
        name: "Ibrahim",
        createdAt: now - 15 * 60000,
        ameen: 8,
      },
    ];

    for (const dua of seedData) {
      await ctx.db.insert("duas", {
        text: dua.text,
        name: dua.name,
        groupId: undefined,
        ipHash: undefined,
        authorId: undefined,
        createdAt: dua.createdAt,
        ameen: dua.ameen,
      });
    }

    return { inserted: seedData.length };
  },
});
