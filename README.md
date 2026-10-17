# Universul tău la 14 ani ✧

Site pentru o aniversare: fiecare invitat își introduce numele, alege culoarea stelei și răspunde la cele cinci întrebări stabilite. Nu cere cont invitaților. Întrebările pot fi sărite; cel puțin un răspuns este necesar pentru trimitere.

## Încearcă acum

Dezarhivează proiectul și deschide `index.html` în Edge sau Chrome. Modul demonstrativ are nouă stele exemplu și funcționează fără server. Stelele adăugate aici rămân numai în browserul folosit. Etichetele din site și din exporturi indică explicit acest mod.

Fișierele trebuie păstrate împreună: `index.html`, `styles.css`, `core.js`, `app.js`, `config.js`, `favicon.svg`.

## Personalizare

Deschide `config.js` cu Notepad. Completează `birthdayName` și, opțional, `eventDate` în format `AAAA-LL-ZZ`. Vârsta acestui proiect este 14 ani, iar întrebarea finală se referă la 18 ani. Opțiunea `age` este informativă: pentru altă vârstă trebuie adaptate și textele.

Nu ai nevoie de Node, npm sau un proces de build pentru publicare.

## Mesaje comune de pe toate telefoanele

GitHub Pages găzduiește interfața. Supabase păstrează mesajele într-o bază de date comună. Publicarea doar pe GitHub nu activează stocarea comună.

1. Creează un proiect în https://supabase.com/dashboard . Așteaptă inițializarea.
2. În SQL Editor, deschide o interogare nouă și lipește integral `supabase.sql`.
3. În linia `insert into public.universe_events`, înlocuiește `universul-14-schimba-acest-cod` cu un cod propriu, greu de ghicit, de exemplu un UUID generat pentru această petrecere. Apasă Run. Păstrează codul exact pentru pasul următor.
4. Din dialogul Connect sau din setările API ale proiectului copiază Project URL și cheia publică **Publishable** (`sb_publishable_...`). Nu folosi o cheie secretă ori `service_role`.
5. În `config.js`, setează `mode: 'live'`, `eventId` la codul ales, `supabaseUrl` la Project URL și `publishableKey` la cheia publică.
6. Publică fișierele și verifică de pe două telefoane: trimite un mesaj pe primul, apoi așteaptă cel mult 15 secunde pe al doilea. Steaua trebuie să apară pe ambele. Încărcarea inițială are loc imediat.

Datele demonstrative nu se transferă în evenimentul real. Aplicația nu raportează trimiterea ca reușită până când serverul nu o confirmă. La eșec păstrează formularul; reîncercarea aceleiași trimiteri nu dublează steaua.

## Publicare pe GitHub Pages, din browser

1. În GitHub, creează un repository, de exemplu `universul-14`. Pentru o publicare simplă pe planul gratuit, alege Public.
2. Folosește **Add file → Upload files** și încarcă fișierele din proiect direct în rădăcina repository-ului. Nu încărca doar arhiva ZIP și nu pune `index.html` într-un subfolder suplimentar. Folderul `tests`, SQL-ul și acest ghid nu sunt necesare pentru afișarea site-ului, dar pot rămâne în proiect. Nu pune în repository fișierele cu mesajele exportate.
3. Apasă Commit changes.
4. Deschide **Settings → Pages → Build and deployment**.
5. Alege **Deploy from a branch**, branch `main`, folder `/(root)`, apoi Save.
6. Așteaptă finalizarea publicării și folosește URL-ul afișat de GitHub Pages. Adresa va avea de obicei forma `https://UTILIZATOR.github.io/universul-14/`.

## Cod QR

Generează QR-ul numai după ce ai adresa finală GitHub Pages. În Edge/Chrome, opțiunea pentru QR poate fi în meniul de partajare al paginii sau în meniul contextual; dacă nu apare, poți folosi generatorul QR din Canva cu adresa finală. Descarcă imaginea și tipărește-o pe un cartonaș cu textul:

> Unele stele sunt oameni. Scanează și aprinde steaua ta în universul meu. ✧

Verifică QR-ul cu un telefon înainte de tipărire. Nu folosi adresa paginii repository-ului GitHub; folosește adresa site-ului GitHub Pages.

## Ce rămâne la final

- Cer interactiv cu stelele invitaților, căutare după nume și alegere aleatorie.
- Poster SVG cu numele participanților, descărcabil și scalabil pentru tipar.
- Album complet: butonul „Album de mesaje / PDF” deschide paginile, apoi „Tipărește / Salvează ca PDF”. Alege Save as PDF în dialogul browserului.
- Export JSON cu toate mesajele și întrebările pentru arhivare. Exportul reprezintă mesajele încărcate la momentul descărcării; așteaptă confirmarea actualizării cerului înainte de exportul final. JSON-ul poate fi citit separat, dar nu există import în interfață în această versiune.

Toate persoanele care au linkul pot citi și descărca mesajele. Acest lucru este precizat înainte de trimitere. Site-ul nu implementează o dezvăluire temporizată, o parolă sau autentificare pentru sărbătorită. Nu încărca în repository exporturile cu mesaje.

## Administrare după eveniment

În SQL Editor poți închide trimiterile păstrând citirea:

```sql
update public.universe_events set accepting=false where slug='CODUL-TAU';
```

Pentru a elimina un mesaj nepotrivit, identifică-l în Table Editor → `universe_stars` și șterge rândul, ori folosește comanda comentată la finalul SQL-ului. Vizitatorii nu au drepturi de modificare sau ștergere. Numele nu reprezintă o identitate verificată: doi invitați pot avea același nume. Un vizitator poate trimite alte contribuții noi; limita evenimentului este 200 de stele. Pentru un link distribuit foarte larg ar trebui adăugată protecție antispam înainte de utilizare.

Păstrează exportul JSON și albumul PDF separat. Accesul pe termen lung la site depinde de păstrarea proiectelor GitHub și Supabase active; verifică politica de inactivitate a planului ales înainte de eveniment.

## Verificări înainte de petrecere

Testează numele cu diacritice, trimiterea de pe două dispozitive, închiderea și redeschiderea formularului (ciornă), exporturile și scanarea QR-ului. Modul live nu a fost testat cu un proiect real în timpul generării: necesită configurarea propriului proiect Supabase.

Verificări locale pentru logica de validare: `node --test tests/core.test.cjs` (necesită Node doar pentru test, nu pentru utilizarea site-ului).

Documentație oficială utilizată:

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/database/postgres/row-level-security

