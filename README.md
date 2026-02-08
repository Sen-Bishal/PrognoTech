# PrognoTech Medical Calculator Reference

This README documents how each score is calculated in this codebase for fast bedside interpretation.

Medical disclaimer: this is decision-support software and does not replace clinician judgment or local protocol.

## Supported Scores

1. Child-Pugh
2. MELD
3. APACHE II
4. SOFA
5. Wells DVT
6. Wells PE
7. CHA2DS2-VASc

## Child-Pugh

### Criteria and points

| Parameter | 1 point | 2 points | 3 points |
| --- | --- | --- | --- |
| Bilirubin (mg/dL) | `< 2` | `2 to 3` | `> 3` |
| Albumin (g/dL) | `> 3.5` | `2.8 to 3.5` | `< 2.8` |
| INR | `< 1.7` | `1.7 to 2.3` | `> 2.3` |
| Ascites | none | mild | moderate_to_severe |
| Encephalopathy | grade `0` | grade `1 to 2` | grade `3 to 4` |

### Total score

`Total = sum of all 5 components` (range `5 to 15`).

### Tier meaning

| Total | Class | Meaning | 1-year survival | 2-year survival |
| --- | --- | --- | --- | --- |
| `5 to 6` | A | Well-compensated disease | `100%` | `85%` |
| `7 to 9` | B | Significant functional compromise | `80%` | `60%` |
| `10 to 15` | C | Decompensated disease | `45%` | `35%` |

## MELD

### Criteria and scoring method

Inputs:
1. Bilirubin
2. INR
3. Creatinine

Input bounding used by the implementation:
1. Values `< 1` are set to `1`.
2. Values `> 4` are set to `4`.

Formula:

`raw = 3.78*ln(bilirubin_used) + 11.2*ln(inr_used) + 9.57*ln(creatinine_used) + 6.43`

Final score:

`MELD = round(raw)`, then bounded to `6 to 40`.

### Tier meaning

| Total | Meaning | 3-month mortality |
| --- | --- | --- |
| `<= 9` | Lower short-term mortality risk | `1.9%` |
| `10 to 19` | Moderate short-term mortality risk | `6.0%` |
| `20 to 29` | High short-term mortality risk | `19.6%` |
| `30 to 39` | Very high short-term mortality risk | `52.6%` |
| `>= 40` | Critical short-term mortality risk | `71.3%` |

## APACHE II

### Core structure

`Total APACHE II = Acute Physiology Score + Age points + Chronic health points`

### Acute Physiology Score criteria

#### Temperature (deg C)

| Range | Points |
| --- | --- |
| `>= 41` | 4 |
| `39 to 40.9` | 3 |
| `38.5 to 38.9` | 1 |
| `36 to 38.4` | 0 |
| `34 to 35.9` | 1 |
| `32 to 33.9` | 2 |
| `30 to 31.9` | 3 |
| `< 30` | 4 |

#### Mean arterial pressure (mmHg)

| Range | Points |
| --- | --- |
| `>= 160` | 4 |
| `130 to 159` | 3 |
| `110 to 129` | 2 |
| `70 to 109` | 0 |
| `50 to 69` | 2 |
| `< 50` | 4 |

#### Heart rate (bpm)

| Range | Points |
| --- | --- |
| `>= 180` | 4 |
| `140 to 179` | 3 |
| `110 to 139` | 2 |
| `70 to 109` | 0 |
| `55 to 69` | 2 |
| `40 to 54` | 3 |
| `< 40` | 4 |

#### Respiratory rate (breaths/min)

| Range | Points |
| --- | --- |
| `>= 50` | 4 |
| `35 to 49` | 3 |
| `25 to 34` | 1 |
| `12 to 24` | 0 |
| `10 to 11` | 1 |
| `6 to 9` | 2 |
| `< 6` | 4 |

#### Oxygenation branch

If `FiO2 >= 0.5`, use A-a gradient:

| A-a gradient (mmHg) | Points |
| --- | --- |
| `< 200` | 0 |
| `200 to 349` | 2 |
| `350 to 499` | 3 |
| `>= 500` | 4 |

If `FiO2 < 0.5`, use PaO2:

| PaO2 (mmHg) | Points |
| --- | --- |
| `>= 70` | 0 |
| `61 to 69` | 1 |
| `55 to 60` | 3 |
| `< 55` | 4 |

#### Acid-base branch

If arterial pH is provided, use pH:

