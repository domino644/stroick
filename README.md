# stroick — konfigurowalny stroik muzyczny

Aplikacja mobilna do strojenia instrumentów strunowych za pomocą mikrofonu. Przydatna zarówno dla profesjonalnych muzyków, jak i osób uczących się grać, które chcą szybko dostroić instrument bez konieczności korzystania z fizycznego stroika. Użytkownik może zagrać dźwięk na instrumencie lub zaśpiewać go, a aplikacja rozpozna jego wysokość i wskaże odpowiednią strunę.

# Funkcjonalności
Do większości fukncjonalności potrzebne będzie wykrywanie nut na podstawie pobranego i przeanalizowanego dźwieku z mikrofonu. Przez presety mamy na myśli ustalone strojenia dla konkretnego instrumentu.

### MUST
1. Różne tryby strojenia
    - Wyświetlanie odległości do najbliższej nuty w presecie,
    - Wyświetlanie odległości do wybranej przez użytkownika nuty w presecie,
    - Wyświetlanie odległości do najbliższej nuty (niezależnie od wybranego presetu)
2. Baza presetów na gitarę
    - kilka podstawowych strojeń gitary (np. EADGHE, DGDGHD, ...)
### SHOULD
1. Wsparcie instrumentów z dowolną liczbą dźwięków/strun
    - użytkownik może stworzyć w aplikacji własny instrument z wybranymi dźwiękami i ich liczbą
    - użytkownik może stworzyć preset do istniejącego instrumentu
2. Odgrywanie dźwięku po kliknięciu w niego (jeszcze nie znamy UI)
3. Możliwość dostosowywania bazowej częstotliwości
      - domyślnie jest to 440 Hz, a popularnym jest 432 Hz
### COULD
1. Możliwość zadania nuty stroikowi, a on dostosuje strojenie do tego dźwięku
     - np. fletu nie stroimy bo się nie da i nie stroi, a chcemy dostroić do niego gitarę.
  
# Postęp prac
1. Tydzień 1 (14.10 - 21.10)
    - określenie funkcjonalności aplikacji 
