import { internalMutation } from "./_generated/server";

/**
 * Seeds the public duas wall with real duas from Quran and Sunnah.
 * Run with: npx convex run seed:seedDuas
 * Use --prod flag for production: npx convex run seed:seedDuas --prod
 */
export const seedDuas = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const seedData = [
      {
        text: "Ya Allah, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
        createdAt: now - 3 * day - 2 * 3600000,
        ameen: 4,
      },
      {
        text: "Ya Allah, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself.",
        createdAt: now - 3 * day + 5 * 3600000,
        ameen: 12,
      },
      {
        text: "Ya Allah, forgive us our sins, remove from us our misdeeds, and let us die with the righteous.",
        createdAt: now - 2 * day - 8 * 3600000,
        ameen: 2,
      },
      {
        text: "Ya Allah, accept this from us. You are the All-Hearing, the All-Knowing.",
        createdAt: now - 2 * day,
        ameen: 7,
      },
      {
        text: "Ya Allah, grant us from our spouses and children comfort to our eyes and make us leaders for the righteous.",
        createdAt: now - 2 * day + 4 * 3600000,
        ameen: 9,
      },
      {
        text: "Ya Allah, forgive me, my parents, and the believers on the Day the account is established.",
        createdAt: now - 1 * day - 6 * 3600000,
        ameen: 15,
      },
      {
        text: "Ya Allah, pour upon us patience and let us die as Muslims.",
        createdAt: now - 1 * day - 2 * 3600000,
        ameen: 3,
      },
      {
        text: "Ya Allah, forgive us and our brothers who came before us in faith, and place no hatred in our hearts toward the believers.",
        createdAt: now - 1 * day + 3 * 3600000,
        ameen: 11,
      },
      {
        text: "Ya Allah, grant us mercy from Yourself and guide us rightly in our affairs.",
        createdAt: now - 12 * 3600000,
        ameen: 0,
      },
      {
        text: "Ya Allah, do not burden us with more than we can bear. Forgive us and have mercy on us.",
        createdAt: now - 8 * 3600000,
        ameen: 5,
      },
      {
        text: "Ya Allah, help me remember You, thank You, and worship You well.",
        createdAt: now - 5 * 3600000,
        ameen: 23,
      },
      {
        text: "Ya Allah, forgive me, have mercy on me, guide me, and provide for me.",
        createdAt: now - 3 * 3600000,
        ameen: 1,
      },
      {
        text: "Ya Allah, give me beneficial knowledge, good provision, and accepted deeds.",
        createdAt: now - 90 * 60000,
        ameen: 6,
      },
      {
        text: "Ya Allah, purify my soul and make it righteous.",
        createdAt: now - 45 * 60000,
        ameen: 0,
      },
      {
        text: "Ya Allah, grant me Paradise and protect me from the Fire.",
        createdAt: now - 15 * 60000,
        ameen: 8,
      },
      {
        text: "Ya Allah, keep my heart firm upon Your religion.",
        createdAt: now - 3 * day - 2 * 3600000,
        ameen: 4,
      },
      {
        text: "Ya Allah, forgive us and accept our repentance.",
        createdAt: now - 3 * day + 5 * 3600000,
        ameen: 12,
      },
      {
        text: "Ya Allah, forgive my parents, have mercy on them, and reward them for everything they have done for me.",
        createdAt: now - 2 * day - 8 * 3600000,
        ameen: 2,
      },
      {
        text: "Ya Allah, bless my parents with health, peace, and a long life in obedience to You.",
        createdAt: now - 2 * day,
        ameen: 7,
      },
      {
        text: "Ya Allah, protect my family, keep them safe, and guide them to what is right.",
        createdAt: now - 2 * day + 4 * 3600000,
        ameen: 9,
      },
      {
        text: "Ya Allah, place love, patience, and mercy between the hearts of my family.",
        createdAt: now - 1 * day - 6 * 3600000,
        ameen: 15,
      },
      {
        text: "Ya Allah, make our home a place of faith, peace, and remembrance of You.",
        createdAt: now - 1 * day - 2 * 3600000,
        ameen: 3,
      },
      {
        text: "Ya Allah, forgive the believing men and women, the living and the dead.",
        createdAt: now - 1 * day + 3 * 3600000,
        ameen: 11,
      },
      {
        text: "Ya Allah, unite the hearts of the Muslims and guide the ummah to what is best.",
        createdAt: now - 12 * 3600000,
        ameen: 0,
      },
      {
        text: "Ya Allah, grant patience and strength to the Muslim ummah in times of hardship.",
        createdAt: now - 8 * 3600000,
        ameen: 5,
      },
      {
        text: "Ya Allah, help the oppressed Muslims wherever they are.",
        createdAt: now - 5 * 3600000,
        ameen: 23,
      },
      {
        text: "Ya Allah, feed those who are hungry and provide for those in need.",
        createdAt: now - 3 * 3600000,
        ameen: 1,
      },
      {
        text: "Ya Allah, heal those who are sick and ease the pain of those who are suffering.",
        createdAt: now - 90 * 60000,
        ameen: 6,
      },
      {
        text: "Ya Allah, grant mercy to those who have passed away and patience to the families they left behind.",
        createdAt: now - 45 * 60000,
        ameen: 0,
      },
      {
        text: "Ya Allah, protect the people of Palestine and grant them safety and relief.",
        createdAt: now - 15 * 60000,
        ameen: 8,
      },
      {
        text: "Ya Allah, help the Muslims in Gaza and grant patience to the grieving families.",
        createdAt: now - 3 * day - 2 * 3600000,
        ameen: 4,
      },
      {
        text: "Ya Allah, ease the hardship of the Muslims in Sudan and bring peace to their land.",
        createdAt: now - 3 * day + 5 * 3600000,
        ameen: 12,
      },
      {
        text: "Ya Allah, protect the Muslims of Syria and bring relief to those who are displaced.",
        createdAt: now - 2 * day - 8 * 3600000,
        ameen: 2,
      },
      {
        text: "Ya Allah, help the Muslims of Yemen and grant them relief from hunger and hardship.",
        createdAt: now - 2 * day,
        ameen: 7,
      },
      {
        text: "Ya Allah, protect the Rohingya Muslims and grant them safety and justice.",
        createdAt: now - 2 * day + 4 * 3600000,
        ameen: 9,
      },
      {
        text: "Ya Allah, bring peace and safety to the Muslims of Kashmir.",
        createdAt: now - 1 * day - 6 * 3600000,
        ameen: 15,
      },
      {
        text: "Ya Allah, protect the Muslims in Afghanistan and grant them stability and security.",
        createdAt: now - 1 * day - 2 * 3600000,
        ameen: 3,
      },
      {
        text: "Ya Allah, help the Muslims in Xinjiang and grant freedom to those who are oppressed.",
        createdAt: now - 1 * day + 3 * 3600000,
        ameen: 11,
      },
      {
        text: "Ya Allah, protect the Muslims in Somalia and grant them safety from hardship.",
        createdAt: now - 12 * 3600000,
        ameen: 0,
      },
      {
        text: "Ya Allah, bring relief and peace to the Muslims in Lebanon.",
        createdAt: now - 8 * 3600000,
        ameen: 5,
      },
      {
        text: "Ya Allah, protect the Muslims who are refugees and displaced around the world.",
        createdAt: now - 5 * 3600000,
        ameen: 23,
      },
      {
        text: "Ya Allah, help the prisoners who are unjustly imprisoned and grant them freedom and patience.",
        createdAt: now - 3 * 3600000,
        ameen: 1,
      },
      {
        text: "Ya Allah, grant patience and strength to every Muslim family going through hardship and loss.",
        createdAt: now - 90 * 60000,
        ameen: 6,
      },
      {
        text: "Ya Allah, bring unity, mercy, and strength to the entire Muslim ummah.",
        createdAt: now - 45 * 60000,
        ameen: 0,
      },
    ];

    for (const dua of seedData) {
      await ctx.db.insert("duas", {
        text: dua.text,
        name: undefined,
        isSeedDua: true,
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
