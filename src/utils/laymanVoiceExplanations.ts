import { Language } from './translations';
import { speakInstant, stopAllVoice } from './voiceService';

export interface LaymanExplanation {
  titleEn: string;
  titleHi: string;
  simpleExplanationEn: string;
  simpleExplanationHi: string;
  practicalExampleEn: string;
  practicalExampleHi: string;
}

export const LAYMAN_EXPLANATIONS: Record<string, LaymanExplanation> = {
  // 1. Concessional Interest Rate
  concessional_rate: {
    titleEn: 'Concessional Interest Rate (Subsidized Rate)',
    titleHi: 'रियायती ब्याज दर (सस्ता सरकारी ब्याज)',
    simpleExplanationHi: 'रियायती ब्याज दर का मतलब है बहुत कम ब्याज! आम प्राइवेट बैंकों में 12 से 16 प्रतिशत ब्याज लगता है, लेकिन इस सरकारी योजना में आपको सिर्फ 5 से 6.5 प्रतिशत का बहुत सस्ता ब्याज देना होता है, जिससे आपकी हर महीने की किस्त बहुत कम हो जाती है।',
    simpleExplanationEn: 'Concessional interest rate means heavily discounted low interest. While commercial loans charge 12% to 16%, government schemes charge only 5% to 6.5%, saving you huge money on monthly EMIs.',
    practicalExampleHi: 'उदाहरण: 1 लाख के लोन पर प्राइवेट बैंक में हर महीने ₹3000 किस्त बनती है, लेकिन यहाँ सिर्फ ₹1800 देनी होगी।',
    practicalExampleEn: 'Example: On ₹1 Lakh loan, commercial EMI is ~₹3,000/mo, but under this scheme it drops to ~₹1,800/mo.'
  },

  // 2. Promoter Contribution / Margin Money
  promoter_equity: {
    titleEn: 'Promoter Contribution (Your Own Share)',
    titleHi: 'प्रमोटर हिस्सा (आपकी जेब से लगने वाला पैसा)',
    simpleExplanationHi: 'प्रमोटर हिस्से का मतलब है कि धंधा शुरू करने में आपको अपनी जेब से कितना पैसा लगाना है। इस योजना में आपको कुल खर्च का सिर्फ 10% (दसवां हिस्सा) लगाना होता है, बाकी 90% पैसा सरकार और बैंक देते हैं।',
    simpleExplanationEn: 'Promoter contribution is the small initial amount you invest from your pocket (just 10%). The government and channel partner bank fund the remaining 90%.',
    practicalExampleHi: 'उदाहरण: अगर आपके काम में 1 लाख रुपये लगते हैं, तो आपको सिर्फ 10 हजार लगाने हैं, बाकी 90 हजार सरकार देगी।',
    practicalExampleEn: 'Example: For a ₹1,00,000 project, you only put in ₹10,000; the bank funds ₹90,000.'
  },

  // 3. 90% Apex Assistance
  max_assistance: {
    titleEn: '90% Financial Assistance',
    titleHi: '90% सरकारी वित्तीय सहायता',
    simpleExplanationHi: 'सरकार आपके व्यवसाय की कुल लागत का 90 प्रतिशत तक लोन उपलब्ध कराती है, ताकि गरीब और पिछड़े वर्ग के भाई-बहनों को पूंजी की कमी से अपना काम रोकना न पड़े।',
    simpleExplanationEn: 'The government provides up to 90% of the total project cost so that capital shortage never stops you from starting your enterprise.',
    practicalExampleHi: 'उदाहरण: 2 लाख के प्रोजेक्ट में ₹1,80,000 तक की पूरी फंडिंग सरकार के जरिए सीधे बैंक से मिल जाएगी।',
    practicalExampleEn: 'Example: On a ₹2 Lakh setup, ₹1,80,000 is directly provided as subsidized credit.'
  },

  // 4. Moratorium Period
  moratorium_period: {
    titleEn: 'Moratorium Period (Repayment Holiday)',
    titleHi: 'मोरेटोरियम अवधि (शुरुआती छूट की मोहलत)',
    simpleExplanationHi: 'मोरेटोरियम का मतलब है काम जमाने की मोहलत! लोन मिलने के तुरंत बाद आपको किस्त नहीं देनी होती। पहले 6 से 12 महीने तक आपको मूल किस्त भरने से छूट मिलती है, ताकि आप पहले अपनी दुकान या काम अच्छे से जमा लें और कमाई शुरू कर लें।',
    simpleExplanationEn: 'Moratorium is a repayment holiday. You do not have to pay the principal loan installment for the first 6 to 12 months until your business starts generating profit.',
    practicalExampleHi: 'उदाहरण: लोन मिलने के पहले 6 महीने तक कोई किस्त नहीं कटेगी, 7वें महीने से जब कमाई होगी तब किस्त शुरू होगी।',
    practicalExampleEn: 'Example: Zero principal EMI during the first 6 months setup phase; regular payments start from Month 7.'
  },

  // 5. Monthly EMI
  monthly_emi: {
    titleEn: 'Monthly EMI (Monthly Installment)',
    titleHi: 'मासिक किस्त (हर महीने चुकाई जाने वाली रकम)',
    simpleExplanationHi: 'ईएमआई वह छोटी और आसान रकम है जो आपको अपनी मासिक कमाई में से हर महीने बैंक को वापस जमा करनी होती है। कम ब्याज दर होने की वजह से यह किस्त बहुत हल्की होती है।',
    simpleExplanationEn: 'EMI is the small, affordable monthly installment you pay back to the bank from your regular business profits.',
    practicalExampleHi: 'उदाहरण: ₹1.40 लाख के सिलाई मशीन लोन पर हर महीने सिर्फ लगभग ₹2,300 की किस्त बनेगी।',
    practicalExampleEn: 'Example: For ₹1.4 Lakh tailoring loan, EMI is only approx ₹2,300 per month.'
  },

  // 6. Annual Income Limit
  income_limit: {
    titleEn: 'Annual Family Income Limit (₹5.00 Lakhs)',
    titleHi: 'वार्षिक पारिवारिक आय सीमा (5 लाख रुपये तक)',
    simpleExplanationHi: 'यह योजना विशेष रूप से गरीब और मध्यम आय वाले परिवारों के लिए है। अगर आपके पूरे परिवार की साल भर की कुल कमाई 5 लाख रुपये या उससे कम है, तो आप इस सस्ती योजना के पूरे हकदार हैं।',
    simpleExplanationEn: 'This scheme is dedicated to underserved families. If your total annual household income is up to ₹5.00 Lakhs, you qualify for 100% concessional benefits.',
    practicalExampleHi: 'उदाहरण: यदि आपकी महीने की पारिवारिक आय ₹40,000 तक है, तो आप पूरी तरह पात्र हैं।',
    practicalExampleEn: 'Example: If your household earns around ₹40,000/month or less, you are fully eligible.'
  },

  // 7. Channel Partner / SCA
  channel_partner: {
    titleEn: 'Authorized Channel Partner (SCA / Bank)',
    titleHi: 'अधिकृत चैनल पार्टनर (सरकारी बैंक व एजेंसी)',
    simpleExplanationHi: 'चैनल पार्टनर वे सरकारी बैंक, क्षेत्रीय ग्रामीण बैंक और राज्य अनुसूचित जाति निगम हैं, जिनके पास सरकार का पैसा रखा होता है और जो आपको लोन का चेक या खाता ट्रांसफर देते हैं।',
    simpleExplanationEn: 'Channel partners are authorized state agencies (SCAs), public sector banks, and RRBs that hold government allocated funds to disburse your loan directly.',
    practicalExampleHi: 'उदाहरण: आपके जिले का अनुसूचित जाति विकास निगम (SCA) या पीएनबी / एसबीआई का ग्रामीण शाखा।',
    practicalExampleEn: 'Example: District Scheduled Castes Development Agency (SCA) or local PNB/SBI lead branch.'
  },

  // 8. Safe NPA Status
  npa_status: {
    titleEn: 'Safe NPA & Fund Health Status',
    titleHi: 'सुरक्षित बैंक स्थिति (तुरंत लोन पास होने की गारंटी)',
    simpleExplanationHi: 'यह हरा निशान बताता है कि इस बैंक शाखा के पास सरकार का पर्याप्त पैसा उपलब्ध है और यहाँ आवेदन करने पर आपका लोन बिना किसी अड़चन या रिश्वत के सबसे तेजी से पास होगा।',
    simpleExplanationEn: 'Safe status indicates that this bank branch has unutilized funds and clean performance, ensuring your application gets approved rapidly without delays.',
    practicalExampleHi: 'उदाहरण: ग्रीन मार्क वाली शाखा में जाने पर 15 से 25 दिनों में लोन डिस्बर्स हो जाता है।',
    practicalExampleEn: 'Example: Branches marked Optimal Disbursal typically process loans within 15-25 days.'
  },

  // 9. Caste Certificate
  caste_cert: {
    titleEn: 'Caste Certificate (SC Community Proof)',
    titleHi: 'जाति प्रमाण पत्र (अनुसूचित जाति प्रमाण)',
    simpleExplanationHi: 'यह तहसीलदार या एसडीएम द्वारा जारी सरकारी प्रमाण पत्र है जो साबित करता है कि आप अनुसूचित जाति (SC) से हैं और इस विशेष रियायती योजना के असली हकदार हैं।',
    simpleExplanationEn: 'Official government certificate issued by competent revenue authority confirming Scheduled Caste eligibility for concessional welfare credit.',
    practicalExampleHi: 'उदाहरण: राज्य सरकार का डिजिटल जाति प्रमाण पत्र या ब्लॉक से बना सर्टिफिकेट।',
    practicalExampleEn: 'Example: Digital Caste Certificate issued by State e-District portal or Tehsildar.'
  },

  // 10. Digital Routing Dossier Token
  routing_dossier: {
    titleEn: 'Digital Routing Dossier Token',
    titleHi: 'डिजिटल रूटिंग डॉसियर टोकन',
    simpleExplanationHi: 'यह आपका आधिकारिक डिजिटल टोकन है। इसे प्रिंट करके बैंक में ले जाने पर बैंक अधिकारी को तुरंत पता चल जाएगा कि आपका फॉर्म पहले से सत्यापित है और आपको 90% रियायती लोन मिलना है।',
    simpleExplanationEn: 'Your pre-screened official routing certificate. Presenting this to the bank nodal officer fast-tracks your loan under NSFDC priority lines.',
    practicalExampleHi: 'उदाहरण: टोकन नंबर दिखाते ही बैंक आपको प्राथमिकता सूची में डालकर तेजी से प्रोसेस करेगा।',
    practicalExampleEn: 'Example: Nodal officer scans your QR token and instantly verifies pre-approved parameters.'
  },

  // 11. Women Entrepreneurship / Mahila Samriddhi
  women_scheme: {
    titleEn: 'Mahila Samriddhi Yojana (Special 5% Rate)',
    titleHi: 'महिला समृद्धि योजना (विशेष 5% ब्याज दर)',
    simpleExplanationHi: 'यह योजना हमारी माताओं-बहनों और महिला स्वयं सहायता समूहों (SHG) के लिए है। इसमें सिर्फ 5% के सबसे कम ब्याज पर सिलाई, ब्यूटी पार्लर, हस्तशिल्प या किराना दुकान के लिए ₹1.40 लाख तक का लोन मिलता है।',
    simpleExplanationEn: 'Dedicated to women entrepreneurs and SHGs with an ultra-low 5% interest rate up to ₹1.40 Lakh for tailoring, handicrafts, food crafts, and micro-shops.',
    practicalExampleHi: 'उदाहरण: 1.4 लाख के लोन पर 10% (14,000) आपका, बाकी 1.26 लाख सरकार से मात्र 5% ब्याज पर!',
    practicalExampleEn: 'Example: On ₹1.4L cost, you invest ₹14,000; government funds ₹1,26,000 at 5% p.a.'
  },

  // 12. Agriculture & Dairy Farming
  agri_dairy: {
    titleEn: 'Mahila Kisan & Dairy Farming Scheme',
    titleHi: 'महिला किसान व डेयरी पशुपालन योजना',
    simpleExplanationHi: 'गाय-भैंस खरीदने, डेयरी फार्म खोलने, बकरी पालन या मुर्गी पालन के लिए ₹2.00 लाख तक का आसान लोन। इसमें पशुओं के बीमे की सुविधा भी शामिल है और फसल के अनुसार किस्त चुकाने की छूट मिलती है।',
    simpleExplanationEn: 'Financing up to ₹2.00 Lakh at 5% interest for dairy cattle, buffaloes, goatery, and agro-allied farming with livestock insurance included.',
    practicalExampleHi: 'उदाहरण: 2 दुधारू गाय खरीदने और शेड बनाने के लिए ₹2 लाख का रियायती लोन।',
    practicalExampleEn: 'Example: Financing purchase of 2 milch cows and dairy shed with seasonal repayment flexibility.'
  },

  // 13. Green Business (E-Rickshaw / Solar)
  green_business: {
    titleEn: 'Green Business & E-Rickshaw Scheme',
    titleHi: 'ग्रीन बिजनेस एवं ई-रिक्शा योजना',
    simpleExplanationHi: 'ई-रिक्शा, बैटरी लोडर, सोलर पैनल या कचरा रीसाइक्लिंग यूनिट लगाने के लिए ₹3 लाख से ₹30 लाख तक का रियायती लोन, ताकि पर्यावरण भी बचे और आपकी पक्की कमाई भी हो।',
    simpleExplanationEn: 'Subsidized loan up to ₹30 Lakh for electric auto-rickshaws, battery loaders, solar rooftop installations, and eco-friendly micro-trades.',
    practicalExampleHi: 'उदाहरण: ई-रिक्शा खरीदने के लिए ₹1.5 लाख का लोन मात्र 6.5% ब्याज पर।',
    practicalExampleEn: 'Example: E-Rickshaw unit cost ₹1.5 Lakh with easy weekly/monthly repayments.'
  },

  // 14. Education Loan (Inland & Abroad)
  education_loan: {
    titleEn: 'Higher Education Concessional Loan',
    titleHi: 'उच्च शिक्षा रियायती ऋण योजना',
    simpleExplanationHi: 'बीटेक, एमबीबीएस, एमबीए या उच्च शिक्षा के लिए भारत में ₹20 लाख और विदेश में ₹30 लाख तक का लोन। सबसे खास बात: जब तक बच्चे की पढ़ाई चलेगी, तब तक कोई किस्त नहीं देनी होगी!',
    simpleExplanationEn: 'Concessional education loan up to ₹20L in India and ₹30L abroad with complete moratorium covering the entire course duration + 6 months post-job.',
    practicalExampleHi: 'उदाहरण: 4 साल की इंजीनियरिंग के दौरान कोई ईएमआई नहीं; नौकरी लगने के 6 महीने बाद किस्त शुरू होगी।',
    practicalExampleEn: 'Example: Zero EMI during 4-year degree; repayment starts 6 months after completing studies.'
  }
};

export { stopAllVoice };

/**
 * Speak layman voice explanation aloud in Hindi, Tamil, Marathi, or English with sub-20ms latency.
 */
export function speakLaymanExplanation(
  key: string,
  lang: Language = 'hi',
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  const item = LAYMAN_EXPLANATIONS[key] || LAYMAN_EXPLANATIONS.concessional_rate;

  const textToSpeak = lang === 'hi'
    ? `${item.titleHi}। ${item.simpleExplanationHi} ${item.practicalExampleHi}`
    : `${item.titleEn}. ${item.simpleExplanationEn} ${item.practicalExampleEn}`;

  return speakInstant(textToSpeak, {
    lang,
    rate: 0.94,
    onStart,
    onEnd,
    onError: () => onEnd?.()
  });
}

