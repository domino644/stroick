# stroick — konfigurowalny stroik muzyczny

Aplikacja mobilna do strojenia instrumentów strunowych za pomocą mikrofonu. Umożliwia definiowanie własnych instrumentów, dowolnej liczby strun, przypisywanie dźwięków do strun oraz zapisywanie własnych presetów strojenia.

Aplikacja ma być przydatna zarówno dla muzyków, jak i osób uczących się grać, które chcą szybko dostroić instrument bez konieczności korzystania z fizycznego stroika. Użytkownik może zagrać dźwięk na instrumencie lub zaśpiewać go, a aplikacja rozpozna jego wysokość i wskaże odpowiednią strunę.

## Główne funkcje

TODO: musty i shouldy oraz miejsce do cotygodniowych updatów

### 1. Stroik wykorzystujący mikrofon

- Wykrywanie wysokości dźwięku w czasie rzeczywistym.
- Wyświetlanie wykrytej nuty, oktawy oraz częstotliwości w Hz.
- Wskazywanie odchylenia od oczekiwanej wysokości dźwięku w centach.
- Wizualna informacja, czy dźwięk jest za niski, za wysoki, czy prawidłowo nastrojony.
- Stabilizacja odczytu i odrzucanie niewiarygodnych pomiarów.
- Obsługa dźwięków pochodzących zarówno z instrumentu, jak i ludzkiego głosu.

### 2. Konfigurowalna liczba strun

Użytkownik może utworzyć instrument i określić liczbę jego strun.

Dla każdej struny można zdefiniować:

- nazwę lub numer struny,
- docelową nutę,
- oktawę,
- częstotliwość docelową wynikającą z ustawień strojenia,
- opcjonalną nazwę opisową.

Nie należy ograniczać konfiguracji wyłącznie do standardowych gitar sześciostrunowych. Aplikacja powinna umożliwiać tworzenie instrumentów o różnej liczbie strun, np. gitar, gitar basowych, ukulele lub instrumentów o niestandardowej konstrukcji.

### 3. Strojenie głosem

Użytkownik może zaśpiewać dźwięk, który chce uzyskać na wybranej strunie.

Przebieg działania:

1. Użytkownik wybiera strunę na ekranie instrumentu.
2. Aplikacja rozpoczyna nasłuchiwanie.
3. Użytkownik śpiewa docelowy dźwięk lub jego przybliżenie.
4. Aplikacja wykrywa wysokość głosu i porównuje ją z dźwiękiem docelowym.
5. Aplikacja wskazuje różnicę wysokości w centach i Hz.
6. Użytkownik może dopasować strunę do śpiewanego dźwięku, korzystając ze wskazań stroika.

Należy rozróżnić dwa tryby pracy:

- **Strojenie względem presetu** — aplikacja porównuje dźwięk z mikrofonu z wysokością wybranej struny zapisaną w presecie.
- **Strojenie względem głosu** — aplikacja wykrywa zaśpiewany dźwięk i traktuje go jako tymczasowy cel strojenia wybranej struny.

W drugim trybie aplikacja powinna umożliwiać zablokowanie wykrytej wysokości, aby dalsze dźwięki nie zmieniały automatycznie celu strojenia.

Ważne: aplikacja nie powinna zakładać, że najwyższy pik widma zawsze odpowiada nucie podstawowej. Detekcja wysokości głosu musi uwzględniać harmoniczne i błędy oktawowe.

### 4. Własne presety strojenia

Użytkownik może tworzyć, edytować, kopiować i usuwać presety.

Każdy preset powinien zawierać:

- nazwę presetu,
- nazwę instrumentu,
- liczbę strun,
- przypisaną nutę i oktawę dla każdej struny,
- opcjonalny opis,
- częstotliwość odniesienia A4, domyślnie 440 Hz.

Przykładowe presety:

- Guitar Standard — E2, A2, D3, G3, B3, E4.
- Guitar Drop D — D2, A2, D3, G3, B3, E4.
- Bass Standard 4-String — E1, A1, D2, G2.
- Ukulele Standard — G4, C4, E4, A4.
- Custom Tuning — dowolna liczba strun i dowolne dźwięki.

Presety powinny być niezależne od typu instrumentu. Użytkownik powinien móc stworzyć własny instrument i przypisać mu dowolny zestaw dźwięków.

### 5. Interfejs użytkownika

Główny ekran stroika powinien zawierać:

- wizualizację strun instrumentu,
- możliwość wybrania konkretnej struny,
- aktualnie wykrytą nutę,
- częstotliwość w Hz,
- wskazówkę odchylenia od dźwięku docelowego,
- status strojenia,
- informację o aktywnym presecie,
- przycisk rozpoczęcia i zatrzymania nasłuchiwania.

Ekran zarządzania presetami powinien umożliwiać tworzenie i edycję instrumentów oraz ich strojów bez konieczności przechodzenia przez skomplikowany formularz.

## Technologie

