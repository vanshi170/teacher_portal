import fs from 'node:fs';
import path from 'node:path';

// Parse raw data from prompt
const rawCsvData = `
Roll List Section: A         I Semester         Batch 2025-29,,,,
,,,,
S.No.,PRN,Section,Name of Students,College Email ID
1,25070521001,A,ARUSHI  VARGHESE,arushi.varghese.batch2025@sitnagpur.siu.edu.in
2,25070521002,A,LARANYA PANKAJ SHENDE,laranya.shende.batch2025@sitnagpur.siu.edu.in
3,25070521004,A,HARSHINI S J,harshini.sj.batch2025@sitnagpur.siu.edu.in
4,25070521005,A,JAYAM SUNDARAM,jayam.sundaram.batch2025@sitnagpur.siu.edu.in
5,25070521006,A,KOTHA JATIN,kotha.jatin.batch2025@sitnagpur.siu.edu.in
6,25070521007,A,K SAI SUSHEEL,ksai.susheel.batch2025@sitnagpur.siu.edu.in
7,25070521008,A,PAHUJA HEERAL PANKAJ,heeral.pahuja.batch2025@sitnagpur.siu.edu.in
8,25070521009,A,MITISA SUNIL GANATRA,mitisa.ganatra.batch2025@sitnagpur.siu.edu.in
9,25070521010,A,MUKWANE ATHARVA PRAMOD,atharva.mukwane.batch2025@sitnagpur.siu.edu.in
10,25070521011,A,SAYED AAQUIB ALI,sayed.ali.batch2025@sitnagpur.siu.edu.in
11,25070521012,A,SAMPADA SURYAWANSHI,sampada.suryawanshi.batch2025@sitnagpur.siu.edu.in
12,25070521013,A,ABHINAV JADHAV,abhinav.jadhav.batch2025@sitnagpur.siu.edu.in
13,25070521014,A,AVNI ANGAD MANKAR,avni.mankar.batch2025@sitnagpur.siu.edu.in
14,25070521015,A,SURJUSE YASH RAVINDRA,yash.surjuse.batch2025@sitnagpur.siu.edu.in
15,25070521016,A,AGRAWAL BHAVYA RISHIKUMAR,bhavya.agrawal.batch2025@sitnagpur.siu.edu.in
16,25070521017,A,SHRUTI JAYBHARAT KALE,shruti.kale.batch2025@sitnagpur.siu.edu.in
17,25070521019,A,MOKSHA RAJENDRA KINDARLE,moksha.kindarle.batch2025@sitnagpur.siu.edu.in
18,25070521020,A,SHRUTANVI MARTANDRAO DEKATE,shrutanvi.dekate.batch2025@sitnagpur.siu.edu.in
19,25070521021,A,SHRUTI,shruti.sharma.batch2025@sitnagpur.siu.edu.in
20,25070521023,A,SATVIK VIKRAM NEB,satvik.neb.batch2025@sitnagpur.siu.edu.in
21,25070521024,A,DHAGE PRANAV RAJU,pranav.dhage.batch2025@sitnagpur.siu.edu.in
22,25070521025,A,MITESH TUKARAM DAWALE,mitesh.dawale.batch2025@sitnagpur.siu.edu.in
23,25070521026,A,TEJAS MOON,tejas.moon.batch2025@sitnagpur.siu.edu.in
24,25070521027,A,ROSHAL BOSE,roshal.bose.batch2025@sitnagpur.siu.edu.in
25,25070521028,A,SURYANSH POL,suryansh.pol.batch2025@sitnagpur.siu.edu.in
26,25070521029,A,SAVANI SACHIN KULKARNI,savani.kulkarni.batch2025@sitnagpur.siu.edu.in
27,25070521030,A,ARJITA SINGH,arjita.singh.batch2025@sitnagpur.siu.edu.in
28,25070521031,A,DEVANSH RAJPOOT,devansh.rajpoot.batch2025@sitnagpur.siu.edu.in
29,25070521032,A,ARJUN SHUKLA,arjun.shukla.batch2025@sitnagpur.siu.edu.in
30,25070521033,A,SHIPRA GUPTA,shipra.gupta.batch2025@sitnagpur.siu.edu.in
31,25070521034,A,ADITYA MAKRAND JAGDALE,aditya.jagdale.batch2025@sitnagpur.siu.edu.in
32,25070521035,A,RUDRAKSH RAJESH CHAUHAN,rudraksh.chauhan.batch2025@sitnagpur.siu.edu.in
33,25070521036,A,APURVA RAI,apurva.rai.batch2025@sitnagpur.siu.edu.in
34,25070521037,A,HADGE VEDANT SUDHIR,vedant.hadge.batch2025@sitnagpur.siu.edu.in
35,25070521038,A,ROSHAN SEERWANI,roshan.seerwani.batch2025@sitnagpur.siu.edu.in
36,25070521039,A,GADIWAN DAMINI DATTA,damini.gadiwan.batch2025@sitnagpur.siu.edu.in
37,25070521040,A,PRANAV KISHOR TALMALE,pranav.talmale.batch2025@sitnagpur.siu.edu.in
38,25070521041,A,KAUSHAL KUMAR,kaushal.kumar.batch2025@sitnagpur.siu.edu.in
39,25070521042,A,BIJWE SEJAL SANJAY,sejal.bijwe.batch2025@sitnagpur.siu.edu.in
40,25070521043,A,KULKARNI ANVITA VIRENDRA,kulkarni.virendra.batch2025@sitnagpur.siu.edu.in
41,25070521044,A,UDAY PATEL,uday.patel.batch2025@sitnagpur.siu.edu.in
42,25070521045,A,RUCHIR SAXENA,ruchir.saxena.batch2025@sitnagpur.siu.edu.in
43,25070521046,A,KHILNANI HEENA VINOD,heena.khilnani.batch2025@sitnagpur.siu.edu.in
44,25070521047,A,KEYURI GAJANAN BUDDHE,keyuri.buddhe.batch2025@sitnagpur.siu.edu.in
45,25070521048,A,NIMJE JANVI  RAJU,janvi.nimje.batch2025@sitnagpur.siu.edu.in
46,25070521049,A,AMEY SHANTANU CHOUDHARI,amey.choudhari.batch2025@sitnagpur.siu.edu.in
47,25070521050,A,UPWANSHI AEKANSH ARVIND,aekansh.upwanshi.batch2025@sitnagpur.siu.edu.in
48,25070521051,A,DAPURKAR HRISHIKESH MAHENDRA,hrishikesh.dapurkar.batch2025@sitnagpur.siu.edu.in
49,25070521052,A,AADITYA GAWARLE,aaditya.gawarle.batch2025@sitnagpur.siu.edu.in
50,25070521053,A,BHENDE VEDANTI JEEVAN,vedanti.bhende.batch2025@sitnagpur.siu.edu.in
51,25070521054,A,SHARAYU JAYANT KATHALKAR,sharayu.kathalkar.batch2025@sitnagpur.siu.edu.in
52,25070521055,A,ARYA PRASHANT KOHAD,arya.kohad.batch2025@sitnagpur.siu.edu.in
53,25070521056,A,VEDANT SHAILESH THOTE,vedant.thote.batch2025@sitnagpur.siu.edu.in
54,25070521057,A,MENDHE OM SHRIDHAR,om.mendhe.batch2025@sitnagpur.siu.edu.in
55,25070521058,A,SUKOLE PRACHI VIJAY,prachi.vijay.batch2025@sitnagpur.siu.edu.in
56,25070521060,A,CHAKOLE VIDHITAM RAVINDRA,vidhitam.chakole.batch2025@sitnagpur.siu.edu.in
57,25070521061,B,WASULE VAISHNAVI PRAVINDADA,vaishnavi.wasule.batch2025@sitnagpur.siu.edu.in
58,25070521062,B,CHIMOTE SUSHUPTI DUSHYANT,sushupti.chimote.batch2025@sitnagpur.siu.edu.in
59,25070521063,B,YASHASH ANIL DAHAT,yashash.dahat.batch2025@sitnagpur.siu.edu.in
60,25070521064,B,ADITYA KOSHTA,aditya.koshta.batch2025@sitnagpur.siu.edu.in
61,25070521065,B,TIWARI SHIVANSH AJAY,shivansh.tiwari.batch2025@sitnagpur.siu.edu.in
62,25070521066,B,PATHAK PAVITRA MANGESH,pavitra.pathak.batch2025@sitnagpur.siu.edu.in
63,25070521067,B,SIDDHI SHAHU,siddhi.shahu.batch2025@sitnagpur.siu.edu.in
64,25070521068,B,NIMESH MARASKOLHA,nimesh.maraskolha.batch2025@sitnagpur.siu.edu.in
65,25070521069,B,DIVYA CHOUDHARY,divya.choudhary.batch2025@sitnagpur.siu.edu.in
66,25070521070,B,ARNAV TULI,arnav.tuli.batch2025@sitnagpur.siu.edu.in
67,25070521071,B,SAAD NEHAL RAJENDRA KUMAR,nehal.saad.batch2025@sitnagpur.siu.edu.in
68,25070521072,B,AARNAV SAHU,aarnav.sahu.batch2025@sitnagpur.siu.edu.in
69,25070521073,B,AAREFA AADIL,aarefa.aadil.batch2025@sitnagpur.siu.edu.in
70,25070521074,B,RADKE NUPUR RAJU,nupur.radke.batch2025@sitnagpur.siu.edu.in
71,25070521075,B,TAYAL VIDUSHI ANIMESH,vidushi.tayal.batch2025@sitnagpur.siu.edu.in
72,25070521076,B,SARODE ANUSHKA RAJESH,anushka.sarode.batch2025@sitnagpur.siu.edu.in
73,25070521077,B,SAATWIK SINHA,saatwik.sinha.batch2025@sitnagpur.siu.edu.in
74,25070521078,B,THAKRE ISHITA RAVINDRA,ishita.thakre.batch2025@sitnagpur.siu.edu.in
75,25070521079,B,SWARANGI SWANAND PATHAK,swarangi.pathak.batch2025@sitnagpur.siu.edu.in
76,25070521080,B,SARANG DIWAKAR MENDHEKAR,sarang.mendhekar.batch2025@sitnagpur.siu.edu.in
77,25070521081,B,MALIWAR GOJEERI PRABHAKAR,gojeeri.maliwar.batch2025@sitnagpur.siu.edu.in
78,25070521082,B,SONKUSARE ANSH SATISH,ansh.sonkusare.batch2025@sitnagpur.siu.edu.in
79,25070521083,B,ATHARVA  SATISH BAND,atharva.band.batch2025@sitnagpur.siu.edu.in
80,25070521084,B,SHREYAS RONGDE,shreyas.rongde.batch2025@sitnagpur.siu.edu.in
81,25070521085,B,JADE SAUMYA SAGAR,saumya.jade.batch2025@sitnagpur.siu.edu.in
82,25070521086,B,THAKRE SWANANDI BHALCHANDRA,swanandi.thakre.batch2025@sitnagpur.siu.edu.in
83,25070521087,B,GIRIJA BAGESH MAHAJAN,girija.mahajan.batch2025@sitnagpur.siu.edu.in
84,25070521088,B,GAIKWAD VANSH RESHIM,vansh.gaikwad.batch2025@sitnagpur.siu.edu.in
85,25070521089,B,PARV PRAVEEN PAHUJA,parv.pahuja.batch2025@sitnagpur.siu.edu.in
86,25070521090,B,BODKHE SHRIRANG BALAJI,shrirang.bodkhe.batch2025@sitnagpur.siu.edu.in
87,25070521091,B,CHUNARKAR PARTH RAJESH,parth.chunarkar.batch2025@sitnagpur.siu.edu.in
88,25070521092,B,SOHAM GOPAL SAMUDRA,soham.samudra.batch2025@sitnagpur.siu.edu.in
89,25070521093,B,MISHRA AVIKUMAR SHIVKUMAR,avikumar.mishra.batch2025@sitnagpur.siu.edu.in
90,25070521094,B,SHOURYAM GARG,shouryam.garg.batch2025@sitnagpur.siu.edu.in
91,25070521095,B,ADVAIT LENIN HANDE,advait.hande.batch2025@sitnagpur.siu.edu.in
92,25070521096,B,ASHWINI JAGDISH TIGDAIYYA,ashwini.tigdaiyya.batch2025@sitnagpur.siu.edu.in
93,25070521097,B,ASWAR VARDHINI SUDHIR,vardhini.aswar.batch2025@sitnagpur.siu.edu.in
94,25070521098,B,ISHRAJ SINGH OSAN,ishraj.singh.batch2025@sitnagpur.siu.edu.in
95,25070521099,B,NTISH PRAVIN THOMBRE,ntish.thombre.batch2025@sitnagpur.siu.edu.in
96,25070521100,B,MURKUTE ANUSHKA AVINASH,anushka.murkute.batch2025@sitnagpur.siu.edu.in
97,25070521101,B,THAWKAR  ISHIKA ARJUN,ishika.thawkar.batch2025@sitnagpur.siu.edu.in
98,25070521102,B,SHREYANSH GAJANAN JADHAO,shreyansh.jadhao.batch2025@sitnagpur.siu.edu.in
99,25070521103,B,JASLEEN KAUR SUDAN,jasleen.sudan.batch2025@sitnagpur.siu.edu.in
100,25070521104,B,PATIL HARSHIT MUKESH,harshit.patil.batch2025@sitnagpur.siu.edu.in
101,25070521105,B,MITHIL SHYAMKANT LANJEWAR,mithil.lanjewar.batch2025@sitnagpur.siu.edu.in
102,25070521106,B,MAITHILI SHARAD DAFALE,maithili.dafale.batch2025@sitnagpur.siu.edu.in
103,25070521107,B,MANASWI GHODE,manaswi.ghode.batch2025@sitnagpur.siu.edu.in
104,25070521108,B,PRAGATI LAXMIKANT SHELKE,pragati.shelke.batch2025@sitnagpur.siu.edu.in
105,25070521109,B,KSHITIJ SUNIL NAGMOTE,kshitij.nagmote.batch2025@sitnagpur.siu.edu.in
106,25070521110,B,MEHAR NUPUR SUNIL,nupur.mehar.batch2025@sitnagpur.siu.edu.in
107,25070521111,B,KASHVI MANISH BALANI,kashvi.balani.batch2025@sitnagpur.siu.edu.in
108,25070521112,B,JIBHAKATE  ATHARVA DEVIDAS,atharva.jibhakate.batch2025@sitnagpur.siu.edu.in
109,25070521113,B,GHOLSE SANIDHYA SUSHIL,sanidhya.gholse.batch2025@sitnagpur.siu.edu.in
110,25070521114,B,PRANSHU PRAVESH MESHRAM,pranshu.meshram.batch2025@sitnagpur.siu.edu.in
111,25070521116,B,TANISHA ARORA,tanisha.arora.batch2025@sitnagpur.siu.edu.in
112,25070521117,B,ATHARVA  BALPANDE,atharva.balpande.batch2025@sitnagpur.siu.edu.in
113,25070521118,B,SHARANNYA SUSHIL GHOLSE,sharannya.gholse.batch2025@sitnagpur.siu.edu.in
114,25070521119,B,ARSHIYA KAYARKAR,arshiya.kayarkar.batch2025@sitnagpur.siu.edu.in
115,25070521121,C,NIDHI ABHIJIT POTLE,nidhi.potle.batch2025@sitnagpur.siu.edu.in
116,25070521122,C,BHAVIK SHRIVASTAV,bhavik.shrivastav.batch2025@sitnagpur.siu.edu.in
117,25070521123,C,RASHI PANKAJ BANGRE,rashi.bangre.batch2025@sitnagpur.siu.edu.in
118,25070521124,C,KUBDE VEDANT VINOD,vedant.kubde.batch2025@sitnagpur.siu.edu.in
119,25070521125,C,LANJEWAR ANWESH HIRALAL,anwesh.lanjewar.batch2025@sitnagpur.siu.edu.in
120,25070521127,C,SOUMYA ATUL SARAF,soumya.saraf.batch2025@sitnagpur.siu.edu.in
121,25070521128,C,NAGDEOTE ARNAV RAMESH,arnav.nagdeote.batch2025@sitnagpur.siu.edu.in
122,25070521129,C,ASHMIT UPADHYAY,ashmit.upadhyay.batch2025@sitnagpur.siu.edu.in
123,25070521130,C,ARYAN RAHUL KAMDI,aryan.kamdi.batch2025@sitnagpur.siu.edu.in
124,25070521131,C,SHINDE SWARUPA GIRIDHARI,swarupa.shinde.batch2025@sitnagpur.siu.edu.in
125,25070521132,C,DEULKAR SHASHWAT RUPESH,shashwat.deulkar.batch2025@sitnagpur.siu.edu.in
126,25070521133,C,BHASHARKAR ABHAAS AMIT,abhaas.bhasharkar.batch2025@sitnagpur.siu.edu.in
127,25070521134,C,NIRMAYEE SUNIL KADAM,nirmayee.kadam.batch2025@sitnagpur.siu.edu.in
128,25070521135,C,GAHANE ARJUN ARVIND,arjun.gahane.batch2025@sitnagpur.siu.edu.in
129,25070521136,C,VANSHIKA,vanshika.sharma.batch2025@sitnagpur.siu.edu.in
130,25070521137,C,MENDHULE ATHARVA DHANANJAY,atharva.mendhule.batch2025@sitnagpur.siu.edu.in
131,25070521139,C,DEVARSH GUPTA,devarsh.gupta.batch2025@sitnagpur.siu.edu.in
132,25070521140,C,VEDANSH KUMAR DWIVEDI,vedansh.dwivedi.batch2025@sitnagpur.siu.edu.in
133,25070521141,C,RODE SWARA SANDEEP,swara.rode.batch2025@sitnagpur.siu.edu.in
134,25070521142,C,SAMRAT SARKAR,samrat.sarkar.batch2025@sitnagpur.siu.edu.in
135,25070521143,C,JAGTAP KULSHREE ARVIND,kulshree.jagtap.batch2025@sitnagpur.siu.edu.in
136,25070521144,C,ROKDE JIYA SAMIR,jiya.rokde.batch2025@sitnagpur.siu.edu.in
137,25070521145,C,IRA HANDA,ira.handa.batch2025@sitnagpur.siu.edu.in
138,25070521146,C,KARTIK SACHIN JAURKAR,kartik.jaurkar.batch2025@sitnagpur.siu.edu.in
139,25070521147,C,SHRUTI MANOJ KAMNANI,shruti.kamnani.batch2025@sitnagpur.siu.edu.in
140,25070521148,C,AWACHAT VEDANT RAJU,vedant.awachat.batch2025@sitnagpur.siu.edu.in
141,25070521149,C,SINGH SAURABH ANIL KUMAR,saurabh.singh.batch2025@sitnagpur.siu.edu.in
142,25070521151,C,MARGHADE ADITYA ARUN,aditya.marghade.batch2025@sitnagpur.siu.edu.in
143,25070521152,C,SHYON ANIL DHOBLE,shyon.dhoble.batch2025@sitnagpur.siu.edu.in
144,25070521153,C,BHAVIK KHOBRAGADE,bhavik.khobragade.batch2025@sitnagpur.siu.edu.in
145,25070521154,C,VEDANTI MUKESH TATTE,vedanti.tatte.batch2025@sitnagpur.siu.edu.in
146,25070521155,C,HETAL PATIL,hetal.patil.batch2025@sitnagpur.siu.edu.in
147,25070521156,C,SOUMYA KAMLESH MISHRA,soumya.mishra.batch2025@sitnagpur.siu.edu.in
148,25070521157,C,KANHAIYA TYAGI,kanhaiya.tyagi.batch2025@sitnagpur.siu.edu.in
149,25070521158,C,RAJKOTIYA AASTHA KALPESH,aastha.rajkotiya.batch2025@sitnagpur.siu.edu.in
150,25070521159,C,WANKHEDE PARTH HANSRAJ,parth.wankhede.batch2025@sitnagpur.siu.edu.in
151,25070521160,C,WATH ARYA ASHISH,arya.wath.batch2025@sitnagpur.siu.edu.in
152,25070521161,C,JIBHAKATE NAKUL RAJENDRA,nakul.jibhakate.batch2025@sitnagpur.siu.edu.in
153,25070521162,C,SANJYOT RAMESH INGOLE,sanjyot.ingole.batch2025@sitnagpur.siu.edu.in
154,25070521163,C,MOHD AMAAN MOHD ANIS BHURANI,amaan.bhurani.batch2025@sitnagpur.siu.edu.in
155,25070521164,C,SOHAM VIJAY PARKHI,soham.parkhi.batch2025@sitnagpur.siu.edu.in
156,25070521165,C,OM KISHOR MAHAJAN,om.mahajan.batch2025@sitnagpur.siu.edu.in
157,25070521166,C,KOHALE ANUSHREE ABHAY,anushree.kohale.batch2025@sitnagpur.siu.edu.in
158,25070521167,C,YASHWARDHAN RAJENDRA CHOURASIA,yashwardhan.chourasia.batch2025@sitnagpur.siu.edu.in
159,25070521169,C,ADWAIT ATUL SHELARE,adwait.shelare.batch2025@sitnagpur.siu.edu.in
160,25070521170,C,KASHIKAR OM SHYAM,om.kashikar.batch2025@sitnagpur.siu.edu.in
161,25070521171,C,GIRADE SHREYASH WANIRAM,shreyash.girade.batch2025@sitnagpur.siu.edu.in
162,25070521172,C,PRANJAL MOHAN HEDAU,pranjal.hedau.batch2025@sitnagpur.siu.edu.in
163,25070521173,C,CHAITANYA SONI,chaitanya.soni.batch2025@sitnagpur.siu.edu.in
164,25070521174,C,CHANDAK YASH GIRISH,yash.chandak.batch2025@sitnagpur.siu.edu.in
165,25070521175,C,RIDDHIMA DNYANESHWAR BAWANE,riddhima.bawane.batch2025@sitnagpur.siu.edu.in
166,25070521176,C,KHODE VED SAGAR,ved.khode.batch2025@sitnagpur.siu.edu.in
167,25070521177,C,VAISHNAVI KANTODE,vaishnavi.kantode.batch2025@sitnagpur.siu.edu.in
168,25070521178,C,VIJAYVARGIYA HIRAL ASHISH,hiral.vijayvargiya.batch2025@sitnagpur.siu.edu.in
169,25070521179,C,HARSH GHAOGHAVE,harsh.ghaoghave.batch2025@sitnagpur.siu.edu.in
170,25070521180,C,ARYAN ROHIT SHEGOKAR,aryan.shegokar.batch2025@sitnagpur.siu.edu.in
171,25070521181,D,SIMRAT SINGH ARORA,simrat.arora.batch2025@sitnagpur.siu.edu.in
172,25070521182,D,MAYANK MANOJ NINAWE,mayank.ninawe.batch2025@sitnagpur.siu.edu.in
173,25070521183,D,PHALKEY CHITRANSH PRAHLAD,chitransh.phalkey.batch2025@sitnagpur.siu.edu.in
174,25070521184,D,MOHITE ANIKA YOGESH,anika.mohite.batch2025@sitnagpur.siu.edu.in
175,25070521185,D,NEHAL BUXY,nehal.buxy.batch2025@sitnagpur.siu.edu.in
176,25070521186,D,ADHYAYAN SONARE,adhyayan.sonare.batch2025@sitnagpur.siu.edu.in
177,25070521187,D,AVANTIKA SINGH,avantika.singh.batch2025@sitnagpur.siu.edu.in
178,25070521188,D,SAMARTH CHAWLA,samarth.chawla.batch2025@sitnagpur.siu.edu.in
179,25070521189,D,PRADUM GIRIDHAR MESHRAM,pradum.meshram.batch2025@sitnagpur.siu.edu.in
180,25070521190,D,VIRAJ AJAY KOLHE,viraj.kolhe.batch2025@sitnagpur.siu.edu.in
181,25070521191,D,VEDANT WASUDEO TARARE,vedant.tarare.batch2025@sitnagpur.siu.edu.in
182,25070521192,D,VAIRAGADE ANSHUL ANIL,anshul.vairagade.batch2025@sitnagpur.siu.edu.in
183,25070521193,D,KHADSE RATISHA SATISH,ratisha.khadse.batch2025@sitnagpur.siu.edu.in
184,25070521194,D,RAJ SHEKHAR SHUKLA,raj.shukla.batch2025@sitnagpur.siu.edu.in
185,25070521195,D,PIYUSH KUNDAN DEKATE,piyush.dekate.batch2025@sitnagpur.siu.edu.in
186,25070521196,D,VEDANT SINGH,vedant.singh.batch2025@sitnagpur.siu.edu.in
187,25070521198,D,NERKAR  ADITYA PRAVIN,aditya.nerkar.batch2025@sitnagpur.siu.edu.in
188,25070521199,D,MANGLE ANTARA MANISH,antara.mangle.batch2025@sitnagpur.siu.edu.in
189,25070521200,D,GUPTA KASHTI NIRAJ,kashti.gupta.batch2025@sitnagpur.siu.edu.in
190,25070521201,D,DHRUV BHONDE,dhruv.bhonde.batch2025@sitnagpur.siu.edu.in
191,25070521202,D,TEJAS ASHOK MAHURKAR,tejas.mahurkar.batch2025@sitnagpur.siu.edu.in
192,25070521203,D,ANSHUL NAPHADE,anshul.naphade.batch2025@sitnagpur.siu.edu.in
193,25070521204,D,KALAMBE LEKHIT SEWANAND,lekhit.kalambe.batch2025@sitnagpur.siu.edu.in
194,25070521206,D,SHREYAS AVINASH GAJBHIYE,shreyas.gajbhiye.batch2025@sitnagpur.siu.edu.in
195,25070521207,D,SAHIL MAHURE,sahil.mahure.batch2025@sitnagpur.siu.edu.in
196,25070521208,D,AGRAWAL KHUSHI HARIOM,khushi.agrawal.batch2025@sitnagpur.siu.edu.in
197,25070521209,D,ATHARVA GHODKI,atharva.ghodki.batch2025@sitnagpur.siu.edu.in
198,25070521210,D,AYUSHI ANUP GHOSH,ayushi.ghosh.batch2025@sitnagpur.siu.edu.in
199,25070521211,D,AYUSH NITIN DEHANKAR,ayush.dehankar.batch2025@sitnagpur.siu.edu.in
200,25070521212,D,YADAV ANIMESH SHAILESH,animesh.yadav.batch2025@sitnagpur.siu.edu.in
201,25070521213,D,CHIRANSHU VISHWAS SOMKUWAR,chiranshu.somkuwar.batch2025@sitnagpur.siu.edu.in
202,25070521214,D,DONGRE ARYASMIT PRASENJIT,aryasmit.dongre.batch2025@sitnagpur.siu.edu.in
203,25070521215,D,ARYAN TUSHAR MARGHADE,aryan.marghade.batch2025@sitnagpur.siu.edu.in
204,25070521217,D,ARMAN GUPTA,arman.gupta.batch2025@sitnagpur.siu.edu.in
205,25070521218,D,CHANDNI KAMLESH AMESAR,chandni.amesar.batch2025@sitnagpur.siu.edu.in
206,25070521219,D,PATIL KARTIKA SUNIL,kartika.patil.batch2025@sitnagpur.siu.edu.in
207,25070521220,D,OM MANISH RAI,om.rai.batch2025@sitnagpur.siu.edu.in
208,25070521221,D,SAKSHAM RAJKUMAR WADHANKAR,saksham.wadhankar.batch2025@sitnagpur.siu.edu.in
209,25070521222,D,KANHERE RAJAT DHARAMRAJ,rajat.kanhere.batch2025@sitnagpur.siu.edu.in
210,25070521223,D,RAUT RISHABH RAM,rishabh.raut.batch2025@sitnagpur.siu.edu.in
211,25070521224,D,MANASWI SUJIT BUTLE,manaswi.butle.batch2025@sitnagpur.siu.edu.in
212,25070521225,D,UJJWAL JUMANI,ujjwal.jumani.batch2025@sitnagpur.siu.edu.in
213,25070521226,D,MANAS DEVENDRA BAIS,manas.bais.batch2025@sitnagpur.siu.edu.in
214,25070521227,D,SHELKE ARCHIT KEWALRAM,archit.shelke.batch2025@sitnagpur.siu.edu.in
215,25070521228,D,ADITYA DHARMVIR SINGH,aditya.singh.batch2025@sitnagpur.siu.edu.in
216,25070521229,D,YASHASHRI GAJANAN MENDHULKAR,yashashri.mendhulkar.batch2025@sitnagpur.siu.edu.in
217,25070521230,D,SAMAIRA KALE,samaira.kale.batch2025@sitnagpur.siu.edu.in
218,25070521231,D,SUPARSHW NATWARLAL RINAYATE,suparshw.rinayate.batch2025@sitnagpur.siu.edu.in
219,25070521233,D,NIHAR SANJEEV ILAME,nihar.ilame.batch2025@sitnagpur.siu.edu.in
220,25070521234,D,PRANJAL CHOUDHARY,pranjal.choudhary.batch2025@sitnagpur.siu.edu.in
221,25070521235,D,MUGDHA CHUNNE,mugdha.chunne.batch2025@sitnagpur.siu.edu.in
222,25070521236,D,SIDDHI GHANSHYAM TIMKHEDE,siddhi.timkhede.batch2025@sitnagpur.siu.edu.in
223,25070521237,D,VINEET GADHWAL,vineet.gadhwal.batch2025@sitnagpur.siu.edu.in
224,25070521238,D,ATHARVA SINGH DAMNIYA,atharva.damniya.batch2025@sitnagpur.siu.edu.in
225,25070521239,D,MANTHAN CHANDRASHEKHAR BAWANE,manthan.bawane.batch2025@sitnagpur.siu.edu.in
226,25070521240,D,SHREYANSH SHIRBHATE,shreyansh.shirbhate.batch2025@sitnagpur.siu.edu.in
227,25070521241,E,PISE PRAVINYA VINAYAK,pravinya.pise.batch2025@sitnagpur.siu.edu.in
228,25070521242,E,DIVYANSHU NIRANJAN SAOJI,divyanshu.saoji.batch2025@sitnagpur.siu.edu.in
229,25070521243,E,SHOBHITSINGH CHOUHAN,shobhitsingh.chouhan.batch2025@sitnagpur.siu.edu.in
230,25070521244,E,GUPTA ASHMIT,ashmit.gupta.batch2025@sitnagpur.siu.edu.in
231,25070521245,E,SUMEDHA JAYESH VANERKAR,sumedha.vanerkar.batch2025@sitnagpur.siu.edu.in
232,25070521246,E,THORAT RIDDHI PRASANNA,riddhi.thorat.batch2025@sitnagpur.siu.edu.in
233,25070521247,E,ADKINE ADVAIT PRASHANT,advait.adkine.batch2025@sitnagpur.siu.edu.in
234,25070521248,E,KAMANI MOHMAD HANAIN MOHMAD ABID,mohmad.kamani.batch2025@sitnagpur.siu.edu.in
235,25070521249,E,CHAITANYA VINOD KHONDE,chaitanya.khonde.batch2025@sitnagpur.siu.edu.in
236,25070521250,E,GULAM MOHIDDIN KHAN,gulam.khan.batch2025@sitnagpur.siu.edu.in
237,25070521251,E,SUGANDH NEHAL SHANKAR,nehal.sugandh.batch2025@sitnagpur.siu.edu.in
238,25070521252,E,HARSHITA VINAYAK RETAR,harshita.retar.batch2025@sitnagpur.siu.edu.in
239,25070521253,E,DHABARDE ANGEL PARAS,angel.dhabarde.batch2025@sitnagpur.siu.edu.in
240,25070521254,E,SUHASH SURESH KAWADE,suhash.kawade.batch2025@sitnagpur.siu.edu.in
241,25070521255,E,DHAMANKAR ANUJ VIJAY,anuj.dhamankar.batch2025@sitnagpur.siu.edu.in
242,25070521256,E,SHEIKH ADIBA ASIF,adiba.sheikh.batch2025@sitnagpur.siu.edu.in
243,25070521257,E,SAYAM  KRRISHRAJ AJAYRAJ,krrishraj.sayam.batch2025@sitnagpur.siu.edu.in
244,25070521258,E,KADU AVANEESH VIJAY,avaneesh.kadu.batch2025@sitnagpur.siu.edu.in
245,25070521259,E,ALAYNA AHMAD ANSARI,alayna.ansari.batch2025@sitnagpur.siu.edu.in
246,25070521260,E,BRAMHANKAR SANSKRUTI SANJAY,sanskruti.bramhankar.batch2025@sitnagpur.siu.edu.in
247,25070521261,E,BHAVESH GRISH BAJAPYEE,bhavesh.bajapyee.batch2025@sitnagpur.siu.edu.in
248,25070521262,E,GAURI MAHESH NIKULE,mahesh.gauri.batch2025@sitnagpur.siu.edu.in
249,25070521263,E,DHEER MESHRAM,dheer.meshram.batch2025@sitnagpur.siu.edu.in
250,25070521264,E,BALSARAF VEDANT SUNIL,vedant.balsaraf.batch2025@sitnagpur.siu.edu.in
251,25070521265,E,YASH CHANDRASHEKHAR GAJBHIYE,yash.gajbhiye.batch2025@sitnagpur.siu.edu.in
252,25070521266,E,NISHIKA SUMER KALAMKAR,nishika.kalamkar.batch2025@sitnagpur.siu.edu.in
253,25070521268,E,JANVI PATIL,janvi.patil.batch2025@sitnagpur.siu.edu.in
254,25070521269,E,BANGALE PARIJAAT PRADIP,parijaat.bangale.batch2025@sitnagpur.siu.edu.in
255,25070521270,E,ASHMIT ANIL WAGHMARE,ashmit.waghmare.batch2025@sitnagpur.siu.edu.in
256,25070521271,E,AKHATKAR HIMANSHU CHANDRAKANT,himanshu.akhatkar.batch2025@sitnagpur.siu.edu.in
257,25070521272,E,NIKHIL JOSHUA SAMUEL,nikhil.joshua.batch2025@sitnagpur.siu.edu.in
258,25070521273,E,ARYAN KHOBRAGADE,aryan.khobragade.batch2025@sitnagpur.siu.edu.in
259,25070521274,E,TIWARI  PARTH PARAG,parth.tiwari.batch2025@sitnagpur.siu.edu.in
260,25070521275,E,RATHI SAAVI VIJAY,saavi.rathi.batch2025@sitnagpur.siu.edu.in
261,25070521276,E,ANAGH FATING,anagh.fating.batch2025@sitnagpur.siu.edu.in
262,25070521277,E,MAHAK SANJAY DHANVIJAY,mahak.dhanvijay.batch2025@sitnagpur.siu.edu.in
263,25070521278,E,BODKHE TRISHIT SUNIL,trishit.bodkhe.batch2025@sitnagpur.siu.edu.in
264,25070521279,E,AANYA AJIT MISHRA,aanya.mishra.batch2025@sitnagpur.siu.edu.in
265,25070521280,E,SAHILKUMAR,sahil.kumar.batch2025@sitnagpur.siu.edu.in
266,25070521281,E,NISHAD CHANDRABHAN TEMBHURNEKAR,nishad.tembhurnekar.batch2025@sitnagpur.siu.edu.in
267,25070521282,E,TANMAY NIMPURE,tanmay.nimpure.batch2025@sitnagpur.siu.edu.in
268,25070521283,E,PADMAJA EKANT THAKRE,padmaja.thakre.batch2025@sitnagpur.siu.edu.in
269,25070521284,E,AARSH TABHANE,aarsh.tabhane.batch2025@sitnagpur.siu.edu.in
270,25070521285,E,DHANSHREE SURENDRA SARODE,dhanshree.sarode.batch2025@sitnagpur.siu.edu.in
271,25070521286,E,ADITYA DEEPAK WANJARI,aditya.wanjari.batch2025@sitnagpur.siu.edu.in
272,25070521287,E,DEVANSHI ASHISH LAKHE,devanshi.lakhe.batch2025@sitnagpur.siu.edu.in
273,25070521288,E,BUTLE SHREYA PRASHANT,shreya.butle.batch2025@sitnagpur.siu.edu.in
274,25070521289,E,CHOURASIA SHLOK SUSHIL KUMAR,shlok.chourasia.batch2025@sitnagpur.siu.edu.in
275,25070521290,E,AYUSH MAHESH KHADSE,ayush.khadse.batch2025@sitnagpur.siu.edu.in
276,25070521291,E,SAMEER PURUSHOTTAM KARADBHAJNE,sameer.karadbhajne.batch2025@sitnagpur.siu.edu.in
277,25070521292,E,GHORDADEKAR PURVA HITENDRA,purva.ghordadekar.batch2025@sitnagpur.siu.edu.in
278,25070521293,E,KHOBRAGADE NIDHHI HITESH,nidhhi.khobragade.batch2025@sitnagpur.siu.edu.in
279,25070521294,E,SATPUTE KIRAN GANESH,kiran.satpute.batch2025@sitnagpur.siu.edu.in
280,25070521295,E,PARTH RAVI PALANDURKAR,parth.palandurkar.batch2025@sitnagpur.siu.edu.in
281,25070521296,E,SWARAJ MENDHE,swaraj.mendhe.batch2025@sitnagpur.siu.edu.in
282,25070521297,E,GAWANDE MISHTI PRAKASH,mishti.gawande.batch2025@sitnagpur.siu.edu.in
283,25070521298,E,SOUMYA PRATIN FAYE,soumya.faye.batch2025@sitnagpur.siu.edu.in
284,25070521300,E,HARDIK BHASME,hardik.bhasme.batch2025@sitnagpur.siu.edu.in
285,25070521301,F,ARCHIT SHARMA,archit.sharma.batch2025@sitnagpur.siu.edu.in
286,25070521302,F,DUGANE SARVESH SUDHAKAR,sarvesh.dugane.batch2025@sitnagpur.siu.edu.in
287,25070521303,F,CHAKOLE TANVI ISHWAR,tanvi.chakole.batch2025@sitnagpur.siu.edu.in
288,25070521304,F,PATIL SAGAR RAKESH,sagar.patil.batch2025@sitnagpur.siu.edu.in
289,25070521305,F,VEDANSH KUMAR AGRAWAL,vedansh.agrawal.batch2025@sitnagpur.siu.edu.in
290,25070521306,F,ANUSHKA NANDLAL JUNGHARE,anushka.junghare.batch2025@sitnagpur.siu.edu.in
291,25070521307,F,MOTGHARE ARYAN MAHENDRA,aryan.motghare.batch2025@sitnagpur.siu.edu.in
292,25070521308,F,GULHANE TANAY VIJAY,tanay.gulhane.batch2025@sitnagpur.siu.edu.in
293,25070521309,F,VANSHIKA GANGWANI,vanshika.gangwani.batch2025@sitnagpur.siu.edu.in
294,25070521310,F,NOORANI SUHAN ADNAN,suhan.noorani.batch2025@sitnagpur.siu.edu.in
295,25070521311,F,RAJVARDHAN RAJESH FUKEY,rajvardhan.fukey.batch2025@sitnagpur.siu.edu.in
296,25070521312,F,ISHANT SHRINIVAS HUKARE,ishant.hukare.batch2025@sitnagpur.siu.edu.in
297,25070521313,F,TEKADE SOHAM SUNIL,soham.tekade.batch2025@sitnagpur.siu.edu.in
298,25070521314,F,SIDDHESH VIKRANTSINGH THAKUR,siddhesh.thakur.batch2025@sitnagpur.siu.edu.in
299,25070521315,F,MOREY OJAS PRASHANT,ojas.morey.batch2025@sitnagpur.siu.edu.in
300,25070521316,F,DESHMUKH AMISH NARENDRA,amish.deshmukh.batch2025@sitnagpur.siu.edu.in
301,25070521317,F,SHENDE DEVANGSHISH RITESH,devangshish.shende.batch2025@sitnagpur.siu.edu.in
302,25070521318,F,MADNE PARTH UMESH,parth.madne.batch2025@sitnagpur.siu.edu.in
303,25070521319,F,PARATE PALAK HARISH,palak.parate.batch2025@sitnagpur.siu.edu.in
304,25070521320,F,NIMJE SNEHIT ANIL,snehit.nimje.batch2025@sitnagpur.siu.edu.in
305,25070521321,F,RATNAPARKHI UTKARSH SACHIN,utkarsh.ratnaparkhi.batch2025@sitnagpur.siu.edu.in
306,25070521322,F,PRIYANKA NARESH WANJARI,priyanka.wanjari.batch2025@sitnagpur.siu.edu.in
307,25070521323,F,BELE SARANG VIJAY,sarang.bele.batch2025@sitnagpur.siu.edu.in
308,25070521324,F,JAIN SHUBH NILIND,shubh.jain.batch2025@sitnagpur.siu.edu.in
309,25070521325,F,PAWAR JAGRUT DIPAK,jagrut.pawar.batch2025@sitnagpur.siu.edu.in
310,25070521326,F,SHUBH GAVNEKAR,shubh.gavnekar.batch2025@sitnagpur.siu.edu.in
311,25070521327,F,WANGE KRUPACHARYA PUNDLIK,krupacharya.wange.batch2025@sitnagpur.siu.edu.in
312,25070521328,F,MOHAMMAD OWAIS KALIM HANIFI,owais.hanifi.batch2025@sitnagpur.siu.edu.in
313,25070521330,F,HARSHITA KANWAR,harshita.kanwar.batch2025@sitnagpur.siu.edu.in
314,25070521331,F,YADAV PRINCE PRADEEP KUMAR,prince.yadav.batch2025@sitnagpur.siu.edu.in
315,25070521332,F,BHUTE RAJESHWARI NARENDRA,harshita.kanwar.batch2025@sitnagpur.siu.edu.in
316,25070521333,F,SARSEWAR RANVEER JAYESH,ranveer.sarsewar.batch2025@sitnagpur.siu.edu.in
317,25070521334,F,DISHA NITYANAND LANGOTE,disha.langote.batch2025@sitnagpur.siu.edu.in
318,25070521335,F,BESEKAR SPARSH PRAJACT,sparsh.besekar.batch2025@sitnagpur.siu.edu.in
319,25070521338,F,YASHASVI YADAV,yashasvi.yadav.batch2025@sitnagpur.siu.edu.in
320,25070521339,F,SHEIKH AYAN ABDUL WASEEM,ayan.sheikh.batch2025@sitnagpur.siu.edu.in
321,25070521340,F,SARVESH S CHONDE,sarvesh.chonde.batch2025@sitnagpur.siu.edu.in
322,25070521341,F,KUNTHE PRADYUMNA SACHIN,pradyumna.kunthe.batch2025@sitnagpur.siu.edu.in
323,25070521342,F,ANAGHA YENORKAR,anagha .yenorkar.batch2025@sitnagpur.siu.edu.in
324,25070521343,F,SHAIREY LAVANYA DHAVAL,lavanya.shairey.batch2025@sitnagpur.siu.edu.in
325,25070521344,F,KHUSHAL PRADIP UMRATKAR,khushal.umratkar.batch2025@sitnagpur.siu.edu.in
326,25070521345,F,MOHIT DILIP KHANDAL,mohit.khandal.batch2025@sitnagpur.siu.edu.in
327,25070521346,F,TELMORE HARSH SACHIN,harsh.telmore.batch2025@sitnagpur.siu.edu.in
328,25070521347,F,PRABHAT KUMAR PANDEY,prabhat.pandey.batch2025@sitnagpur.siu.edu.in
329,25070521348,F,AJABALE SEJAL SUBHASH,sejal.ajbale.batch2025@sitnagpur.siu.edu.in
330,25070521349,F,ANURAG MISHRA,anurag.mishra.batch2025@sitnagpur.siu.edu.in
`;

