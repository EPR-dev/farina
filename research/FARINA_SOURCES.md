# Farina Sources Research Notes

Compiled for MVP: *Farina — Being Made Again*.  
Priority: P1 = required for MVP layers · P2 = strengthen next pass · P3 = future enrichment.

---

## 1. Farina Restoration Group — History

| Field | Detail |
| --- | --- |
| **SOURCE** | Farina Restoration Group — History of Farina Settlement |
| **URL** | https://farinarestoration.com/history/ |
| **WHAT IT CONTAINS** | Town proclamation (21 Mar 1878), renaming from Government Gums, 432 quarter-acre blocks, railhead 22 May 1882–1884, peak businesses, population ~600, decline, cemetery last used 1960, abandonment 1980s, rail removed 1993 |
| **USAGE RIGHTS** | Website content © Farina Restoration Group. Use for citation and factual summary; do not republish long passages or their maps without permission |
| **DATA THAT CAN BE EXTRACTED** | Timeline milestones, building inventory narrative, railway dates, population figure (treat as FRG estimate) |
| **PRIORITY** | P1 |

---

## 2. Farina Restoration Group — Town Guide

| Field | Detail |
| --- | --- |
| **SOURCE** | Farina Town Guide / Walking Trail Notes |
| **URL** | https://farinarestoration.com/about-farina/farina-town-guide/ |
| **WHAT IT CONTAINS** | Numbered sites: Bakery, Transcontinental Hotel, Patterson House, stores, Post Office, Blacksmith, Police Station, Exchange Hotel, Moffatt House, Finn house, Anglican Church, Angels Rest, old Police Station; street names (Twelfth/Main, First, Eleventh, North Terrace, Third) |
| **USAGE RIGHTS** | Cite FRG; geometry must be independently digitised or licensed |
| **DATA THAT CAN BE EXTRACTED** | Documented building names, open/close years where stated, modern survival/restoration status |
| **PRIORITY** | P1 |

---

## 3. Farina Restoration Group — Navigating Farina

| Field | Detail |
| --- | --- |
| **SOURCE** | Navigating Farina |
| **URL** | https://farinarestoration.com/about-farina/navigating-farina/ |
| **WHAT IT CONTAINS** | Pastoral lease 1859; wells 1876; early settlement north of creek; railway precinct components; Wells Walking Trail; cemetery notes; Transcontinental foundation stone laid by a local Aboriginal woman 5 June 1878 |
| **USAGE RIGHTS** | Cite FRG; trail map by Bob Brownlee — do not redistribute map image without permission |
| **DATA THAT CAN BE EXTRACTED** | Railway precinct features, water sites, early settlement area (approximate) |
| **PRIORITY** | P1 |

---

## 4. Farina Restoration Group — Land Titles

| Field | Detail |
| --- | --- |
| **SOURCE** | Farina Land Titles |
| **URL** | https://farinarestoration.com/history/farina-land-titles/ |
| **WHAT IT CONTAINS** | 1876 survey by W.H. Cornish & R. Peachey; Light-pattern layout; 432 township + 88 suburban allotments; auction dates Apr–Jun 1878; references to township plan photos and SAPPA |
| **USAGE RIGHTS** | Titles/plan images rights unclear for redistribution — link to source; digitise geometry from public survey sources where possible |
| **DATA THAT CAN BE EXTRACTED** | Allotment counts, survey attribution, sale chronology; future parcel layer |
| **PRIORITY** | P2 (placeholder parcels in MVP) |

---

## 5. NLA / Surveyor-General — Farina Town Plan (1910)

| Field | Detail |
| --- | --- |
| **SOURCE** | *Farina Town at the Government Gums Water Hole* — SA Surveyor-General’s Office |
| **URL** | https://nla.gov.au/nla.obj-231960689 |
| **WHAT IT CONTAINS** | Historic cadastral/town plan (published 1910); scale ca. 1:3,168 |
| **USAGE RIGHTS** | Government copyright ownership noted as South Australia — check NLA reuse terms before hosting raster; MVP links to catalogue |
| **DATA THAT CAN BE EXTRACTED** | Street grid, blocks, lots for georeferencing (next pass) |
| **PRIORITY** | P1 (overlay target); placeholder grid until georeferenced |

---

## 6. State Library of South Australia — Photographs

| Field | Detail |
| --- | --- |
| **SOURCE** | SLSA digital collections (Farina search) |
| **URL** | https://collections.slsa.sa.gov.au/find/farina |
| **WHAT IT CONTAINS** | e.g. B 8007 (Manfield store, 1882); B 9329 (distant view ~1880, S.W. Sweet); PRG 1610/11/175 (street ~1897–98); B 24004 (camels at station, 1928); B 38333 (railway dam, 1909); B 58255 (station ~1920) |
| **USAGE RIGHTS** | SLSA terms vary by item. Prefer Wikimedia Commons mirrors of PD / clearly licensed derivatives; otherwise placeholder + VIEW AT SOURCE |
| **DATA THAT CAN BE EXTRACTED** | Photo metadata, approximate locations, then/now pairs |
| **PRIORITY** | P1 |

