# Universul Antoniei - versiunea pentru petrecere

Site: https://darieionut13-sudo.github.io/universul-14/

Pagina de început rămâne într-un singur ecran: fotografia Antoniei și butoanele „Lasă o stea” / „Explorează universul”. Întrebările se deschid automat în cartonașele 3D. După confirmarea salvării pe server, steaua invitatului zboară în constelație.

## Mesaje comune

Modul live din config.js este conectat la o bază de date D1, administrată în proiectul Sites „Universul Antoniei — mesaje comune”. GitHub Pages păstrează interfața, iar serviciul de stocare păstrează contribuțiile. Nu este necesar cont pentru invitați. Actualizarea are loc la cel mult 5 secunde și la revenirea în pagină sau reconectarea la internet.

Mesajele se trimit exclusiv după apăsarea butonului final și sunt confirmate de server. În cazul unei erori, formularul și ciorna locală se păstrează. Reîncercarea aceleiași trimiteri nu creează dubluri. Nu există fallback local care să pretindă că un mesaj a fost trimis. Ciorna din browser nu este o contribuție publicată.

Numele și răspunsurile sunt vizibile și descărcabile de persoanele care au linkul. Acest lucru este explicat înainte de trimitere. Limita evenimentului este 500 de contribuții. Numele invitaților nu sunt identități verificate; două persoane pot avea același nume.

## Album PDF

„Explorează universul” → „Descarcă albumul PDF” generează direct un fișier PDF. Mai întâi sunt citite mesajele actuale de pe server. Prima pagină conține fotografia și constelația, apoi fiecare invitat începe o pagină nouă cu cele cinci răspunsuri. Textul lung continuă automat pe pagini suplimentare. Fontul include diacritice românești. Generarea are loc pe dispozitiv; nu trimite mesajele către un serviciu PDF extern.

Fișierul JSON rămâne disponibil ca copie separată a datelor. Păstrează albumul și exportul după eveniment. Nu încărca mesajele exportate în repository-ul public.

## Testare

Parametrul `?test=1` deschide un univers de verificare separat. Contribuțiile de probă nu apar în universul petrecerii și sunt marcate explicit în interfață. Nu distribui acest link invitaților.

Verificări locale pentru validare și poziționare: `node --test tests/core.test.cjs`. Codul care generează PDF-ul este `album.js`. jsPDF și fontul sunt găzduite în assets, împreună cu licențele.

Nu publica niciodată cheia privată de administrare a serviciului. Aceasta nu se află în repository sau în codul browserului. Valorile publice din config.js sunt suficiente pentru accesul invitaților la eveniment, nu pentru ștergerea contribuțiilor.
