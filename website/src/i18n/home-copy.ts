/**
 * Copy for the redesigned home page (#396), in all four languages.
 *
 * Written to the hub's VOICE.md and Wean's overlay: calm, first person where
 * the maker speaks, no em-dashes, no bullet lists, no war metaphors, no
 * streaks or "days clean", no medical claims. Prices are never written here:
 * the store fragment's facts line carries them, from the design system's
 * registry. The App Privacy label is quoted exactly as the App Store shows it
 * in each language (read from the live listings on 2026-10-12).
 *
 * Owner-approved, kept word for word: the English headline, the English line
 * under it and the English maker note. The Danish maker note needs the
 * owner's approval before it ships.
 */
import type { Staircase } from '../lib/staircase';
import type { Locale } from './translations';

export interface HomeCopy {
  hero: {
    headline: string;
    lede: string;
    /** Describes the Today loop for screen readers; the video itself is muted. */
    loopLabel: string;
  };
  /** Three calm statements, one drawing each. */
  statements: { title: string; text: string }[];
  /** The phone that stays: Today, Progress, then the craving tools. */
  tour: { title: string; text: string; screenLabel: string }[];
  staircase: {
    title: string;
    intro: string;
    exampleLabel: string;
    summary: (s: Staircase) => string;
    paceNote: string;
    /** The one honest line, in place of a source. No health claims. */
    honest: string;
    axisPerDay: string;
    axisWeek: string;
    tableCaption: string;
    tableWeeks: string;
    tablePerDay: string;
    /** Weeks count from 0 in the app; people count from 1. */
    weeks: (fromWeek: number, toWeek: number, isLast: boolean) => string;
    perDay: (n: number) => string;
  };
  guides: { title: string; cards: { title: string; text: string; href: string }[] };
  assurances: {
    logs: { title: string; text: string };
    paid: { title: string; text: string };
    /** The App Store's own wording for Wean's label, in this language. */
    label: { heading: string; type: string; explanation: string; category: string; note: string };
  };
  maker: { note: string; signature: string };
  faq: { title: string; items: { question: string; answer: string }[] };
  fineprint: { illustrations: string };
}

const oneADayWeeks = (s: Staircase) => {
  const run = s.runs.find((r) => r.perDay === 1);
  return run ? run.toWeek - run.fromWeek + 1 : 0;
};