---

## 7. Wikimedia Commons — Farina category

| Field | Detail |
| --- | --- |
| **SOURCE** | Category:Farina, South Australia |
| **URL** | https://commons.wikimedia.org/wiki/Category:Farina,_South_Australia |
| **WHAT IT CONTAINS** | Historic SLSA-derived images + modern CC BY-SA photographs (Peterdownunder etc.) of ruins/bakery/hotels |
| **USAGE RIGHTS** | Per-file license (PD / CC BY-SA 4.0 etc.). Recorded in `data/photos.json` and `research/PHOTO_RIGHTS.md` |
| **DATA THAT CAN BE EXTRACTED** | Remotely displayable image URLs with attribution |
| **PRIORITY** | P1 |

---

## 8. Trove / Newspapers

| Field | Detail |
| --- | --- |
| **SOURCE** | Trove digitised newspapers (Farina, railway, drought, hotel searches) |
| **URL** | https://trove.nla.gov.au/ |
| **WHAT IT CONTAINS** | Contemporary reports of railhead, township life, agriculture, drought (search-dependent) |
| **USAGE RIGHTS** | Link to Trove records; use short excerpts only where copyright status permits |
| **DATA THAT CAN BE EXTRACTED** | Dated newspaper citations attached to features |
| **PRIORITY** | P2 (sample links in sources.json for MVP) |

---

## 9. OpenStreetMap — present-day geography

| Field | Detail |
| --- | --- |
| **SOURCE** | OpenStreetMap |
| **URL** | https://www.openstreetmap.org/#map=16/-30.0751/138.2760 |
| **WHAT IT CONTAINS** | Modern tracks, Farina locality, First Street, walking trail tags |
| **USAGE RIGHTS** | © OpenStreetMap contributors — ODbL; attribution required |
| **DATA THAT CAN BE EXTRACTED** | Basemap context; modern feature alignment |
| **PRIORITY** | P1 |

---

## 10. Esri World Imagery (basemap tiles)

| Field | Detail |
| --- | --- |
| **SOURCE** | Esri World Imagery |
| **URL** | https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9 |
| **WHAT IT CONTAINS** | Satellite imagery tiles usable as MapLibre raster basemap |
| **USAGE RIGHTS** | Esri attribution required; see Esri Terms of Use for non-commercial/educational use |
| **DATA THAT CAN BE EXTRACTED** | Visual ground truth for ruins and landscape |
| **PRIORITY** | P1 |

---

## 11. Traditional Owners / Country acknowledgement

| Field | Detail |
| --- | --- |
| **SOURCE** | SA Attorney-General’s Department — Statement of Acknowledgement; AIATSIS Map of Indigenous Australia; Arabana native title (Dodd v SA [2012]); Adnyamathanha / Kuyani secondary references |
| **URLS** | https://www.agd.sa.gov.au/aboriginal-affairs-and-reconciliation/statement-of-acknowledgement-welcome-to-country · https://aiatsis.gov.au/explore/map-indigenous-australia · https://www.nativetitlesa.org/pbcs/arabana-aboriginal-corporation-rntbc/ |
| **WHAT IT CONTAINS** | Guidance to use Native Title Vision for local Traditional Owner names; Arabana determination covers large area including Marree/Lake Eyre; Farina sits in a culturally complex zone near Kuyani / Adnyamathanha associations per secondary sources — **not treated as a determination boundary map in this app** |
| **USAGE RIGHTS** | Acknowledgement text only; no invented boundaries or cultural sites |
| **DATA THAT CAN BE EXTRACTED** | Cautious on-screen acknowledgement; research note for future consultation |
| **PRIORITY** | P1 (acknowledgement); P3 (formal Country mapping after consultation) |

---

## 12. Comparable towns (counterfactual sizing)

| Field | Detail |
| --- | --- |
| **SOURCE** | ABS / Wikipedia locality pages / regional planning notes for Quorn, Hawker, Marree, Oodnadatta, Leigh Creek (comparison candidates) |
| **WHAT IT CONTAINS** | Population and service profiles for inland SA towns with rail/road/pastoral roles |
| **USAGE RIGHTS** | Public statistical facts; document assumptions in METHODOLOGY.md |
| **DATA THAT CAN BE EXTRACTED** | Scenario population bands (e.g. 3,000–6,000 for alternate 2026) |
| **PRIORITY** | P2 |

---

## Still needed (next research pass)

1. Georeferenced 1876/1910 survey plan GeoTIFF (State Records / NLA download + QGIS georeference).
2. Licensed FRG walking-trail KML/KMZ/GPX if available.
3. Full land-title transfer table with permission.
4. Railway alignment from Data SA / Geoscience Australia / historic plans.
5. BOM rainfall series for Farina/Marree for “Why did Farina disappear?” mode.
6. Formal Traditional Owner consultation for Country naming on the experience.