// Also parents email mapping from Sem II
const parentsEmailMapping = {
  "25070521001": "spv912@gmail.com",
  "25070521002": "pankaj.shende@gmail.com",
  "25070521004": "harithasj5678@gmail.com",
  "25070521005": "sundaramchakrapani79@gmail.com",
  "25070521006": "kothapandurangarao81@gmail.com",
  "25070521007": "sunilkeerthi2011@gmail.com",
  "25070521008": "jatin.pahuja01@gmail.com",
  "25070521009": "sunilganatra@gmail.com",
  "25070521010": "pramodmukwane06@gmail.com",
  "25070521011": "aliparvez69@gmail.com",
  "25070521012": "moreshsuryawanshi71@gmail.com",
  "25070521013": "abhangjadhav751@gmail.com",
  "25070521014": "acmankar258@gmail.com",
  "25070521015": "sirsurjuse@gmail.com",
  "25070521016": "rishigd2003@gmail.com",
  "25070521017": "kalej4548@gmail.com",
  "25070521019": "kindarle1973@gmail.com",
  "25070521020": "palashdekate98@gmail.com",
  "25070521021": "samriddhikumari039@gmail.com",
  "25070521023": "ritviksatvikram@gmail.com",
  "25070521024": "dhage.raju26@gmail.com",
  "25070521025": "TukeshDawale@gmail.com",
  "25070521026": "tm272007@gmail.com",
  "25070521027": "vshal.wasekar@gmail.com",
  "25070521028": "sumitpol234@gmail.com",
  "25070521029": "savanitours@gmail.com",
  "25070521030": "rakeshsingh03011981@gmail.com",
  "25070521031": "manojsinghrmlau@gmail.com",
  "25070521032": "shankark01@yahoo.in",
  "25070521033": "dineshagrawal68@gmail.com",
  "25070521034": "makrand.jag@gmail.com",
  "25070521035": "rc882159@gmail.com",
  "25070521036": "aprai1979@gmail.com",
  "25070521037": "sudhirhadge45@gmail.com",
  "25070521038": "ashokseerwani@gmail.com",
  "25070521039": "dattagadiwan0355@gmail.com",
  "25070521040": "kishor.talmale111@gmail.com",
  "25070521041": "kkv804419@gmail.com",
  "25070521042": "gouriputralanddev@gmail.com",
  "25070521043": "virenkul@gmail.com",
  "25070521044": "lalitpatel1982@gmail.com",
  "25070521045": "rajeevsaxena@yahoo.com",
  "25070521046": "vinodkhilnani19@gmail.com",
  "25070521047": "gajananbuddhe@gmail.com",
  "25070521048": "nimje0519@gmail.com",
  "25070521049": "shandent1@gmail.com",
  "25070521050": "upwanshiarvind77@gmail.com",
  "25070521051": "mahendrapdapurkar.md@gmail.com",
  "25070521052": "prakashgawarle72@gmail.com",
  "25070521053": "jivanbhende505@gmail.com",
  "25070521054": "jayantkat1@gmail.com",
  "25070521055": "pkohad@indianoil.in",
  "25070521056": "thoteshailesh85@gmail.com",
  "25070521057": "shridhar8237@gmail.com",
  "25070521058": "vnsukole@gmail.com",
  "25070521060": "ravindrachakole110@gmail.com",
  "25070521061": "pmwasule@gmail.com",
  "25070521062": "dchimote@yahoo.co.in",
  "25070521063": "anildahat12@gmail.com",
  "25070521064": "koshtaladoamit@gmail.com",
  "25070521065": "ajayt2023@gmail.com",
  "25070521066": "mangeshpathak77@gmail.com",
  "25070521067": "sachin.shahu987@gmail.com",
  "25070521068": "nishantmaraskolhe8@gmail.com",
  "25070521069": "choudharyssmla@gmail.com",
  "25070521070": "bintyt@yahoo.co.in",
  "25070521071": "rksaad1975@rediffmail.com",
  "25070521072": "vinodranbaxy@gmail.com",
  "25070521073": "aadilzoeb@gmail.com",
  "25070521074": "rajuradke@gmail.com",
  "25070521075": "animesh9777@gmail.com",
  "25070521076": "errajeshdsarode@yahoo.co.in",
  "25070521077": "ajaykumarsinha372@gmail.com",
  "25070521078": "ravithakre7022@gmail.com",
  "25070521079": "swanandspathak@yahoo.com",
  "25070521080": "dcmendhekar@gmail.com",
  "25070521081": "prabhakarmaliwar@gmail.com",
  "25070521082": "sonkusare.satish1@gmail.com",
  "25070521083": "kararebharati@gmail.com",
  "25070521084": "sharad.rongde@gmail.com",
  "25070521085": "banteharsha123@gmail.com",
  "25070521086": "bhalthakre1974@gmail.com",
  "25070521087": "bageshmahajan@gmail.com",
  "25070521088": "reshimgykwad@gmail.com",
  "25070521089": "praveenpahuja007@gmail.com",
  "25070521090": "abhaybodkhe@gmail.com",
  "25070521092": "rajasamudra4471@gmail.com",
  "25070521093": "shivm416@gmail.com",
  "25070521094": "jbpskc@gmail.com",
  "25070521095": "leninhande@gmail.com",
  "25070521096": "jagdishtigdaiyya01@gmail.com",
  "25070521097": "aswar.sudhir@gmail.com",
  "25070521098": "mpsosan@gmail.com",
  "25070521099": "pravin.thombre70@gmail.com",
  "25070521100": "avinashmurkute1979@gmail.com",
  "25070521101": "arjunthawkar123@gmail.com",
  "25070521103": "harmeet71@yahoo.com",
  "25070521104": "mukeshpatil9666@gmail.com",
  "25070521105": "shyamkant333369@gmail.com",
  "25070521106": "dafale_sharad@yahoo.co.in",
  "25070521107": "ghodemanaswi@gmail.com",
  "25070521108": "laxmikantshelke1978@gmail.com",
  "25070521109": "sunilnagmote24@gmail.com",
  "25070521110": "pranaydhopte7721@gmail.com",
  "25070521111": "mbalani29@gmail.com",
  "25070521112": "devidasjibhakate67@gmail.com",
  "25070521113": "sheetal.gholse@gmail.com",
  "25070521114": "praveshdeep@gmail.com",
  "25070521116": "rohitarora3008@gmail.com",
  "25070521117": "sachinbalpande76@gmail.com",
  "25070521118": "sheetal.gholse@gmail.com",
  "25070521119": "prashant_2610@rediffmail.com",
  "25070521121": "abhijeetpotle@gmail.com",
  "25070521122": "shrivas.nitin@gmail.com",
  "25070521123": "tinabangre39@gmail.com",
  "25070521124": "vinodkubde801@gmail.com",
  "25070521125": "gitanjalilanjewar123@gmail.com",
  "25070521127": "atulsaraf04@gmail.com",
  "25070521128": "rrnagdeote@gmail.com",
  "25070521129": "DPOOJA2ASHMIT@GMAIL.COM",
  "25070521130": "rahulkamdi@yahoo.com",
  "25070521131": "bs266937@gmail.com",
  "25070521133": "amit.bhasharkar@gmail.com",
  "25070521134": "ssunil_kadam@rediffmail.com",
  "25070521135": "arvindgahane1972@gmail.com",
  "25070521136": "sandeep.s2775@gmail.com",
  "25070521137": "mendhuledhananjay@gmail.com",
  "25070521139": "infracomputer@rediffmail.com",
  "25070521140": "surajdubey1058@gmail.com",
  "25070521141": "sandeep.sr2007@rediffmail.com",
  "25070521142": "shantanu.sarkar@licindia.com",
  "25070521143": "arvindjagtap240@gmail.com",
  "25070521144": "samir.rokde@gmail.com",
  "25070521145": "vineethanda2201@gmail.com",
  "25070521146": "sachin.jaurkar@gmail.com",
  "25070521147": "manojkamlani138@gmail.com",
  "25070521148": "rajuawachat99@gmail.com",
  "25070521149": "absingh30772@gmail.com",
  "25070521151": "arunmarghade@gmail.com",
  "25070521152": "anildhoble9@gmail.com",
  "25070521153": "vijayrajni.ak@gmail.com",
  "25070521154": "mukesh_tatte@rediffmail.com",
  "25070521155": "anilpatilngp75@gmail.com",
  "25070521156": "anjalimishra2209@gmail.com",
  "25070521157": "drsktyagi7@gmail.com",
  "25070521158": "kalpraj2005@gmail.com",
  "25070521159": "wankhedeprajwal11@gmail.com",
  "25070521160": "ashishgwath30@gmail.com",
  "25070521161": "chakolekrunal@gmail.com",
  "25070521162": "rameshingole1965@gmail.com",
  "25070521163": "bhuranianis@gmail.com",
  "25070521165": "kishormahajan054@gmail.com",
  "25070521166": "abhaykohale@gmail.com",
  "25070521167": "chourasia351@gmail.com",
  "25070521169": "atulshelare@gmail.com",
  "25070521170": "rajeshdeogade1111@gmail.com",
  "25070521171": "shravanigirde13@gmail.com",
  "25070521172": "mohanhedau78@gmail.com",
  "25070521173": "bhavinpl.16@gmail.com",
  "25070521174": "chandakgirish858@gmail.com",
  "25070521175": "dnaneshwar9@gmail.com",
  "25070521176": "vedkhode14@gmail.com",
  "25070521177": "nbkantode@gmail.com",
  "25070521178": "Ashish.p.vijay@gmail.com",
  "25070521179": "anturkararchana1984@gmail.com",
  "25070521180": "rohitshegaonkar@gmail.com",
  "25070521181": "gursim81@gmail.com",
  "25070521182": "mayankninawe2@gmail.com",
  "25070521183": "prahladphalkey@gmail.com",
  "25070521184": "annapurnaoffset2@gmail.com",
  "25070521185": "nitesh.buxy@gmail.com",
  "25070521186": "taichairman@gmail.com",
  "25070521187": "lalshivaditya@gmail.com",
  "25070521188": "jeetendra_ngp@rediffmail.com",
  "25070521189": "tanayyameshram18@gmail.com",
  "25070521190": "ajay.kolhe4@gmail.com",
  "25070521191": "vedantytacc1@gmail.com",
  "25070521192": "vairagadeanil6@gmail.com",
  "25070521193": "satishkharshe456@gmail.com",
  "25070521194": "vineet.shukla@live.com",
  "25070521195": "kundan130576@gmail.com",
  "25070521196": "salesadison8@gmail.com",
  "25070521198": "psnerkar3@gmail.com",
  "25070521199": "manishmangle22@gmail.com",
  "25070521200": "autopointngp@gmail.com",
  "25070521201": "yuvraj.bhonde@rediff.com",
  "25070521202": "ashokmahurkar1980@gmail.com",
  "25070521203": "atuladam78@gmail.com",
  "25070521204": "swaroop.s.k5@gmail.com",
  "25070521206": "avinashjee1969@gmail.com",
  "25070521207": "sanjaymahure2@gmail.com",
  "25070521208": "agromktinfo@gmail.com",
  "25070521209": "kailash45ghodki.kg@gmail.com",
  "25070521210": "sales@ayushienterprises.com",
  "25070521211": "dehankardnitin@gmail.com",
  "25070521212": "animeshyadav149@gmail.com",
  "25070521213": "vsomkuwar1973@gmail.com",
  "25070521214": "prasenjitdongre4132@gmail.com",
  "25070521215": "tusharmarghade@gmail.com",
  "25070521217": "anmolgupta1872@gmail.com",
  "25070521218": "kamleshamesar36@gmail.com",
  "25070521219": "sunilptl98@gmail.com",
  "25070521220": "manishrai3rcn@gmail.com",
  "25070521221": "umesh_wadhankar@yahoo.co.in",
  "25070521222": "kanhere.dharmaraj@gmail.com",
  "25070521223": "personar.crs@gmail.com",
  "25070521224": "sujit.butle@gmail.com",
  "25070521225": "hiteshjumani32@gmail.com",
  "25070521226": "newginniworld@gmail.com",
  "25070521227": "kewalramshelke1@gmail.com",
  "25070521228": "singhankita1831@gmail.com",
  "25070521229": "gajumendhulkar@gmail.com",
  "25070521230": "sarangkale27@gmail.com",
  "25070521231": "natwarlalrinayate@gmail.com",
  "25070521233": "sanjeevilame2@gmail.com",
  "25070521234": "heera1234@gmail.com",
  "25070521235": "chunneanil@gmail.com",
  "25070521236": "gauravtimkhede@gmail.com",
  "25070521237": "jngadhwal@gmail.com",
  "25070521238": "pratapsinghdamniya1204@gmail.com",
  "25070521239": "chandrasekharbawane825@gmail.com",
  "25070521240": "sunilshirbhate26@gmail.com",
  "25070521241": "vinayak147pise@gmail.com",
  "25070521242": "saojipreeti19@gmail.com",
  "25070521243": "shrashtichouhan9926@gmail.com",
  "25070521244": "sgsales78@gmail.com",
  "25070521245": "jayeshvanerkar@gmail.com",
  "25070521246": "firecross73@gmail.com",
  "25070521247": "adkine.prashant@gmail.com",
  "25070521248": "hasnain.kamani@sfsnagpur.in",
  "25070521249": "nandkishordhengle22@gmail.com",
  "25070521250": "mohsinkhan77783@gmail.com",
  "25070521251": "nehalsugandh90@gmail.com",
  "25070521252": "vinayak.retar@gmail.com",
  "25070521253": "paras.shalu@gmail.com",
  "25070521254": "sureshkawade850@gmail.com",
  "25070521255": "vijaydhamankar284@gmail.com",
  "25070521256": "adiba.nabiha12@gmail.com",
  "25070521257": "sayamajayeaj@gmail.com",
  "25070521258": "vijaynkadu92@gmail.com",
  "25070521259": "anaynasayyad272@gmail.com",
  "25070521260": "sanjaybramhnankar@gmail.com",
  "25070521261": "piyushbajapayee6@gmail.com",
  "25070521262": "nikulemadhuri55@gmail.com",
  "25070521263": "rajeevmeshram62@gmail.com",
  "25070521264": "sunilbalsaraf000@gmail.com",
  "25070521265": "gajbhiyec123@gmail.com",
  "25070521266": "advsumerkalamkar@gmail.com",
  "25070521268": "hemantpatil942@gmail.com",
  "25070521269": "pradipbangale74@gmail.com",
  "25070521270": "ashwiniwaghmare213@gmail.com",
  "25070521271": "himanshuakhatkar77@gmail.com",
  "25070521272": "prashanthandnina@gmail.com",
  "25070521273": "khobragadegulab8@gmail.com",
  "25070521274": "mintu.pt@gmail.com",
  "25070521275": "vhrathi@gmail.com",
  "25070521276": "vipinfating@gmail.com",
  "25070521277": "sanjaydhanvijay@gmail.com",
  "25070521278": "sunilbodkhe61@gmail.com",
  "25070521279": "ajithmishra333@gmail.com",
  "25070521280": "vijaykumar123706@gmail.com",
  "25070521281": "cmtembhurnear@gmail.com",
  "25070521282": "nimpuret@gmail.com",
  "25070521283": "kscnag@rediffmail.com",
  "25070521284": "rajeshtabhane352@gmail.com",
  "25070521285": "surendrasarode78@gmail.com",
  "25070521286": "dipakwanjari21568@gmail.com",
  "25070521287": "ashishlakhe666@gmail.com",
  "25070521288": "prashantn7908@gmail.com",
  "25070521289": "su.chao1965@gmail.com",
  "25070521290": "khadseded@gmail.com",
  "25070521291": "purushottamkardabhajane@gmail.com",
  "25070521292": "hitendraghordadekar887@gmail.com",
  "25070521293": "hitesh111666@gmail.com",
  "25070521294": "kiransatpute954@gmail.com",
  "25070521295": "ravipalandurkar88@gmail.com",
  "25070521296": "uttammendhe8@gmail.com",
  "25070521297": "mistigawande@gmail.com",
  "25070521298": "pratinfaye6@gmail.com",
  "25070521300": "ravi.bhasme2901@gmail.com",
  "25070521301": "shivramindustry@yahoo.com",
  "25070521302": "sudhakardugane67@gmail.com",
  "25070521303": "ishvarchakole1974@gmail.com",
  "25070521304": "rakeshpatil7482@gmail.com",
  "25070521305": "vkagrawaltpl@gmail.com",
  "25070521306": "nandlaljunghare@gmail.com",
  "25070521307": "motghare.mahendra01@gmail.com",
  "25070521308": "mamtavgulhane30@gmail.com",
  "25070521309": "Vinodgangwani73@gmail.com",
  "25070521310": "suhannoorani1@gmail.com",
  "25070521311": "rajeshpatilrpf@gmail.com",
  "25070521312": "shrinivas.hukre@gmail.com",
  "25070521313": "suniltekade69@gmail.com",
  "25070521314": "9373567890.vt@gmail.com",
  "25070521315": "morey8275@gmail.com",
  "25070521316": "narendradeshmukh684@gmail.com",
  "25070521317": "riteshshende1444@gmail.com",
  "25070521318": "umeshmadne19@gmail.com",
  "25070521319": "harishparate82@gmail.com",
  "25070521320": "veerajintl@gmail.com",
  "25070521321": "sach.parkhi@gmail.com",
  "25070521322": "ashagraj10@gmail.com",
  "25070521323": "vijaybele1974@gmail.com",
  "25070521324": "nilindjain@gmail.com",
  "25070521325": "drdipakpawar62@gmail.com",
  "25070521327": "pundlikwange@gmail.com",
  "25070521328": "hanfikalim@gmail.com",
  "25070521330": "virendratanwar1980@gamil.com",
  "25070521331": "pradeepyadav2141969@gmail.com",
  "25070521332": "narendrabhute77@gmail.com",
  "25070521333": "jayeshsarsewar@gmail.com",
  "25070521335": "prajact.priti@gmail.com",
  "25070521338": "rajeshkumaryadav97@gmail.com",
  "25070521339": "waseemsheikh7319@gmail.com",
  "25070521340": "sbchonde@gmail.com",
  "25070521341": "sachinkunthe42@gmail.com",
  "25070521342": "yenorkarabhay@gmail.com",
  "25070521343": "dhawalshairey@gmail.com",
  "25070521344": "pradeepumratkar123@gmail.com",
  "25070521345": "dilipkhandal4@gmail.com",
  "25070521347": "satya.newindia009@gmail.com",
  "25070521348": "ajabaleanjali7@gmail.com",
  "25070521349": "mishra05121976@gmail.com"
};