export const HOME_COPY: Record<Locale, HomeCopy> = {
  en: {
    hero: {
      headline: 'A gentler way to quit nicotine.',
      lede: 'Cut down on snus and nicotine pouches a little at a time, at a pace you choose. Everything stays on your iPhone, and a day over the limit is met with calm.',
      loopLabel:
        "Wean's Today screen. One tap on Used a pouch, the count goes up, and the day's allowance stays in view.",
    },
    statements: [
      {
        title: 'Less, a little at a time.',
        text: 'Your daily allowance steps down a little each week, so less never arrives all at once.',
      },
      {
        title: 'A day over is met with calm.',
        text: 'Like a wave that reaches a little further up the stones while the tide still goes out. The day is logged like any other, and there is nothing to make up for tomorrow.',
      },
      {
        title: 'Your pace, your plan.',
        text: 'You choose how fast the allowance comes down, from 3% to 15% a week, and you can change it whenever you like without losing what you have logged.',
      },
    ],
    tour: [
      {
        title: 'Today',
        text: "One tap on Used a pouch logs a pouch, and Resisted craving logs a craving you let pass. The day's allowance shows in whole pouches, and a tap made by mistake can be undone for ten seconds.",
        screenLabel:
          "Wean's Today screen with Used a pouch, Resisted craving and the day's allowance.",
      },
      {
        title: 'Progress',
        text: 'Your weeks as bars, the pouches you have avoided against where you started and, if you add what a can costs, the money saved. Once you have logged enough, Patterns shows the times of day and the triggers that come up most.',
        screenLabel:
          "Wean's Progress screen with the week's bars, pouches avoided and money saved.",
      },
      {
        title: 'When a craving comes',
        text: 'A guided breathing exercise with a few rhythms to choose from, or the urge-surfing timer, which walks you through five minutes as a craving rises and passes.',
        screenLabel: "Wean's Tools screen with the breathing exercise and urge surfing.",
      },
    ],
    staircase: {
      title: 'How the plan works',
      intro:
        'Tell Wean how many pouches you use on a normal day and pick a pace. Each week the allowance comes down by that share, and the app counts it in whole pouches.',
      exampleLabel: 'Example: 10 a day at 10% a week',
      summary: (s) =>
        `From ${s.baseline} a day, the allowance reaches zero after ${s.weeksToZero} weeks. The steps are big at first and small later, with ${oneADayWeeks(s)} weeks at one a day before the end.`,
      paceNote: 'Your own pace can be anywhere from 3% to 15% a week.',
      honest:
        'Wean is made for people who would rather cut down than stop from one day to the next.',
      axisPerDay: 'Pouches a day',
      axisWeek: 'Week',
      tableCaption: 'The example, week by week',
      tableWeeks: 'Weeks',
      tablePerDay: 'Allowance',
      weeks: (from, to, isLast) =>
        isLast
          ? `From week ${from + 1}`
          : from === to
            ? `Week ${from + 1}`
            : `Weeks ${from + 1} to ${to + 1}`,
      perDay: (n) => (n === 0 ? 'None' : n === 1 ? '1 a day' : `${n} a day`),
    },
    guides: {
      title: 'Guides',
      cards: [
        {
          title: 'Cutting down on snus',
          text: 'A practical guide to lowering your daily use a step at a time.',
          href: '/how-to-reduce-snus/',
        },
        {
          title: 'Gradual or cold turkey?',
          text: 'What each way asks of you, side by side.',
          href: '/gradual-reduction-vs-cold-turkey/',
        },
        {
          title: 'When a craving comes',
          text: 'Six techniques for the moment a craving arrives.',
          href: '/how-to-handle-nicotine-cravings/',
        },
      ],
    },
    assurances: {
      logs: {
        title: 'Your logs stay on your iPhone',
        text: 'There is no account to make and nothing to sync. Your pouches, your plan and your settings live on the phone, and you can export your log yourself as a file.',
      },
      paid: {
        title: 'Paid for once',
        text: 'One purchase and every feature. No subscription, no in-app purchases and no ads.',
      },
      label: {
        heading: 'App Privacy',
        type: 'Data Not Linked to You',
        explanation: 'The following data may be collected but it is not linked to your identity:',
        category: 'Diagnostics',
        note: 'In Wean that is anonymous crash and performance data, which never includes your logs or your plan.',
      },
    },
    maker: {
      note: "I built Wean because I wanted to cut down myself, and stopping from one day to the next wasn't the way for me. What worked was a little less each week, with nobody keeping score. Wean does that on your iPhone and nothing more. It sets a plan that steps down, logs a pouch in one tap, and stays calm on the days you go over.",
      signature: 'Jarl',
    },
    faq: {
      title: 'Questions',
      items: [
        {
          question: 'How does Wean help me cut down?',
          answer:
            'You tell it how many pouches you use on a normal day and pick a pace from 3% to 15% a week. Each week the daily allowance comes down by that share, shown in whole pouches, so you cut down a step at a time instead of stopping all at once.',
        },
        {
          question: 'Does it work for nicotine pouches as well as snus?',
          answer:
            'Yes. Wean counts pouches, so it works the same way for snus and for nicotine pouches.',
        },
        {
          question: 'What happens on a day I go over?',
          answer:
            "The day is logged like any other, and tomorrow's allowance is the one the plan already had. If your use runs well over the allowance for two weeks, Wean suggests a slower pace, and you can dismiss the suggestion.",
        },
        {
          question: 'Where are my logs stored?',
          answer:
            'On your iPhone. There is no account and nothing syncs to a server. The app sends anonymous crash reports, and your logs and plan are never part of them. The privacy policy has the detail.',
        },
        {
          question: 'Can I take my log with me?',
          answer:
            'Yes. Export Data in Settings saves your log as a CSV file that you can keep, open in a spreadsheet or share. There is no import yet, so it is a copy for you, not a way to move the app to a new phone.',
        },
        {
          question: 'Can I delete everything?',
          answer:
            'Yes. Start Over in Settings deletes everything on the phone and takes you back to the beginning. Deleting the app does the same.',
        },
        {
          question: 'Does it work offline?',
          answer:
            'Yes. Logging, the plan, your progress and the craving tools all work without an internet connection.',
        },
        {
          question: 'Do I need an account?',
          answer: 'No. There is no sign-up and no login. You open the app and start.',
        },
        {
          question: 'What does it cost?',
          answer:
            'Wean is paid for once, with no subscription, no in-app purchases and no ads. The App Store sets the price for each country and shows it in your currency, and it is also under each App Store button on this page.',
        },
        {
          question: 'Is this medical advice?',
          answer:
            'No. Wean is a self-help tool for cutting down gradually. It does not give medical advice or treatment.',
        },
      ],
    },
    fineprint: { illustrations: 'Illustrations drawn with AI' },
  },

  da: {
    hero: {
      headline: 'En blidere måde at stoppe med nikotin på.',
      lede: 'Skær ned på snus og nikotinposer lidt ad gangen, i et tempo du selv vælger. Alt bliver på din iPhone, og en dag over grænsen bliver mødt med ro.',
      loopLabel:
        'Weans Today-skærm. Ét tryk på Used a pouch, tallet går op, og dagens kvote står stadig på skærmen.',
    },
    statements: [
      {
        title: 'Mindre, lidt ad gangen.',
        text: 'Din daglige kvote går lidt ned hver uge, så mindre aldrig kommer på én gang.',
      },
      {
        title: 'En dag over bliver mødt med ro.',
        text: 'Som en bølge, der når lidt længere op ad stenene, mens tidevandet stadig trækker sig tilbage. Dagen bliver registreret som alle andre, og der er intet at indhente i morgen.',
      },
      {
        title: 'Dit tempo, din plan.',
        text: 'Du vælger, hvor hurtigt kvoten falder, fra 3 % til 15 % om ugen, og du kan ændre det når som helst uden at miste det, du har registreret.',
      },
    ],
    tour: [
      {
        title: 'I dag',
        text: 'Ét tryk på Used a pouch registrerer en pose, og Resisted craving registrerer en trang, du lod gå forbi. Dagens kvote står i hele poser, og et tryk ved en fejl kan fortrydes i ti sekunder.',
        screenLabel: 'Weans Today-skærm med Used a pouch, Resisted craving og dagens kvote.',
      },
      {
        title: 'Fremskridt',
        text: 'Dine uger som søjler, de poser du har sparet i forhold til, hvor du startede, og de penge du har sparet, hvis du skriver, hvad en dåse koster. Når du har registreret nok, viser Patterns de tidspunkter og udløsere, der går igen.',
        screenLabel: 'Weans Progress-skærm med ugens søjler, sparede poser og sparede penge.',
      },
      {
        title: 'Når trangen kommer',
        text: 'En guidet vejrtrækningsøvelse med nogle rytmer at vælge imellem, eller urge surfing-timeren, der fører dig gennem fem minutter, mens trangen stiger og falder igen.',
        screenLabel: 'Weans Tools-skærm med vejrtrækningsøvelsen og urge surfing.',
      },
    ],
    staircase: {
      title: 'Sådan virker planen',
      intro:
        'Fortæl Wean, hvor mange poser du bruger på en almindelig dag, og vælg et tempo. Hver uge går kvoten ned med den andel, og appen tæller den i hele poser.',
      exampleLabel: 'Eksempel: 10 om dagen med 10 % om ugen',
      summary: (s) =>
        `Fra ${s.baseline} om dagen når kvoten nul efter ${s.weeksToZero} uger. Trinene er store i starten og små senere, med ${oneADayWeeks(s)} uger på én om dagen til sidst.`,
      paceNote: 'Dit eget tempo kan ligge alt fra 3 % til 15 % om ugen.',
      honest:
        'Wean er lavet til dem, der hellere vil skære ned end stoppe fra den ene dag til den anden.',
      axisPerDay: 'Poser om dagen',
      axisWeek: 'Uge',
      tableCaption: 'Eksemplet uge for uge',
      tableWeeks: 'Uger',
      tablePerDay: 'Kvote',
      weeks: (from, to, isLast) =>
        isLast
          ? `Fra uge ${from + 1}`
          : from === to
            ? `Uge ${from + 1}`
            : `Uge ${from + 1} til ${to + 1}`,
      perDay: (n) => (n === 0 ? 'Ingen' : `${n} om dagen`),
    },
    guides: {
      title: 'Guider',
      cards: [
        {
          title: 'Sådan trapper du ned på snus',
          text: 'En praktisk guide til at sænke dit daglige forbrug et skridt ad gangen.',
          href: '/da/hvordan-stopper-man-med-snus/',
        },
        {
          title: 'Trap ned i dit eget tempo',
          text: 'Hvordan en ugentlig nedtrapning virker, og hvordan du vælger tempo.',
          href: '/da/trappe-ned-snus/',
        },
        {
          title: 'Når trangen kommer',
          text: 'Seks teknikker til det øjeblik, trangen melder sig.',
          href: '/da/nikotin-trang-hjaelp/',
        },
      ],
    },
    assurances: {
      logs: {
        title: 'Din log bliver på din iPhone',
        text: 'Der er ingen konto at oprette og intet at synkronisere. Dine poser, din plan og dine indstillinger ligger på telefonen, og du kan selv eksportere din log som en fil.',
      },
      paid: {
        title: 'Betalt én gang',
        text: 'Ét køb og alle funktioner. Intet abonnement, ingen køb i appen og ingen reklamer.',
      },
      label: {
        heading: 'App-anonymitet',
        type: 'Data, der ikke er tilknyttet dig',
        explanation:
          'Følgende data vil muligvis blive indsamlet, men de er ikke tilknyttet din identitet:',
        category: 'Diagnostik',
        note: 'I Wean er det anonyme nedbruds- og ydelsesdata, som aldrig indeholder din log eller din plan.',
      },
    },
    maker: {
      note: 'Jeg byggede Wean, fordi jeg selv ville skære ned, og at stoppe fra den ene dag til den anden var ikke vejen for mig. Det, der virkede, var lidt mindre hver uge, uden at nogen førte regnskab. Det gør Wean på din iPhone, og ikke mere end det. Den lægger en plan, der trapper ned, registrerer en pose med ét tryk og er rolig de dage, du går over.',
      signature: 'Jarl',
    },
    faq: {
      title: 'Spørgsmål',
      items: [
        {
          question: 'Hvordan hjælper Wean mig med at skære ned?',
          answer:
            'Du fortæller, hvor mange poser du bruger på en almindelig dag, og vælger et tempo fra 3 % til 15 % om ugen. Hver uge går den daglige kvote ned med den andel, vist i hele poser, så du skærer ned et skridt ad gangen i stedet for at stoppe på én gang.',
        },
        {
          question: 'Virker det også til nikotinposer?',
          answer:
            'Ja. Wean tæller poser, så det virker på samme måde for snus og for nikotinposer.',
        },
        {
          question: 'Hvad sker der en dag, hvor jeg går over?',
          answer:
            'Dagen bliver registreret som alle andre, og morgendagens kvote er den, planen allerede havde. Ligger dit forbrug et godt stykke over kvoten i to uger, foreslår Wean et roligere tempo, og du kan afvise forslaget.',
        },
        {
          question: 'Hvor bliver min log gemt?',
          answer:
            'På din iPhone. Der er ingen konto, og intet bliver synkroniseret til en server. Appen sender anonyme fejlrapporter, og din log og din plan er aldrig en del af dem. Privatlivspolitikken har detaljerne.',
        },
        {
          question: 'Kan jeg tage min log med mig?',
          answer:
            'Ja. Export Data under Settings gemmer din log som en CSV-fil, som du kan beholde, åbne i et regneark eller dele. Der er ingen import endnu, så det er en kopi til dig, ikke en måde at flytte appen til en ny telefon.',
        },
        {
          question: 'Kan jeg slette det hele?',
          answer:
            'Ja. Start Over under Settings sletter alt på telefonen og fører dig tilbage til begyndelsen. Det samme sker, hvis du sletter appen.',
        },
        {
          question: 'Virker det uden internet?',
          answer:
            'Ja. Registrering, planen, dine fremskridt og værktøjerne mod trang virker alle uden internetforbindelse.',
        },
        {
          question: 'Skal jeg have en konto?',
          answer: 'Nej. Der er ingen tilmelding og intet login. Du åbner appen og går i gang.',
        },
        {
          question: 'Er appen på dansk?',
          answer:
            'Nej. Appens skærme er på engelsk. Denne side og teksten i App Store er på dansk, men selve appen er ikke oversat endnu.',
        },
        {
          question: 'Hvad koster det?',
          answer:
            'Wean er betalt én gang, uden abonnement, køb i appen eller reklamer. App Store sætter prisen for hvert land og viser den i din valuta, og den står også under hver App Store-knap på denne side.',
        },
        {
          question: 'Er det medicinsk rådgivning?',
          answer:
            'Nej. Wean er et selvhjælpsværktøj til at skære gradvist ned. Det giver ikke medicinsk rådgivning eller behandling.',
        },
      ],
    },
    fineprint: { illustrations: 'Illustrationer tegnet med AI' },
  },

  sv: {
    hero: {
      headline: 'Ett mildare sätt att sluta med nikotin.',
      lede: 'Minska snus och nikotinpåsar lite i taget, i en takt du själv väljer. Allt stannar på din iPhone, och en dag över gränsen möts med lugn.',
      loopLabel:
        'Weans Today-skärm. Ett tryck på Used a pouch, siffran går upp, och dagens ranson syns hela tiden.',
    },
    statements: [
      {
        title: 'Mindre, lite i taget.',
        text: 'Din dagliga ranson går ner lite varje vecka, så mindre kommer aldrig på en gång.',
      },
      {
        title: 'En dag över möts med lugn.',
        text: 'Som en våg som når lite längre upp på stenarna medan tidvattnet fortfarande drar sig undan. Dagen loggas som alla andra, och det finns inget att ta igen i morgon.',
      },
      {
        title: 'Din takt, din plan.',
        text: 'Du väljer hur snabbt ransonen sjunker, från 3 % till 15 % i veckan, och du kan ändra det när du vill utan att förlora det du har loggat.',
      },
    ],
    tour: [
      {
        title: 'I dag',
        text: 'Ett tryck på Used a pouch loggar en prilla, och Resisted craving loggar ett sug du lät passera. Dagens ranson visas i hela prillor, och ett tryck i misstag kan ångras i tio sekunder.',
        screenLabel: 'Weans Today-skärm med Used a pouch, Resisted craving och dagens ranson.',
      },
      {
        title: 'Framsteg',
        text: 'Dina veckor som staplar, prillorna du har undvikit jämfört med där du började och, om du anger vad en dosa kostar, pengarna du har sparat. När du har loggat tillräckligt visar Patterns de tider på dygnet och de triggers som återkommer mest.',
        screenLabel:
          'Weans Progress-skärm med veckans staplar, undvikna prillor och sparade pengar.',
      },
      {
        title: 'När suget kommer',
        text: 'En guidad andningsövning med några rytmer att välja mellan, eller urge surfing-timern som leder dig genom fem minuter medan suget stiger och lägger sig.',
        screenLabel: 'Weans Tools-skärm med andningsövningen och urge surfing.',
      },
    ],
    staircase: {
      title: 'Så fungerar planen',
      intro:
        'Berätta för Wean hur många prillor du använder en vanlig dag och välj en takt. Varje vecka sjunker ransonen med den andelen, och appen räknar den i hela prillor.',
      exampleLabel: 'Exempel: 10 om dagen med 10 % i veckan',
      summary: (s) =>
        `Från ${s.baseline} om dagen når ransonen noll efter ${s.weeksToZero} veckor. Stegen är stora i början och små senare, med ${oneADayWeeks(s)} veckor på en om dagen på slutet.`,
      paceNote: 'Din egen takt kan ligga var som helst från 3 % till 15 % i veckan.',
      honest: 'Wean är gjort för den som hellre vill minska än sluta från en dag till nästa.',
      axisPerDay: 'Prillor om dagen',
      axisWeek: 'Vecka',
      tableCaption: 'Exemplet vecka för vecka',
      tableWeeks: 'Veckor',
      tablePerDay: 'Ranson',
      weeks: (from, to, isLast) =>
        isLast
          ? `Från vecka ${from + 1}`
          : from === to
            ? `Vecka ${from + 1}`
            : `Vecka ${from + 1} till ${to + 1}`,
      perDay: (n) => (n === 0 ? 'Ingen' : `${n} om dagen`),
    },
    guides: {
      title: 'Guider',
      cards: [
        {
          title: 'Så minskar du snuset',
          text: 'En praktisk guide till att sänka din dagliga användning ett steg i taget.',
          href: '/sv/hur-slutar-man-snusa/',
        },
        {
          title: 'Trappa ner i din egen takt',
          text: 'Hur en nedtrappning vecka för vecka fungerar, och hur du väljer takt.',
          href: '/sv/trappa-ner-snus/',
        },
        {
          title: 'När suget kommer',
          text: 'Sex tekniker för stunden då suget kommer.',
          href: '/sv/nikotinsug-hjalp/',
        },
      ],
    },
    assurances: {
      logs: {
        title: 'Din logg stannar på din iPhone',
        text: 'Det finns inget konto att skapa och inget att synka. Dina prillor, din plan och dina inställningar finns på telefonen, och du kan själv exportera din logg som en fil.',
      },
      paid: {
        title: 'Betalt en gång',
        text: 'Ett köp och alla funktioner. Ingen prenumeration, inga köp i appen och ingen reklam.',
      },
      label: {
        heading: 'Appintegritet',
        type: 'Data som inte kopplas till dig',
        explanation: 'Följande data kan samlas in men den kopplas inte till din identitet:',
        category: 'Diagnostik',
        note: 'I Wean är det anonyma krasch- och prestandadata, som aldrig innehåller din logg eller din plan.',
      },
    },
    maker: {
      note: 'Jag byggde Wean för att jag själv ville dra ner, och att sluta från en dag till nästa var inte vägen för mig. Det som fungerade var lite mindre varje vecka, utan att någon förde protokoll. Det gör Wean på din iPhone, och inget mer. Den lägger upp en plan som trappar ner, loggar en prilla med ett tryck och håller sig lugn de dagar du går över.',
      signature: 'Jarl',
    },
    faq: {
      title: 'Frågor',
      items: [
        {
          question: 'Hur hjälper Wean mig att minska?',
          answer:
            'Du anger hur många prillor du använder en vanlig dag och väljer en takt från 3 % till 15 % i veckan. Varje vecka sjunker den dagliga ransonen med den andelen, visad i hela prillor, så att du minskar ett steg i taget i stället för att sluta på en gång.',
        },
        {
          question: 'Fungerar det även för nikotinpåsar?',
          answer:
            'Ja. Wean räknar prillor, så det fungerar på samma sätt för snus och för nikotinpåsar.',
        },
        {
          question: 'Vad händer en dag när jag går över?',
          answer:
            'Dagen loggas som alla andra, och morgondagens ranson är den som planen redan hade. Ligger din användning en bra bit över ransonen i två veckor föreslår Wean en lugnare takt, och du kan avvisa förslaget.',
        },
        {
          question: 'Var sparas min logg?',
          answer:
            'På din iPhone. Det finns inget konto, och inget synkas till en server. Appen skickar anonyma felrapporter, och din logg och din plan ingår aldrig i dem. Integritetspolicyn har detaljerna.',
        },
        {
          question: 'Kan jag ta med mig min logg?',
          answer:
            'Ja. Export Data under Settings sparar din logg som en CSV-fil som du kan behålla, öppna i ett kalkylark eller dela. Det finns ingen import än, så det är en kopia till dig, inte ett sätt att flytta appen till en ny telefon.',
        },
        {
          question: 'Kan jag radera allt?',
          answer:
            'Ja. Start Over under Settings raderar allt på telefonen och tar dig tillbaka till början. Att radera appen gör detsamma.',
        },
        {
          question: 'Fungerar det utan internet?',
          answer:
            'Ja. Loggningen, planen, dina framsteg och verktygen mot sug fungerar alla utan internetanslutning.',
        },
        {
          question: 'Behöver jag ett konto?',
          answer:
            'Nej. Det finns ingen registrering och ingen inloggning. Du öppnar appen och börjar.',
        },
        {
          question: 'Finns appen på svenska?',
          answer:
            'Nej. Appens skärmar är på engelska. Den här sidan och texten i App Store är på svenska, men själva appen är inte översatt än.',
        },
        {
          question: 'Vad kostar det?',
          answer:
            'Wean betalas en gång, utan prenumeration, köp i appen eller reklam. App Store sätter priset för varje land och visar det i din valuta, och det står också under varje App Store-knapp på den här sidan.',
        },
        {
          question: 'Är det medicinsk rådgivning?',
          answer:
            'Nej. Wean är ett självhjälpsverktyg för att minska gradvis. Det ger inte medicinsk rådgivning eller behandling.',
        },
      ],
    },
    fineprint: { illustrations: 'Illustrationer ritade med AI' },
  },

  no: {
    hero: {
      headline: 'En mildere måte å slutte med nikotin på.',
      lede: 'Kutt ned på snus og nikotinposer litt om gangen, i et tempo du velger selv. Alt blir på iPhonen din, og en dag over grensen blir møtt med ro.',
      loopLabel:
        'Weans Today-skjerm. Ett trykk på Used a pouch, tallet går opp, og dagens kvote står fortsatt på skjermen.',
    },
    statements: [
      {
        title: 'Mindre, litt om gangen.',
        text: 'Den daglige kvoten din går litt ned hver uke, så mindre kommer aldri på én gang.',
      },
      {
        title: 'En dag over blir møtt med ro.',
        text: 'Som en bølge som når litt lenger opp på steinene mens tidevannet fortsatt trekker seg tilbake. Dagen registreres som alle andre, og det er ingenting å ta igjen i morgen.',
      },
      {
        title: 'Ditt tempo, din plan.',
        text: 'Du velger hvor raskt kvoten synker, fra 3 % til 15 % i uken, og du kan endre det når du vil uten å miste det du har registrert.',
      },
    ],
    tour: [
      {
        title: 'I dag',
        text: 'Ett trykk på Used a pouch registrerer en pose, og Resisted craving registrerer et sug du lot passere. Dagens kvote vises i hele poser, og et trykk ved en feil kan angres i ti sekunder.',
        screenLabel: 'Weans Today-skjerm med Used a pouch, Resisted craving og dagens kvote.',
      },
      {
        title: 'Fremgang',
        text: 'Ukene dine som søyler, posene du har unngått sammenlignet med der du startet og, hvis du legger inn hva en boks koster, pengene du har spart. Når du har registrert nok, viser Patterns de tidene på døgnet og triggerne som går igjen.',
        screenLabel: 'Weans Progress-skjerm med ukens søyler, unngåtte poser og sparte penger.',
      },
      {
        title: 'Når suget kommer',
        text: 'En guidet pusteøvelse med noen rytmer å velge mellom, eller urge surfing-timeren som leder deg gjennom fem minutter mens suget stiger og legger seg.',
        screenLabel: 'Weans Tools-skjerm med pusteøvelsen og urge surfing.',
      },
    ],
    staircase: {
      title: 'Slik virker planen',
      intro:
        'Fortell Wean hvor mange poser du bruker på en vanlig dag, og velg et tempo. Hver uke går kvoten ned med den andelen, og appen teller den i hele poser.',
      exampleLabel: 'Eksempel: 10 om dagen med 10 % i uken',
      summary: (s) =>
        `Fra ${s.baseline} om dagen når kvoten null etter ${s.weeksToZero} uker. Trinnene er store i starten og små senere, med ${oneADayWeeks(s)} uker på én om dagen til slutt.`,
      paceNote: 'Ditt eget tempo kan ligge hvor som helst fra 3 % til 15 % i uken.',
      honest:
        'Wean er laget for dem som heller vil kutte ned enn slutte fra den ene dagen til den andre.',
      axisPerDay: 'Poser om dagen',
      axisWeek: 'Uke',
      tableCaption: 'Eksempelet uke for uke',
      tableWeeks: 'Uker',
      tablePerDay: 'Kvote',
      weeks: (from, to, isLast) =>
        isLast
          ? `Fra uke ${from + 1}`
          : from === to
            ? `Uke ${from + 1}`
            : `Uke ${from + 1} til ${to + 1}`,
      perDay: (n) => (n === 0 ? 'Ingen' : `${n} om dagen`),
    },
    guides: {
      title: 'Guider',
      cards: [
        {
          title: 'Slik trapper du ned på snus',
          text: 'En praktisk guide til å senke det daglige forbruket ditt ett steg om gangen.',
          href: '/no/hvordan-slutte-med-snus/',
        },
        {
          title: 'Trapp ned i ditt eget tempo',
          text: 'Hvordan en ukentlig nedtrapping fungerer, og hvordan du velger tempo.',
          href: '/no/trappe-ned-snus/',
        },
        {
          title: 'Når suget kommer',
          text: 'Seks teknikker for øyeblikket når suget melder seg.',
          href: '/no/nikotinsug-hjelp/',
        },
      ],
    },
    assurances: {
      logs: {
        title: 'Loggen din blir på iPhonen',
        text: 'Det er ingen konto å opprette og ingenting å synkronisere. Posene dine, planen og innstillingene ligger på telefonen, og du kan selv eksportere loggen din som en fil.',
      },
      paid: {
        title: 'Betalt én gang',
        text: 'Ett kjøp og alle funksjoner. Ingen abonnement, ingen kjøp i appen og ingen reklame.',
      },
      label: {
        heading: 'Apper og personvern',
        type: 'Data som ikke knyttes til deg',
        explanation:
          'Følgende data kan bli samlet inn, men vil ikke bli knyttet til identiteten din:',
        category: 'Diagnostikk',
        note: 'I Wean er det anonyme krasj- og ytelsesdata, som aldri inneholder loggen eller planen din.',
      },
    },
    maker: {
      note: 'Jeg laget Wean fordi jeg selv ville kutte ned, og å slutte fra den ene dagen til den andre var ikke veien for meg. Det som fungerte, var litt mindre hver uke, uten at noen førte regnskap. Det gjør Wean på iPhonen din, og ikke noe mer. Den legger en plan som trapper ned, registrerer en pose med ett trykk og holder seg rolig de dagene du går over.',
      signature: 'Jarl',
    },
    faq: {
      title: 'Spørsmål',
      items: [
        {
          question: 'Hvordan hjelper Wean meg å kutte ned?',
          answer:
            'Du forteller hvor mange poser du bruker på en vanlig dag, og velger et tempo fra 3 % til 15 % i uken. Hver uke går den daglige kvoten ned med den andelen, vist i hele poser, så du kutter ned ett steg om gangen i stedet for å slutte på én gang.',
        },
        {
          question: 'Fungerer det også for nikotinposer?',
          answer:
            'Ja. Wean teller poser, så det fungerer på samme måte for snus og for nikotinposer.',
        },
        {
          question: 'Hva skjer en dag jeg går over?',
          answer:
            'Dagen registreres som alle andre, og morgendagens kvote er den planen allerede hadde. Ligger forbruket ditt godt over kvoten i to uker, foreslår Wean et roligere tempo, og du kan avvise forslaget.',
        },
        {
          question: 'Hvor lagres loggen min?',
          answer:
            'På iPhonen din. Det er ingen konto, og ingenting synkroniseres til en server. Appen sender anonyme feilrapporter, og loggen og planen din er aldri en del av dem. Personvernerklæringen har detaljene.',
        },
        {
          question: 'Kan jeg ta med meg loggen min?',
          answer:
            'Ja. Export Data under Settings lagrer loggen din som en CSV-fil som du kan beholde, åpne i et regneark eller dele. Det finnes ingen import ennå, så det er en kopi til deg, ikke en måte å flytte appen til en ny telefon.',
        },
        {
          question: 'Kan jeg slette alt?',
          answer:
            'Ja. Start Over under Settings sletter alt på telefonen og tar deg tilbake til begynnelsen. Å slette appen gjør det samme.',
        },
        {
          question: 'Fungerer det uten internett?',
          answer:
            'Ja. Registrering, planen, fremgangen din og verktøyene mot sug fungerer alle uten internettforbindelse.',
        },
        {
          question: 'Trenger jeg en konto?',
          answer: 'Nei. Det er ingen registrering og ingen innlogging. Du åpner appen og begynner.',
        },
        {
          question: 'Er appen på norsk?',
          answer:
            'Nei. Appens skjermer er på engelsk. Denne siden og teksten i App Store er på norsk, men selve appen er ikke oversatt ennå.',
        },
        {
          question: 'Hva koster det?',
          answer:
            'Wean betales én gang, uten abonnement, kjøp i appen eller reklame. App Store setter prisen for hvert land og viser den i din valuta, og den står også under hver App Store-knapp på denne siden.',
        },
        {
          question: 'Er dette medisinske råd?',
          answer:
            'Nei. Wean er et selvhjelpsverktøy for å kutte ned gradvis. Det gir ikke medisinske råd eller behandling.',
        },
      ],
    },
    fineprint: { illustrations: 'Illustrasjoner tegnet med AI' },
  },
};