| Arterial pH | Points |
| --- | --- |
| `>= 7.70` | 4 |
| `7.60 to 7.69` | 3 |
| `7.50 to 7.59` | 1 |
| `7.33 to 7.49` | 0 |
| `7.25 to 7.32` | 2 |
| `7.15 to 7.24` | 3 |
| `< 7.15` | 4 |

If arterial pH is not provided, use serum bicarbonate:

| HCO3 (mEq/L) | Points |
| --- | --- |
| `>= 52` | 4 |
| `41 to 51.9` | 3 |
| `32 to 40.9` | 1 |
| `22 to 31.9` | 0 |
| `18 to 21.9` | 2 |
| `15 to 17.9` | 3 |
| `< 15` | 4 |

#### Sodium (mmol/L)

| Range | Points |
| --- | --- |
| `>= 180` | 4 |
| `160 to 179` | 3 |
| `155 to 159` | 2 |
| `150 to 154` | 1 |
| `130 to 149` | 0 |
| `120 to 129` | 2 |
| `111 to 119` | 3 |
| `< 111` | 4 |

#### Potassium (mmol/L)

| Range | Points |
| --- | --- |
| `>= 7.0` | 4 |
| `6.0 to 6.9` | 3 |
| `5.5 to 5.9` | 1 |
| `3.5 to 5.4` | 0 |
| `3.0 to 3.4` | 1 |
| `2.5 to 2.9` | 2 |
| `< 2.5` | 4 |

#### Creatinine (mg/dL)

| Range | Base points |
| --- | --- |
| `>= 3.5` | 4 |
| `2.0 to 3.4` | 3 |
| `1.5 to 1.9` | 2 |
| `0.6 to 1.49` | 0 |
| `< 0.6` | 2 |

If `acuteRenalFailure = true`, creatinine points are doubled.

#### Hematocrit (%)

| Range | Points |
| --- | --- |
| `>= 60` | 4 |
| `50 to 59.9` | 2 |
| `46 to 49.9` | 1 |
| `30 to 45.9` | 0 |
| `20 to 29.9` | 2 |
| `< 20` | 4 |

#### WBC (10^3/uL)

| Range | Points |
| --- | --- |
| `>= 40` | 4 |
| `20 to 39.9` | 2 |
| `15 to 19.9` | 1 |
| `3 to 14.9` | 0 |
| `1 to 2.9` | 2 |
| `< 1` | 4 |

#### Glasgow Coma Scale

`GCS points = 15 - GCS`

### Age points

| Age | Points |
| --- | --- |
| `< 45` | 0 |
| `45 to 54` | 2 |
| `55 to 64` | 3 |
| `65 to 74` | 5 |
| `>= 75` | 6 |

### Chronic health points

| State | Points |
| --- | --- |
| none | 0 |
| elective_postop | 2 |
| emergency_postop | 5 |
| nonoperative | 5 |

### Tier meaning

| Total | Meaning | Estimated hospital mortality |
| --- | --- | --- |
| `0 to 4` | Low severity of illness | `~4%` |
| `5 to 9` | Mild severity of illness | `~8%` |
| `10 to 14` | Moderate severity of illness | `~15%` |
| `15 to 19` | Substantial severity of illness | `~25%` |
| `20 to 24` | High severity of illness | `~40%` |
| `25 to 29` | Very high severity of illness | `~55%` |
| `30 to 34` | Critical severity of illness | `~75%` |
| `>= 35` | Extremely critical severity of illness | `~85%` |

## SOFA

`Total SOFA = respiratory + coagulation + liver + cardiovascular + CNS + renal`

Each organ domain scores `0 to 4`, total range `0 to 24`.

### Respiratory (PaO2/FiO2)

| Criteria | Points |
| --- | --- |
| `>= 400` | 0 |
| `300 to 399` | 1 |
| `200 to 299` | 2 |
| `< 200` and on respiratory support | 3 |
| `< 100` and on respiratory support | 4 |

### Coagulation (platelets, 10^3/uL)

| Range | Points |
| --- | --- |
| `>= 150` | 0 |
| `100 to 149` | 1 |
| `50 to 99` | 2 |
| `20 to 49` | 3 |
| `< 20` | 4 |

### Liver (bilirubin, mg/dL)

| Range | Points |
| --- | --- |
| `< 1.2` | 0 |
| `1.2 to 1.9` | 1 |
| `2.0 to 5.9` | 2 |
| `6.0 to 11.9` | 3 |
| `>= 12` | 4 |

### Cardiovascular