- **React Native + TypeScript** — aplikacja mobilna.
- **Expo** — środowisko developerskie, z development buildem w razie potrzeby.
- **react-native-pitchy** — kandydat do detekcji wysokości dźwięku w czasie rzeczywistym.
- **expo-audio** — alternatywa lub uzupełnienie do przechwytywania próbek audio.
- **React Native SVG lub Skia** — wizualizacja wskazówki i strun.
- **AsyncStorage lub SQLite** — lokalne przechowywanie presetów i ustawień.

Wybór bibliotek audio należy poprzedzić testem kompatybilności z docelową wersją React Native oraz Androidem i iOS.

Aplikacja powinna działać offline w zakresie wykrywania dźwięku i strojenia.

## Architektura

Kod powinien być podzielony na następujące moduły:

- `audio` — obsługa mikrofonu i strumienia próbek.
- `pitch-detection` — detekcja wysokości dźwięku i ocena pewności pomiaru.
- `tuning` — porównywanie częstotliwości z celem strojenia.
- `instruments` — definicje instrumentów i strun.
- `presets` — tworzenie, edycja i przechowywanie presetów.
- `ui` — ekrany i komponenty interfejsu.

Logika detekcji dźwięku powinna być oddzielona od interfejsu użytkownika, aby można ją było testować niezależnie.

## Model danych

Przykładowa struktura presetu:

```json
{
  "id": "guitar-drop-d",
  "name": "Guitar Drop D",
  "instrument": "Guitar",
  "referenceFrequency": 440,
  "strings": [
    { "id": "s1", "name": "6th string", "note": "D", "octave": 2 },
    { "id": "s2", "name": "5th string", "note": "A", "octave": 2 },
    { "id": "s3", "name": "4th string", "note": "D", "octave": 3 },
    { "id": "s4", "name": "3rd string", "note": "G", "octave": 3 },
    { "id": "s5", "name": "2nd string", "note": "B", "octave": 3 },
    { "id": "s6", "name": "1st string", "note": "E", "octave": 4 }
  ]
}
```

Dane powinny być walidowane. Identyfikator struny nie może zależeć od jej aktualnej pozycji na liście, ponieważ użytkownik może zmieniać kolejność i liczbę strun.

## Obliczenia muzyczne

Aplikacja powinna korzystać z częstotliwości docelowej wynikającej z nuty, oktawy i częstotliwości odniesienia.

Dla stroju równomiernie temperowanego:

\[
f= f_{A4}\cdot 2^{(m-69)/12}
\]

gdzie `m` jest numerem MIDI nuty, a `f_A4` to częstotliwość odniesienia, domyślnie 440 Hz.

Odchylenie w centach obliczane jest jako:

\[
c=1200\log_2\left(\frac{f_{\text{detected}}}{f_{\text{target}}}\right)
\]

Dodatnia wartość oznacza dźwięk za wysoki, ujemna — za niski.

## Plan rozwoju

### MVP — pierwsza działająca wersja

- Obsługa mikrofonu.
- Detekcja wysokości dźwięku.
- Wyświetlanie nuty, częstotliwości i odchylenia w centach.
- Wybór struny z presetu.
- Kilka gotowych presetów.
- Tworzenie, edycja i usuwanie własnych presetów.
- Podstawowy tryb strojenia głosem.

### Kolejna wersja

- Dowolna liczba strun.
- Zaawansowana konfiguracja instrumentów.
- Blokowanie zaśpiewanej wysokości jako celu strojenia.
- Kalibracja A4.
- Lepsza filtracja szumu i obsługa błędów oktawowych.
- Eksport i import presetów.

### Możliwe rozszerzenia

- Generator tonu referencyjnego.
- Metronom.
- Historia ostatnich strojów.
- Tryb automatycznego dopasowania wykrytego dźwięku do najbliższej struny.
- Własne nazwy i opisy instrumentów.

## Kryteria akceptacji

Pierwsza wersja powinna spełniać następujące warunki:

1. Użytkownik może wykryć wysokość dźwięku przez mikrofon.
2. Aplikacja stabilnie wyświetla nutę i odchylenie dla czystych sygnałów testowych.
3. Użytkownik może wybrać konkretną strunę i ustawić jej docelową nutę.
4. Użytkownik może zaśpiewać dźwięk i ustawić go jako cel strojenia.
5. Użytkownik może tworzyć i zapisywać własne presety.
6. Presety zachowują się poprawnie po ponownym uruchomieniu aplikacji.
7. Aplikacja działa bez połączenia z internetem.
8. Błędne lub niepewne pomiary nie powodują gwałtownego przeskakiwania wskazówki.

## Cel projektu

Celem jest stworzenie elastycznego stroika mobilnego, w którym użytkownik nie jest ograniczony do standardowego instrumentu ani fabrycznego stroju. Aplikacja ma umożliwiać strojenie względem gotowych presetów, tworzenie własnych konfiguracji i wykorzystanie głosu jako źródła dźwięku odniesienia.
