# GAL_Project
Graph Algorithms project for FIT BUT

Source literature: Chapter 22 in the book Cormen et al - Introduction to Algorithms, 3rd Edition, 2009

## Implementation requirements

- Loading and saving of created graphs (from/to a file)
- Basic visual editation of graphs
- Demonstration of an algorithm to find bridges and articulation points (ideally also showing biconnected components)
- Keybinds for algo demonstration is a plus
- [GraphML](https://en.wikipedia.org/wiki/GraphML) as graph representation language
- Needs to be runnable on Merlin
- UI needs to be consulted with [Zbyněk Křivka](https://www.vut.cz/lide/zbynek-krivka-13784) before turning in the project

## Documentation requirements

- Mention all sources and libraries
- Program design, program description and how to control the program
- Short intro about program functionality
- Minimal requirements (architecture, OS, required software)
- Algorithm details (pseudocode and stuff)
- Mention the literature and possibly add more literature and other example apps if possible

## Turn-in requirements

One file with the source code, examples and documentation xsotol02.zip

## Presentation requirements

At [LTA student conference](http://www.fit.vutbr.cz/~meduna/work/lta) or at last/second to last lecture (6.12. or 13.12.).
Demonstrate program usage on example graphs that should be included in turned in file.


# Demonstrace použití
V této sekci se zabývá spuštění jednotlivých příkladů, které jsou od vytvoření nových uzlů až po ovládání algoritmů. Tyto příklady slouží jenom pro demonstraci všech funkcí a zdokumentování správného použití. 

Pro upřesnění všechny kliknutí v této sekci se dělají levým tlačítkem. 

## Spuštění aplikace

Jako první krok  pro práci s aplikací je její spuštění. Jelikož to je webová aplikace, tak je nutné pouze pustit webový prohlížeč se souborem `index.html`. Po tomto kroku by se mělo zobrazit tmavé okno, které je na obrázku níže.

## Úpravy uzlů a hran

Nejdůležitější na začátku je si vytvořit uzly pomocí tlačítka "Přidat uzel". kliknutím na toto tlačítko se spustí proces vkládání uzlů a při kliknutí na prázdnou plochu níže se vytvoří uzel v místě ukazatele. Klávesová zkratka pro nový uzel je písmeno "n".

Pro přidání hrany to funguje podobně.  Nejprve se klikne na "Přidat hranu". Poté se klikne na dva různé uzly a následně se vytvoří hrana mezi vybranými uzly. Klávesová zkratka pro novou hranu  je písmeno "e".


Některé uzly nebo hrany překážejí a jsou nutné občas odstranit. Tuto funkčnost zajišťují tlačítka "Odstranit uzel" nebo "Odstranit hranu". Po kliknutí na chtěné tlačítko se poté klikne na hranu nebo uzel pro odstranění a hrana nebo uzel se všemi navazujícími hranami zmizí. Pokud je nutné odstranění celého grafu. Je nutné kliknout na tlačítko "Smazat graf".

## Pohybování se na ploše s uzly a hranami 

Pro úpravu, posunování a škálování plochy se používá myš.  Pokud je potřeba posunout plochu i se všemi uzly, klikne do volného místa, podrží se a posunutím se posune celá plocha.  

Pro ztenčení nebo zvětšení uzlů a plochy se posunuje kolečkem nahoru a dolu.

Pro posunutí jednoho uzlu je nutné na něj kliknout, podržet a posunout do místa učení.

Aplikace má také funkci automatického rozložení, kde se všechny uzly posunou a neškálují přesně na obrazovku. Je možné, tak udělat pomocí kliknutí na tlačítko "Automatické rozložení". 

## Nahrávání a ukládání grafů

Aplikace podporuje nahrávání a ukládání grafů ve formátu GraphML. Tato soubory končí s příponou `.graphml`.

Pro nahrání je potřeba kliknout na "Nahrát graf". Poté vyběhne nové okno k výběru souboru, které je potřeba ukončit otevřením. Následně se vše na ploše smaže a přidá se graf ze souboru. Pokud dojde k chybě, zobrazí se upozornění. 

Stahování prohýbá po kliknutí na  "Stáhnout graf", která se uloží na výchozí ukládací místo. Většina prohlížečů má nastavené Stažené soubory.

## Ovládání algoritmů

Pokud je na ploše nějaká graf, může se pustit algoritmus pro nalehnutí artikulačních bodů nebo mostů, kliknutím na tlačítka "Najít artikulační body" nebo "Najít mosty". 

Tím to krokem se zobrazí příslušný algoritmus  na levé části obrazovky. Ve stření čísti se automaticky rozloží graf, který se bude vyvíjet podle stavů algoritmu. V pravé části se vyskytnou ovládací prvoky, kde první spustí animaci algoritmu, druhý udělá jeden krok při kliknutí a poslední projde okamžitě celý alegorismus. Pod těmito prvky je ještě posuvník, který určuje rychlost animace. Pokud půjdeme dále, tak tam je miniaturní legenda, kde  artikulačních body jsou zobrazeny žlutým okrajem  a mosty přerušovanou čárou. Jako poslední jsou zobrazené proměnné a jejich hodnoty použité v algoritmu.

Na zvýraznění funkčnosti algoritmu se zde vyskytuje ještě jedno tlačítko "2-souvislé komponenty", které vypočítá a zobrazí 2-souvislé komponenty. Jejich odlišnost lze poznat barevným odlišením. Poté stejným tlačítkem se mohou i skrýt. 

Poslední tlačítko je "Skrýt ovládání algoritmu", který skryje ovládání při spuštěném algoritmu a při ukončení ho vypne. Pokud je skryté, tak se opět může zobrazit tlačítkem "Zobrazení ovládání algoritmu".  