| Criteria | Points |
| --- | --- |
| MAP `>= 70` and no vasopressor criteria below | 0 |
| MAP `< 70` | 1 |
| dopamine `>0 and <=5` or any dobutamine `>0` | 2 |
| dopamine `>5 and <=15`, or epinephrine `>0 and <=0.1`, or norepinephrine `>0 and <=0.1` | 3 |
| dopamine `>15`, or epinephrine `>0.1`, or norepinephrine `>0.1` | 4 |

### CNS (GCS)

| GCS | Points |
| --- | --- |
| 15 | 0 |
| 13 to 14 | 1 |
| 10 to 12 | 2 |
| 6 to 9 | 3 |
| `< 6` | 4 |

### Renal

Creatinine branch:

| Creatinine (mg/dL) | Points |
| --- | --- |
| `< 1.2` | 0 |
| `1.2 to 1.9` | 1 |
| `2.0 to 3.4` | 2 |
| `3.5 to 4.9` | 3 |
| `>= 5` | 4 |

Urine branch:

| Urine output (mL/day) | Points |
| --- | --- |
| `>= 500` | 0 |
| `< 500` | 3 |
| `< 200` | 4 |

Renal subscore uses the higher of creatinine-based and urine-based points.

### Tier meaning

| Total | Meaning | Risk band |
| --- | --- | --- |
| `0 to 1` | No significant organ dysfunction | Very low ICU mortality risk |
| `2 to 5` | Mild organ dysfunction | Low ICU mortality risk |
| `6 to 9` | Moderate organ dysfunction | Intermediate ICU mortality risk |
| `10 to 12` | Severe organ dysfunction | High ICU mortality risk |
| `>= 13` | Critical multi-organ dysfunction | Very high ICU mortality risk |

## Wells DVT

### Criteria and points

Each of the following is `+1` if true:
1. Active cancer
2. Paralysis or recent immobilization
3. Recently bedridden or major surgery
4. Localized tenderness along deep venous system
5. Entire leg swollen
6. Calf swelling at least 3 cm
7. Pitting edema confined to symptomatic leg
8. Collateral superficial veins
9. Previous DVT

Penalty:
1. Alternative diagnosis as likely or more likely: `-2`

`Total = positive criteria count - 2 if alternative diagnosis is present`

### Tier meaning (3-level)

| Total | Meaning |
| --- | --- |
| `<= 0` | Low pretest probability |
| `1 to 2` | Moderate pretest probability |
| `>= 3` | High pretest probability |

### Tier meaning (2-level)

| Total | Meaning |
| --- | --- |
| `< 2` | DVT unlikely |
| `>= 2` | DVT likely |

## Wells PE

### Criteria and points

| Criterion | Points |
| --- | --- |
| Clinical signs of DVT | 3 |
| PE most likely diagnosis | 3 |
| Heart rate `> 100` | 1.5 |
| Immobilization or recent surgery | 1.5 |
| Previous DVT or PE | 1.5 |
| Hemoptysis | 1 |
| Malignancy | 1 |

`Total = sum of all points` (range `0 to 12.5`).

### Tier meaning (3-level)

| Total | Meaning | Estimated prevalence |
| --- | --- | --- |
| `< 2` | Low pretest probability | `~1.3%` |
| `2 to 6` | Moderate pretest probability | `~16.2%` |
| `> 6` | High pretest probability | `~37.5%` |

### Tier meaning (2-level)

| Total | Meaning |
| --- | --- |
| `<= 4` | PE unlikely |
| `> 4` | PE likely |

## CHA2DS2-VASc

### Criteria and points

| Criterion | Points |
| --- | --- |
| Congestive heart failure or LV dysfunction | 1 |
| Hypertension | 1 |
| Age `65 to 74` | 1 |
| Age `>= 75` | 2 |
| Diabetes mellitus | 1 |
| Prior stroke/TIA/thromboembolism | 2 |
| Vascular disease | 1 |
| Sex category female | 1 |

`Total = sum of points` (range `0 to 9`).

### Tier meaning used by this app

| Category | Definition |
| --- | --- |
| Low | male total `0`, or female with non-sex score `0` (sex-only point) |
| Intermediate | male total `1`, or female total `2` |
| High | male total `>= 2`, or female total `>= 3` |

### Recommendation text used by this app

| Category | Recommendation |
| --- | --- |
| Low | No anticoagulation is recommended based on CHA2DS2-VASc alone. |
| Intermediate | Consider anticoagulation after shared decision-making and bleeding-risk assessment. |
| High | Anticoagulation is generally recommended unless contraindicated. |

## Run the Project

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