// Section reallocation in Sem III for Sec F students
const sectionFAllocations = {
  // Section A
  "25070521306": { section: "A", labBatch: "A2" },
  "25070521310": { section: "A", labBatch: "A2" },
  "25070521318": { section: "A", labBatch: "A2" },
  "25070521324": { section: "A", labBatch: "A2" },
  "25070521340": { section: "A", labBatch: "A2" },
  "25070521342": { section: "A", labBatch: "A2" },
  "25070521343": { section: "A", labBatch: "A2" },
  "25070521345": { section: "A", labBatch: "A2" },
  "25070521349": { section: "A", labBatch: "A2" },

  // Section B
  "25070521302": { section: "B", labBatch: "B2" },
  "25070521303": { section: "B", labBatch: "B2" },
  "25070521309": { section: "B", labBatch: "B2" },
  "25070521323": { section: "B", labBatch: "B2" },
  "25070521328": { section: "B", labBatch: "B2" },
  "25070521333": { section: "B", labBatch: "B2" },
  "25070521347": { section: "B", labBatch: "B2" },
  "25070521348": { section: "B", labBatch: "B2" },

  // Section C
  "25070521304": { section: "C", labBatch: "C2" },
  "25070521305": { section: "C", labBatch: "C2" },
  "25070521308": { section: "C", labBatch: "C2" },
  "25070521312": { section: "C", labBatch: "C2" },
  "25070521313": { section: "C", labBatch: "C2" },
  "25070521315": { section: "C", labBatch: "C2" },
  "25070521316": { section: "C", labBatch: "C2" },
  "25070521321": { section: "C", labBatch: "C2" },
  "25070521330": { section: "C", labBatch: "C2" },
  "25070521341": { section: "C", labBatch: "C2" },
  "25070521344": { section: "C", labBatch: "C2" },

  // Section D
  "25070521301": { section: "D", labBatch: "D2" },
  "25070521307": { section: "D", labBatch: "D2" },
  "25070521311": { section: "D", labBatch: "D2" },
  "25070521317": { section: "D", labBatch: "D2" },
  "25070521320": { section: "D", labBatch: "D2" },
  "25070521322": { section: "D", labBatch: "D2" },
  "25070521335": { section: "D", labBatch: "D2" },
  "25070521338": { section: "D", labBatch: "D2" },

  // Section E
  "25070521314": { section: "E", labBatch: "E2" },
  "25070521319": { section: "E", labBatch: "E2" },
  "25070521325": { section: "E", labBatch: "E2" },
  "25070521327": { section: "E", labBatch: "E2" },
  "25070521331": { section: "E", labBatch: "E2" },
  "25070521332": { section: "E", labBatch: "E2" },
  "25070521339": { section: "E", labBatch: "E2" }
};

