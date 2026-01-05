
# Demonstrace použití

Tato sekce se zaměřuje na spuštění jednotlivých příkladů, začínající vytvořením nových uzlů až po ovládání algoritmů. Tyto příklady slouží jenom pro demonstraci všech funkcí a zdokumentování správného použití. 

Pro upřesnění jsou všechna kliknutí popsaná v této sekci prováděna levým tlačítkem myši. 

## Spuštění aplikace

Prvním krokem pro práci s aplikací je její spuštění. Protože se jedná o webovou aplikaci, stačí otevřít soubor `index.html` v libovolném moderním webovém prohlížeči. Po tomto kroku by se mělo zobrazit tmavé okno, zobrazené na obrázku \ref{fig:1ob}.

## Úpravy uzlů a hran

Nejdůležitější na začátku je si vytvořit uzly pomocí tlačítka "Přidat uzel". Kliknutím na toto tlačítko se spustí proces vkládání uzlů. Kliknutím na prázdnou plochu grafu se poté vytvoří uzel v místě ukazatele myši. Klávesovou zkratkou pro přidání nového uzlu je písmeno "n".

Proces přidání hrany je obdobný. Nejprve klikněte na tlačítko "Přidat hranu". Poté se klikne na dva různé uzly a následně se vytvoří hrana mezi vybranými uzly. Klávesová zkratka pro novou hranu  je písmeno "e".

Některé uzly nebo hrany překážejí a jsou nutné občas odstranit. Tuto funkčnost zajišťují tlačítka "Odstranit uzel" nebo "Odstranit hranu". Po kliknutí na chtěné tlačítko se poté klikne na hranu nebo uzel pro odstranění a hrana nebo uzel se všemi navazujícími hranami zmizí. Pokud je potřeba odstranit celý graf, použijte tlačítko "Smazat graf".

## Pohybování se na ploše s uzly a hranami

Pro úpravu, posunování a škálování plochy se používá myš.  Pro posunutí celé plochy včetně všech uzlů klikněte do volného místa, podržte tlačítko myši a posuňte ji požadovaným směrem.  

Velikost uzlů a plochy lze měnit otáčením kolečka myši směrem nahoru nebo dolů.

Jednotlivý uzel lze přesunout kliknutím, podržením tlačítka myši a tažením na požadované místo.

Aplikace má funkcí automatického rozložení, která přeuspořádá všechny uzly tak, aby byly rovnoměrně rozložené na obrazovce. Funkci aktivujete kliknutím na tlačítko "Automatické rozložení". 

## Nahrávání a ukládání grafů

Aplikace podporuje nahrávání a ukládání grafů ve formátu GraphML. Tato soubory končí s příponou `.graphml`.

Pro nahrání grafu klikněte na tlačítko "Nahrát graf". Poté se zobrazí dialogové okno pro výběr souboru. Vyberte požadovaný soubor a potvrďte výběr kliknutím na "Otevřít". Následně se vše na ploše smaže a přidá se graf ze souboru. V případě chyby při nahrávání grafu se zobrazí upozornění s informací o problému. 

Stahování probíhá po kliknutí na tlačítko  "Stáhnout graf". Soubor se uloží do výchozího umístění pro stahování, které je ve většině prohlížečů nastaveno na složku Stažené soubory.

## Ovládání algoritmů

Pokud je na ploše graf, lze spustit algoritmus pro nalehnutí artikulačních bodů nebo mostů, kliknutím na tlačítka "Najít artikulační body" nebo "Najít mosty". 

Tímto krokem se zobrazí příslušný algoritmus v levé části obrazovky.Ve střední části se automaticky rozloží graf, který se bude vyvíjet podle stavů algoritmu. V pravé části se zobrazí ovládací prvky, kde první spustí animaci algoritmu, druhý udělá jeden krok při kliknutí a poslední okamžitě vykoná celý algoritmus. Pod těmito prvky je ještě posuvník, který nastavuje rychlost animace. Pod ovládacími prvky se nachází legenda, která zobrazuje význam barev a symbolů: artikulační body jsou označeny žlutým okrajem, mosty přerušovanou čárou. Jako poslední jsou zobrazené proměnné a jejich hodnoty použité v algoritmu.

Pro zobrazení 2-souvislých komponent slouží tlačítko "2-souvislé komponenty", které vypočítá a zobrazí 2-souvislé komponenty. Jejich odlišnost lze poznat barevným odlišením. Poté stejným tlačítkem se mohou i skrýt. 

Tlačítko "Skrýt ovládání algoritmu" skryje ovládací panel během algoritmu  a při ukončení ho vypne. Pokud je skryté, tak se opět může zobrazit tlačítkem "Zobrazení ovládání algoritmu".  