const students = [];
const seenPrns = new Set();

const lines = rawCsvData.trim().split('\n');
for (const line of lines) {
  const parts = line.split(',').map(s => s.trim());
  if (parts.length >= 5 && parts[1] && parts[1].startsWith('25070521')) {
    const prn = parts[1];
    let section = parts[2];
    const name = parts[3].replace(/\s+/g, ' ');
    const email = parts[4];

    if (!seenPrns.has(prn)) {
      seenPrns.add(prn);

      // Determine current section (Semester III allocation)
      let labBatch = `${section}1`;
      if (sectionFAllocations[prn]) {
        section = sectionFAllocations[prn].section;
        labBatch = sectionFAllocations[prn].labBatch;
      } else {
        const rollNum = parseInt(prn.slice(-3), 10);
        // Odd/even or lower/upper half into Lab batch 1 or 2
        // Based on Sem III list:
        if (section === 'A') {
          labBatch = rollNum <= 36 ? 'A1' : 'A2';
        } else if (section === 'B') {
          labBatch = rollNum <= 93 ? 'B1' : 'B2';
        } else if (section === 'C') {
          labBatch = rollNum <= 157 ? 'C1' : 'C2';
        } else if (section === 'D') {
          labBatch = rollNum <= 214 ? 'D1' : 'D2';
        } else if (section === 'E') {
          labBatch = rollNum <= 274 ? 'E1' : 'E2';
        }
      }

      const parentEmail = parentsEmailMapping[prn] || '';

      students.push({
        prn,
        name,
        email,
        section,
        labBatch,
        parentEmail,
        department: 'Computer Science',
        semester: 3,
        batch: '2025-29'
      });
    }
  }
}

console.log(`Successfully parsed ${students.length} students for Batch 2025-29!`);

// Save to JSON in both student-backend and student-scanner
const jsonStr = JSON.stringify(students, null, 2);

fs.mkdirSync('/Users/kashvibalani/Downloads/QR code scanner/student-backend/data', { recursive: true });
fs.mkdirSync('/Users/kashvibalani/Downloads/QR code scanner/student-scanner/src/data', { recursive: true });

fs.writeFileSync('/Users/kashvibalani/Downloads/QR code scanner/student-backend/data/batch_2025_29.json', jsonStr);
fs.writeFileSync('/Users/kashvibalani/Downloads/QR code scanner/student-scanner/src/data/batch_2025_29.json', jsonStr);
console.log('Saved batch_2025_29.json successfully.');
