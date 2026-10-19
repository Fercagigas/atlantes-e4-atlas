# Additional file 1 Methods and regional results

Fernando Cagigas and Laura Monzón

## S1 Scope and analytical identity

This supplement uses the definitive collection `20261018_definitiva`. All six WHO regions, the world, curated Asia-Pacific and its I8 recoding were included, with cleaned and complete samples. Curated Asia-Pacific combines South-East Asian and Western Pacific contexts; it is not an additional WHO region. The world contains regional countries. C1 is primary retrospectively, rather than preregistered. C6 remains withdrawn.

The execution produced 4420 successful and 446 non-applicable tasks. Across the 144 population/sample/case combinations, 128 SEM outputs were estimable and 16 non-applicable. The latter are the South-East Asian models at N=10, below the specified minimum of 15. No unavailable estimate is represented as zero.

## S2 Measures and missing data

Governance averages I3/I4/I5; medicine access I8/I9/I10; education I11/I12; research activity I6/I7. Operational capacity is the mean of the education and research submeans. The outcome is I13, specialised adult-service development. Fixed-weight observed components do not establish a latent measurement structure [9] [10]. I13 is not included arithmetically in the C1 predictors. Shared reporting and conceptual overlap remain possible.

Global scores and curated Asia-Pacific I8/I13 differ. Curated I8 uses regional quartiles; the alternative I8-global analysis changes only I8 and retains curated I13. Neither numerical spacing of ordinal scores nor measurement invariance is established. The primary structural equations contain no external socioeconomic adjustment. Imputation auxiliaries do not constitute such adjustment.

The cleaned sample excludes at least five missing indicators among fourteen, or an observed population below 100,000. Unknown population alone does not trigger exclusion. BayesianRidge posterior IterativeImputer predictions are projected once to a nearby observed donor among five candidates. This is not asserted equivalent to a full chained-equations PMM implementation [11]. Main runs use m=20, root seed 42 and task-specific deterministic streams. MAR and compatibility remain assumptions.

| Population | Sample | Original N | Analysed N |
| --- | --- | --- | --- |
| Curated Asia-Pacific | Cleaned | 41 | 35 |
| Curated Asia-Pacific | Complete | 41 | 41 |
| Asia-Pacific I8 global | Cleaned | 41 | 35 |
| Asia-Pacific I8 global | Complete | 41 | 41 |
| Africa | Cleaned | 47 | 47 |
| Africa | Complete | 47 | 47 |
| Americas | Cleaned | 35 | 30 |
| Americas | Complete | 35 | 35 |
| Eastern Mediterranean | Cleaned | 22 | 22 |
| Eastern Mediterranean | Complete | 22 | 22 |
| Europe | Cleaned | 56 | 51 |
| Europe | Complete | 56 | 56 |
| South-East Asia | Cleaned | 10 | 10 |
| South-East Asia | Complete | 10 | 10 |
| Western Pacific | Cleaned | 31 | 24 |
| Western Pacific | Complete | 31 | 31 |
| World | Cleaned | 201 | 184 |
| World | Complete | 201 | 201 |


## S3 Eight specifications and their estimands

### C1 Parallel access and capacity

Complete model:

```text

Access ~ Governance
Capacity ~ Governance
Services ~ Access + Capacity + Governance
Access ~~ Capacity

```

Restricted comparator:

```text

Access ~ Governance
Capacity ~ Governance
Services ~ Access + Capacity
Access ~~ Capacity

```

| Product | Path |
| --- | --- |
| EI1 | Governance -> Access -> Services |
| EI2 | Governance -> Capacity -> Services |


### C2 Separate education and research

Complete model:

```text

Access ~ Governance
Education ~ Governance
Research ~ Governance
Services ~ Access + Education + Research + Governance
Access ~~ Education
Access ~~ Research
Education ~~ Research

```

Restricted comparator:

```text

Access ~ Governance
Education ~ Governance
Research ~ Governance
Services ~ Access + Education + Research
Access ~~ Education
Access ~~ Research
Education ~~ Research

```

| Product | Path |
| --- | --- |
| EI1 | Governance -> Access -> Services |
| EI2 | Governance -> Education -> Services |
| EI3 | Governance -> Research -> Services |


### C3 Combined governance and capacity

Complete model:

```text

Access ~ GobCap
Services ~ GobCap + Access

```

Restricted comparator:

```text

Access ~ GobCap
Services ~ Access

```

| Product | Path |
| --- | --- |
| EI1 | GobCap -> Access -> Services |


### C4 Medicine access as root

Complete model:

```text

Governance ~ Access
Capacity ~ Access
Services ~ Governance + Capacity + Access
Governance ~~ Capacity

```

Restricted comparator:

```text

Governance ~ Access
Capacity ~ Access
Services ~ Governance + Capacity
Governance ~~ Capacity

```

| Product | Path |
| --- | --- |
| EI1 | Access -> Governance -> Services |
| EI2 | Access -> Capacity -> Services |


### C5 Capacity as root

Complete model:

```text

Governance ~ Capacity
Access ~ Capacity
Services ~ Governance + Access + Capacity
Governance ~~ Access

```

Restricted comparator:

```text

Governance ~ Capacity
Access ~ Capacity
Services ~ Governance + Access
Governance ~~ Access

```

| Product | Path |
| --- | --- |
| EI1 | Capacity -> Governance -> Services |
| EI2 | Capacity -> Access -> Services |


### C7 Serial capacity before access

Complete model:

```text

Capacity ~ Governance
Access ~ Capacity + Governance
Services ~ Access + Capacity + Governance

```

Restricted comparator:

```text

Capacity ~ Governance
Access ~ Capacity
Services ~ Access + Capacity

```

| Product | Path |
| --- | --- |
| EI1 | Governance -> Capacity -> Access -> Services |
| EI2 | Governance -> Capacity -> Services |
| EI3 | Governance -> Access -> Services |


### C8 Two correlated roots

Complete model:

```text

Access ~ Governance + Capacity
Services ~ Access + Governance + Capacity
Governance ~~ Capacity

```

Restricted comparator:

```text

Access ~ Governance + Capacity
Services ~ Access
Governance ~~ Capacity

```

| Product | Path |
| --- | --- |
| EI1 | Governance -> Access -> Services |
| EI2 | Capacity -> Access -> Services |


### C9 Serial access before capacity

Complete model:

```text

Access ~ Governance
Capacity ~ Access + Governance
Services ~ Capacity + Access + Governance

```

Restricted comparator:

```text

Access ~ Governance
Capacity ~ Access
Services ~ Capacity + Access

```

| Product | Path |
| --- | --- |
| EI1 | Governance -> Access -> Capacity -> Services |
| EI2 | Governance -> Access -> Services |
| EI3 | Governance -> Capacity -> Services |


C1 is the primary retrospective specification. C2–C5 and C7–C9 are separate exploratory BH families in the original aggregators. The tables here retain nominal procedure-specific intervals, not simultaneous confidence bands. C4 and C5 change the root; C3 changes the composite; C8 has two correlated roots. Its governance and capacity products must not be added as though they shared one root.

C7 and C9 preserve the same final I13 predictor set. Their serial products and intermediate decompositions differ, while their complete-model total and indirect sum from governance agree up to floating-point precision. This identity does not select a causal order. Governance → access → services is EI3 in C7 and EI2 in C9; it remains distinct from the serial path through both intermediaries.

## S4 Estimation uncertainty and sensitivity

Likelihood SEM coefficient estimates use Rubin pooling with asymptotic complete-data variance and recorded degrees of freedom [12] [13]. Equation-wise OLS produces the indirect point estimates, averaged across imputations. Rounded SEM coefficients are not the inputs for those products.

The principal bootstrap uses 10,000 joint draws. Draw b selects completed dataset b modulo m and resamples countries without reimputing. Joint draws retain dependence for sums and differences. BCa acceleration uses leave-one-out estimates averaged over completed datasets [14]. These intervals do not establish fully integrated missing-data uncertainty or universal coverage; bootstrap/MI order matters [15] [16]. Tail probabilities are not assumed to invert either percentile or BCa intervals.

Every estimable specification receives two independent 4,999-draw bootstrap streams; m=10 and m=40 nested imputations; an independent root seed 43; complete cases; and delta ±0.5 point diagnostics. MI and complete-case sensitivities use 1,999 draws. Complete cases use identical adapter matrices rather than independent imputations. Delta modifies only originally missing cells and is clipped to the allowed score range. Fixed-imputation country omissions do not reimpute or supply new intervals. Both sample definitions and both Asia-Pacific I8 codings are available.

The indirect/total ratio is a ratio of pooled points, not a mean of imputation ratios or a causal mediated percentage. It may be outside [0,1] and unstable near a zero total. Original JSON retains denominator diagnostics and restricted-ratio states.

## S5 Regional dossiers

### Curated Asia-Pacific

The cleaned sample has 35 observations; the complete sample has 41. The I8 recoding retains curated I13 and the same countries.

| C1 conditional path | b | SE | Rubin 95% CI |
| --- | --- | --- | --- |
| Access -> Services | 0.553 | 0.153 | [0.253, 0.853] |
| Capacity -> Services | 0.398 | 0.184 | [0.037, 0.759] |
| Governance -> Access | 0.668 | 0.122 | [0.429, 0.907] |
| Governance -> Capacity | 0.873 | 0.098 | [0.681, 1.065] |
| Governance -> Services | 0.116 | 0.160 | [-0.197, 0.430] |


| C1 quantity | Point | Percentile 95% CI | BCa 95% CI |
| --- | --- | --- | --- |
| EI1 | 0.370 | [0.137, 0.692] | [0.126, 0.674] |
| EI2 | 0.347 | [-0.107, 0.637] | [0.060, 0.753] |
| Indirect sum | 0.717 | [0.346, 1.027] | [0.375, 1.048] |
| Total association | 0.834 | [0.554, 1.070] | [0.545, 1.062] |
| EI1 minus EI2 | 0.022 | [-0.417, 0.696] | [-0.495, 0.560] |
| Indirect / total | 0.860 | [0.417, 1.201] | [0.428, 1.207] |


The C1 indirect-sum percentile interval is entirely positive. The access/capacity difference interval is [-0.417, 0.696].

| C1 setting | N | Indirect sum | Percentile 95% CI |
| --- | --- | --- | --- |
| bootstrap_seed1 | 35 | 0.717 | [0.360, 1.019] |
| bootstrap_seed2 | 35 | 0.717 | [0.347, 1.021] |
| m10_nested | 35 | 0.719 | [0.332, 1.015] |
| m40_nested | 35 | 0.719 | [0.340, 1.021] |
| MI_seed43 | 35 | 0.725 | [0.357, 1.025] |
| complete_cases | 34 | 0.808 | [0.418, 1.090] |
| delta_-0.5 | 35 | 0.741 | Point only |
| delta_+0.5 | 35 | 0.698 | Point only |


With fixed imputations, country-omission indirect sums range from 0.659 to 0.808. These are influence points, not interval bounds. Full alternative cases and both samples are retained in Additional file 2.

### Asia-Pacific I8 global

The cleaned sample has 35 observations; the complete sample has 41. The I8 recoding retains curated I13 and the same countries.

| C1 conditional path | b | SE | Rubin 95% CI |
| --- | --- | --- | --- |
| Access -> Services | 0.553 | 0.190 | [0.181, 0.925] |
| Capacity -> Services | 0.547 | 0.179 | [0.197, 0.898] |
| Governance -> Access | 0.492 | 0.097 | [0.302, 0.682] |
| Governance -> Capacity | 0.873 | 0.098 | [0.681, 1.065] |
| Governance -> Services | 0.083 | 0.172 | [-0.253, 0.419] |


| C1 quantity | Point | Percentile 95% CI | BCa 95% CI |
| --- | --- | --- | --- |
| EI1 | 0.273 | [0.069, 0.565] | [0.060, 0.545] |
| EI2 | 0.478 | [0.016, 0.710] | [0.231, 0.847] |
| Indirect sum | 0.751 | [0.346, 1.033] | [0.418, 1.075] |
| Total association | 0.834 | [0.549, 1.069] | [0.543, 1.065] |
| EI1 minus EI2 | -0.205 | [-0.554, 0.423] | [-0.665, 0.236] |
| Indirect / total | 0.901 | [0.405, 1.276] | [0.412, 1.280] |


The C1 indirect-sum percentile interval is entirely positive. The access/capacity difference interval is [-0.554, 0.423].

| C1 setting | N | Indirect sum | Percentile 95% CI |
| --- | --- | --- | --- |
| bootstrap_seed1 | 35 | 0.751 | [0.365, 1.038] |
| bootstrap_seed2 | 35 | 0.751 | [0.379, 1.028] |
| m10_nested | 35 | 0.753 | [0.380, 1.037] |
| m40_nested | 35 | 0.745 | [0.364, 1.037] |
| MI_seed43 | 35 | 0.748 | [0.396, 1.036] |
| complete_cases | 29 | 0.798 | [0.362, 1.128] |
| delta_-0.5 | 35 | 0.773 | Point only |
| delta_+0.5 | 35 | 0.732 | Point only |


With fixed imputations, country-omission indirect sums range from 0.701 to 0.815. These are influence points, not interval bounds. Full alternative cases and both samples are retained in Additional file 2.

### Africa

The cleaned sample has 47 observations; the complete sample has 47. Global coding is used.

| C1 conditional path | b | SE | Rubin 95% CI |
| --- | --- | --- | --- |
| Access -> Services | 0.117 | 0.141 | [-0.160, 0.394] |
| Capacity -> Services | 0.134 | 0.101 | [-0.065, 0.333] |
| Governance -> Access | 0.280 | 0.074 | [0.135, 0.426] |
| Governance -> Capacity | 0.533 | 0.111 | [0.315, 0.750] |
| Governance -> Services | 0.283 | 0.089 | [0.108, 0.457] |


| C1 quantity | Point | Percentile 95% CI | BCa 95% CI |
| --- | --- | --- | --- |
| EI1 | 0.033 | [-0.045, 0.152] | [-0.061, 0.131] |
| EI2 | 0.071 | [-0.064, 0.193] | [-0.065, 0.193] |
| Indirect sum | 0.104 | [-0.036, 0.281] | [-0.064, 0.258] |
| Total association | 0.387 | [0.240, 0.533] | [0.254, 0.546] |
| EI1 minus EI2 | -0.038 | [-0.160, 0.161] | [-0.178, 0.126] |
| Indirect / total | 0.269 | [-0.078, 0.809] | [-0.175, 0.700] |


The C1 indirect-sum percentile interval includes zero; this is not proof of no association. The access/capacity difference interval is [-0.160, 0.161].

| C1 setting | N | Indirect sum | Percentile 95% CI |
| --- | --- | --- | --- |
| bootstrap_seed1 | 47 | 0.104 | [-0.034, 0.285] |
| bootstrap_seed2 | 47 | 0.104 | [-0.039, 0.278] |
| m10_nested | 47 | 0.105 | [-0.030, 0.286] |
| m40_nested | 47 | 0.103 | [-0.027, 0.286] |
| MI_seed43 | 47 | 0.104 | [-0.034, 0.286] |
| complete_cases | 26 | 0.061 | [-0.116, 0.322] |
| delta_-0.5 | 47 | 0.103 | Point only |
| delta_+0.5 | 47 | 0.100 | Point only |


With fixed imputations, country-omission indirect sums range from 0.082 to 0.181. These are influence points, not interval bounds. Full alternative cases and both samples are retained in Additional file 2.

### Americas

The cleaned sample has 30 observations; the complete sample has 35. Global coding is used.

| C1 conditional path | b | SE | Rubin 95% CI |
| --- | --- | --- | --- |
| Access -> Services | 0.470 | 0.136 | [0.202, 0.738] |
| Capacity -> Services | 0.412 | 0.171 | [0.076, 0.747] |
| Governance -> Access | 0.097 | 0.135 | [-0.168, 0.361] |
| Governance -> Capacity | 0.333 | 0.106 | [0.126, 0.540] |
| Governance -> Services | 0.232 | 0.093 | [0.049, 0.415] |


| C1 quantity | Point | Percentile 95% CI | BCa 95% CI |
| --- | --- | --- | --- |
| EI1 | 0.046 | [-0.081, 0.198] | [-0.067, 0.218] |
| EI2 | 0.137 | [0.029, 0.299] | [0.029, 0.300] |
| Indirect sum | 0.183 | [-0.006, 0.387] | [-0.040, 0.356] |
| Total association | 0.415 | [0.133, 0.666] | [0.104, 0.647] |
| EI1 minus EI2 | -0.091 | [-0.293, 0.101] | [-0.272, 0.121] |
| Indirect / total | 0.441 | [-0.029, 1.043] | [-0.121, 0.957] |


The C1 indirect-sum percentile interval includes zero; this is not proof of no association. The access/capacity difference interval is [-0.293, 0.101].

| C1 setting | N | Indirect sum | Percentile 95% CI |
| --- | --- | --- | --- |
| bootstrap_seed1 | 30 | 0.183 | [-0.017, 0.386] |
| bootstrap_seed2 | 30 | 0.183 | [-0.018, 0.382] |
| m10_nested | 30 | 0.185 | [-0.015, 0.393] |
| m40_nested | 30 | 0.182 | [-0.019, 0.389] |
| MI_seed43 | 30 | 0.180 | [-0.021, 0.392] |
| complete_cases | 24 | 0.297 | [0.100, 0.506] |
| delta_-0.5 | 30 | 0.186 | Point only |
| delta_+0.5 | 30 | 0.180 | Point only |


With fixed imputations, country-omission indirect sums range from 0.148 to 0.252. These are influence points, not interval bounds. Full alternative cases and both samples are retained in Additional file 2.

### Eastern Mediterranean

The cleaned sample has 22 observations; the complete sample has 22. Global coding is used.

| C1 conditional path | b | SE | Rubin 95% CI |
| --- | --- | --- | --- |
| Access -> Services | -0.046 | 0.210 | [-0.457, 0.366] |
| Capacity -> Services | 0.190 | 0.109 | [-0.024, 0.405] |
| Governance -> Access | 0.166 | 0.076 | [0.016, 0.316] |
| Governance -> Capacity | 0.647 | 0.147 | [0.360, 0.934] |
| Governance -> Services | 0.030 | 0.102 | [-0.169, 0.229] |


| C1 quantity | Point | Percentile 95% CI | BCa 95% CI |
| --- | --- | --- | --- |
| EI1 | -0.008 | [-0.130, 0.153] | [-0.239, 0.098] |
| EI2 | 0.123 | [-0.045, 0.258] | [0.000, 0.312] |
| Indirect sum | 0.116 | [-0.097, 0.312] | [-0.117, 0.294] |
| Total association | 0.146 | [-0.038, 0.444] | [-0.032, 0.461] |
| EI1 minus EI2 | -0.131 | [-0.313, 0.090] | [-0.451, 0.003] |
| Indirect / total | 0.794 | [-11.047, 14.775] | [-15.373, 12.697] |


The C1 indirect-sum percentile interval includes zero; this is not proof of no association. The access/capacity difference interval is [-0.313, 0.090].

| C1 setting | N | Indirect sum | Percentile 95% CI |
| --- | --- | --- | --- |
| bootstrap_seed1 | 22 | 0.116 | [-0.091, 0.304] |
| bootstrap_seed2 | 22 | 0.116 | [-0.096, 0.307] |
| m10_nested | 22 | 0.115 | [-0.084, 0.319] |
| m40_nested | 22 | 0.115 | [-0.085, 0.319] |
| MI_seed43 | 22 | 0.116 | [-0.085, 0.323] |
| complete_cases | 16 | 0.129 | [-0.124, 0.377] |
| delta_-0.5 | 22 | 0.116 | Point only |
| delta_+0.5 | 22 | 0.118 | Point only |


With fixed imputations, country-omission indirect sums range from 0.037 to 0.219. These are influence points, not interval bounds. Full alternative cases and both samples are retained in Additional file 2.

### Europe

The cleaned sample has 51 observations; the complete sample has 56. Global coding is used.

| C1 conditional path | b | SE | Rubin 95% CI |
| --- | --- | --- | --- |
| Access -> Services | 0.175 | 0.107 | [-0.036, 0.386] |
| Capacity -> Services | 0.414 | 0.167 | [0.087, 0.741] |
| Governance -> Access | 0.768 | 0.123 | [0.526, 1.010] |
| Governance -> Capacity | 0.673 | 0.084 | [0.509, 0.837] |
| Governance -> Services | 0.438 | 0.132 | [0.180, 0.696] |


| C1 quantity | Point | Percentile 95% CI | BCa 95% CI |
| --- | --- | --- | --- |
| EI1 | 0.134 | [-0.069, 0.301] | [-0.062, 0.304] |
| EI2 | 0.278 | [0.078, 0.541] | [0.089, 0.562] |
| Indirect sum | 0.413 | [0.215, 0.634] | [0.219, 0.639] |
| Total association | 0.851 | [0.667, 1.026] | [0.641, 1.007] |
| EI1 minus EI2 | -0.144 | [-0.554, 0.162] | [-0.588, 0.143] |
| Indirect / total | 0.485 | [0.241, 0.784] | [0.242, 0.784] |


The C1 indirect-sum percentile interval is entirely positive. The access/capacity difference interval is [-0.554, 0.162].

| C1 setting | N | Indirect sum | Percentile 95% CI |
| --- | --- | --- | --- |
| bootstrap_seed1 | 51 | 0.413 | [0.216, 0.634] |
| bootstrap_seed2 | 51 | 0.413 | [0.216, 0.622] |
| m10_nested | 51 | 0.411 | [0.212, 0.627] |
| m40_nested | 51 | 0.414 | [0.211, 0.630] |
| MI_seed43 | 51 | 0.415 | [0.210, 0.634] |
| complete_cases | 38 | 0.397 | [0.176, 0.692] |
| delta_-0.5 | 51 | 0.407 | Point only |
| delta_+0.5 | 51 | 0.419 | Point only |


With fixed imputations, country-omission indirect sums range from 0.387 to 0.460. These are influence points, not interval bounds. Full alternative cases and both samples are retained in Additional file 2.

### South-East Asia

The cleaned sample has 10 observations; the complete sample has 10. Global coding is used.

All eight SEMs in both samples are non-applicable because N is below 15. Descriptives and eligible complementary procedures remain available; the absence of a coefficient is not a null association.

### Western Pacific

The cleaned sample has 24 observations; the complete sample has 31. Global coding is used.

| C1 conditional path | b | SE | Rubin 95% CI |
| --- | --- | --- | --- |
| Access -> Services | 0.498 | 0.219 | [0.067, 0.928] |
| Capacity -> Services | 0.509 | 0.191 | [0.135, 0.883] |
| Governance -> Access | 0.510 | 0.114 | [0.286, 0.733] |
| Governance -> Capacity | 0.915 | 0.122 | [0.676, 1.154] |
| Governance -> Services | 0.051 | 0.187 | [-0.316, 0.417] |


| C1 quantity | Point | Percentile 95% CI | BCa 95% CI |
| --- | --- | --- | --- |
| EI1 | 0.255 | [0.017, 0.638] | [0.006, 0.604] |
| EI2 | 0.466 | [-0.174, 0.910] | [0.011, 1.031] |
| Indirect sum | 0.721 | [0.230, 1.192] | [0.189, 1.171] |
| Total association | 0.771 | [0.481, 1.030] | [0.471, 1.022] |
| EI1 minus EI2 | -0.210 | [-0.766, 0.660] | [-0.917, 0.469] |
| Indirect / total | 0.935 | [0.286, 1.550] | [0.247, 1.530] |


The C1 indirect-sum percentile interval is entirely positive. The access/capacity difference interval is [-0.766, 0.660].

| C1 setting | N | Indirect sum | Percentile 95% CI |
| --- | --- | --- | --- |
| bootstrap_seed1 | 24 | 0.721 | [0.244, 1.182] |
| bootstrap_seed2 | 24 | 0.721 | [0.232, 1.207] |
| m10_nested | 24 | 0.721 | [0.284, 1.191] |
| m40_nested | 24 | 0.720 | [0.261, 1.209] |
| MI_seed43 | 24 | 0.721 | [0.240, 1.181] |
| complete_cases | 18 | 0.798 | [0.093, 1.333] |
| delta_-0.5 | 24 | 0.752 | Point only |
| delta_+0.5 | 24 | 0.697 | Point only |


With fixed imputations, country-omission indirect sums range from 0.667 to 0.874. These are influence points, not interval bounds. Full alternative cases and both samples are retained in Additional file 2.

### World

The cleaned sample has 184 observations; the complete sample has 201. Global coding is used.

| C1 conditional path | b | SE | Rubin 95% CI |
| --- | --- | --- | --- |
| Access -> Services | 0.391 | 0.060 | [0.273, 0.508] |
| Capacity -> Services | 0.318 | 0.071 | [0.180, 0.457] |
| Governance -> Access | 0.499 | 0.057 | [0.387, 0.611] |
| Governance -> Capacity | 0.659 | 0.049 | [0.563, 0.755] |
| Governance -> Services | 0.229 | 0.057 | [0.116, 0.341] |


| C1 quantity | Point | Percentile 95% CI | BCa 95% CI |
| --- | --- | --- | --- |
| EI1 | 0.195 | [0.118, 0.279] | [0.120, 0.280] |
| EI2 | 0.210 | [0.113, 0.306] | [0.117, 0.311] |
| Indirect sum | 0.405 | [0.300, 0.507] | [0.302, 0.509] |
| Total association | 0.633 | [0.523, 0.738] | [0.518, 0.733] |
| EI1 minus EI2 | -0.015 | [-0.157, 0.134] | [-0.163, 0.127] |
| Indirect / total | 0.639 | [0.466, 0.830] | [0.467, 0.832] |


The C1 indirect-sum percentile interval is entirely positive. The access/capacity difference interval is [-0.157, 0.134].

| C1 setting | N | Indirect sum | Percentile 95% CI |
| --- | --- | --- | --- |
| bootstrap_seed1 | 184 | 0.405 | [0.305, 0.509] |
| bootstrap_seed2 | 184 | 0.405 | [0.302, 0.510] |
| m10_nested | 184 | 0.406 | [0.303, 0.508] |
| m40_nested | 184 | 0.404 | [0.302, 0.507] |
| MI_seed43 | 184 | 0.403 | [0.299, 0.504] |
| complete_cases | 130 | 0.365 | [0.240, 0.498] |
| delta_-0.5 | 184 | 0.405 | Point only |
| delta_+0.5 | 184 | 0.404 | Point only |


With fixed imputations, country-omission indirect sums range from 0.393 to 0.432. These are influence points, not interval bounds. Full alternative cases and both samples are retained in Additional file 2.

## S6 Serial order comparisons

The table gives both serial products and the common governance indirect sum for each cleaned population. The full numerical supplement retains EI1, EI2, EI3, totals and both samples. The products compare different paths, not independent estimates of a single temporal mechanism.

| Population | C7 serial | C9 serial | Common indirect sum |
| --- | --- | --- | --- |
| Curated Asia-Pacific | 0.345 | 0.125 | 0.717 |
| Asia-Pacific I8 global | 0.214 | 0.129 | 0.751 |
| Africa | 0.012 | 0.015 | 0.104 |
| Americas | 0.112 | 0.017 | 0.183 |
| Eastern Mediterranean | -0.004 | 0.015 | 0.116 |
| Europe | 0.086 | 0.099 | 0.413 |
| Western Pacific | 0.200 | 0.139 | 0.721 |
| World | 0.147 | 0.066 | 0.405 |


## S7 Complementary analyses and formal regional comparisons

The atlas provides recalculated measurement diagnostics, alternative estimators, outlier protocols, multiverse, contextual and regional analyses. Each task retains its inputs, output state and reason. Availability does not make an estimator appropriate for every scientific claim. Related methods are not independent replications, and counts of significant results are not a consensus measure.

The alias FIML uses a complete-data MLW objective in this implementation; the Bayesian analysis on averaged imputations is not a joint missing-data model. Those labels do not justify stronger inferential claims. Contextual checks and adjusted alternative models have their own specifications and do not transform the unadjusted C1 model into a contextual causal analysis.

The current transfer output retains unavailable comparisons and their reasons. Its complete destination-by-case results are in the original `13b_transferencia_regional` task and the atlas. No prediction coefficient from a retired collection is imported. The numerical supplement includes the current C1 transfer record for each destination.

Formal comparisons require compatible measurement and independent cohorts. Curated/global differences and overlapping countries lead to explicitly unavailable tests or transport estimates where required. Descriptive coefficient differences are retained, but unavailable contrasts do not become evidence of equality. Prediction and cross-sectional association are distinct estimands [20] [19].

## S8 Two simulation designs

The 72-cell atlas-calibrated C1 design uses 1,000 repetitions per cell and retains its estimators, truths, missingness conditions and effective denominators in `simulation_atlas.csv`. These rows are not pooled with the separate continuous-data experiment. Neither design evaluates C9 or proves that empirical regional intervals attain nominal coverage.

The separate joint experiment comprises seven scenarios: complete N35, MAR N35, MAR N184, null/MAR N35, formative mixture N35, nonlinear response N35 and MNAR N35. Each has 400 repetitions, m=5 and B=499. Baseline slopes are a1=0.5, a2=0.4, b1=0.4, b2=0.3 and c=0.1; continuous components generate indicators as 2.5+0.15 times the component. The formative cell modifies the observed-component covariance rather than substituting latent coefficients as truth. A symmetric quadratic outcome term preserves its linear projection while changing the conditional mean. Missingness probability is 0.3 expit(z), with observed Y for MAR and the indicator value for MNAR; outcome I13 remains observed in this experiment. The protocol and per-replica records accompany the task originals [17].

Coverage is reported both conditional on valid intervals and over all attempts, alongside failures and Monte Carlo standard errors. The largest possible proportional MCSE at 400 independent attempts is 0.025; zero plugin MCSE at an endpoint is not certainty. A null outcome cell does not make the first-stage governance slopes zero. Type-I labels require a zero truth for the particular estimand.

| Scenario | Method | Attempts | Valid | Coverage valid | Coverage attempts | MCSE |
| --- | --- | --- | --- | --- | --- | --- |
| A_MAR184 | bca95 | 400 | 400 | 0.943 | 0.943 | 0.012 |
| A_MAR184 | pct95 | 400 | 400 | 0.940 | 0.940 | 0.012 |
| A_MAR35 | bca95 | 400 | 400 | 0.950 | 0.950 | 0.011 |
| A_MAR35 | pct95 | 400 | 400 | 0.943 | 0.943 | 0.012 |
| A_complete35 | bca95 | 400 | 400 | 0.948 | 0.948 | 0.011 |
| A_complete35 | pct95 | 400 | 400 | 0.953 | 0.953 | 0.011 |
| A_null_MAR35 | bca95 | 400 | 400 | 0.963 | 0.963 | 0.009 |
| A_null_MAR35 | pct95 | 400 | 400 | 0.988 | 0.988 | 0.006 |
| B_formative35 | bca95 | 400 | 400 | 0.943 | 0.943 | 0.012 |
| B_formative35 | pct95 | 400 | 400 | 0.925 | 0.925 | 0.013 |
| C_nonlinear35 | bca95 | 400 | 400 | 0.935 | 0.935 | 0.012 |
| C_nonlinear35 | pct95 | 400 | 400 | 0.943 | 0.943 | 0.012 |
| D_MNAR35 | bca95 | 400 | 400 | 0.950 | 0.950 | 0.011 |
| D_MNAR35 | pct95 | 400 | 400 | 0.955 | 0.955 | 0.010 |


All 91 joint summary rows are in `simulation_joint.csv` and the original summary; the detailed per-replica records are available in the atlas. The 72-cell design has a separate full table and denominator scheme. Neither success nor failure in selected cells provides a universal calibration claim.

## S9 Complete numerical supplement and reproducibility

Additional file 2 contains every coefficient and quantity from all eight cases in both samples, all sensitivity coefficients and quantities, all country omissions, applicability/scenario states, missingness/descriptives, serial comparisons and both simulation summaries. Tables carry population, sample and specification identifiers and unrounded values. No rows are selected by significance. A data dictionary and SHA-256 manifest accompany the files.

The editorial command is `python scripts/publicar_definitivos.py`. It verifies each consumed result against its task marker, regenerates figures and numerical text, and records source hashes. The collection manifest records two computational segments: the full run and a repair with all dependent nodes recalculated. It does not attribute the final code identity retroactively to unchanged tasks. Statistical reruns and editorial reconstruction are separate procedures [18].

## S10 Interpretation and author declarations

These are national cross-sectional associations. Temporal order, causal mediation and effects on individual patients remain unidentified. Coding, shared informants, confounding, score resolution, small samples and missing-data assumptions qualify interpretation. New C9 results examine a specification alternative, not a newly validated causal mechanism. Regional differences motivate locally grounded and longitudinal work rather than an intervention ranking.

Individual affiliations, corresponding-author details, ethics determination, permissions/access, funding, conflicts, CRediT and final AI-assistance disclosure require author completion. No ethics exemption, public-data licence or journal-quartile certification is inferred. The package is for author review, not an already submitted article.

## References

1. Knaul Felicia Marie, Farmer Paul E, Krakauer Eric L, De Lima Liliana, Bhadelia Afsan, Jiang Kwete Xiaoxiao. et al. Alleviating the access abyss in palliative care and pain relief—an imperative of universal health coverage: the Lancet Commission report. The Lancet. 2018. https://doi.org/10.1016/s0140-6736(17)32513-8

2. World Health Organization . Assessing the development of palliative care worldwide: a set of actionable indicators. Geneva: WHO. 2021. https://www.who.int/publications/i/item/9789240033351

3. Tripodoro Vilma A., Fidalgo Jesús Fernando López, Pons Juan José, Connor Stephen R., Garralda Eduardo, Bastos Fernanda. et al. First-Ever Global Ranking of Palliative Care: 2025 World Map Under the New WHO Framework. Journal of Pain and Symptom Management. 2025. https://doi.org/10.1016/j.jpainsymman.2025.07.026

4. Clark David, Baur Nicole, Clelland David, Garralda Eduardo, López-Fidalgo Jesús, Connor Stephen. et al. Mapping Levels of Palliative Care Development in 198 Countries: The Situation in 2017. Journal of Pain and Symptom Management. 2020. https://doi.org/10.1016/j.jpainsymman.2019.11.009

5. Carpén Timo P, Monzón-Llamas Laura, Hannon Breffni L, Pawłowski Leszek, Saarto Tiina H, Pöyhiä Reino T. et al. National palliative care laws in Europe: do they enable access and effectively promote the development of palliative care within health systems? A comparative multimethod analysis. European Journal of Public Health. 2026. https://doi.org/10.1093/eurpub/ckag147

6. Tardelli Natália Rocha, Fukushima Fernanda Bono, van der Steen Jenny T., Rodríguez Manuel Iván Cobas, Mikelyte Rasa, Forte Daniel Neves. et al. Mapping advance care planning and advance directives in Latin America. BMC Palliative Care. 2025. https://doi.org/10.1186/s12904-025-01849-5

7. Agbodande Kouessi Anthelme, Gnangnon Freddy, Assogba Mickael, Avakoudjo Josué, Azon Kouanou Angèle, Odoulamy Lisette. et al. Palliative care progress in Benin: a situation analysis using the WHO development indicators. BMC Palliative Care. 2024. https://doi.org/10.1186/s12904-024-01473-9

8. Mitchell Rebecca J, Delaney Geoffrey P, Arnolda Gaston, Liauw Winston, Phillips Jane L, Lystad Reidar P. et al. Potentially burdensome care at the end-of-life for cancer decedents: a retrospective population-wide study. BMC Palliative Care. 2024. https://doi.org/10.1186/s12904-024-01358-x

9. Bollen Kenneth, Lennox Richard. Conventional wisdom on measurement: A structural equation perspective.. Psychological Bulletin. 1991. https://doi.org/10.1037/0033-2909.110.2.305

10. Saisana M., Saltelli A., Tarantola S.. Uncertainty and Sensitivity Analysis Techniques as Tools for the Quality Assessment of Composite Indicators. Journal of the Royal Statistical Society Series A: Statistics in Society. 2005. https://doi.org/10.1111/j.1467-985x.2005.00350.x

11. Buuren Stef van, Groothuis-Oudshoorn Karin. mice: Multivariate Imputation by Chained Equations inR. Journal of Statistical Software. 2011. https://doi.org/10.18637/jss.v045.i03

12. Rubin Donald B.. Multiple Imputation for Nonresponse in Surveys. Wiley Series in Probability and Statistics. 1987. https://doi.org/10.1002/9780470316696

13. Barnard J, Rubin DB. Miscellanea. Small-sample degrees of freedom with multiple imputation. Biometrika. 1999. https://doi.org/10.1093/biomet/86.4.948

14. Efron Bradley. Better Bootstrap Confidence Intervals. Journal of the American Statistical Association. 1987. https://doi.org/10.1080/01621459.1987.10478410

15. Schomaker Michael, Heumann Christian. Bootstrap inference when using multiple imputation. Statistics in Medicine. 2018. https://doi.org/10.1002/sim.7654

16. Bartlett Jonathan W, Hughes Rachael A. Bootstrap inference for multiple imputation under uncongeniality and misspecification. Statistical Methods in Medical Research. 2020. https://doi.org/10.1177/0962280220932189

17. Morris Tim P., White Ian R., Crowther Michael J.. Using simulation studies to evaluate statistical methods. Statistics in Medicine. 2019. https://doi.org/10.1002/sim.8086

18. Sandve Geir Kjetil, Nekrutenko Anton, Taylor James, Hovig Eivind. Ten Simple Rules for Reproducible Computational Research. PLoS Computational Biology. 2013. https://doi.org/10.1371/journal.pcbi.1003285

19. Morgenstern Hal. Ecologic Studies in Epidemiology: Concepts, Principles, and Methods. Annual Review of Public Health. 1995. https://doi.org/10.1146/annurev.pu.16.050195.000425

20. Bareinboim Elias, Pearl Judea. Causal inference and the data-fusion problem. Proceedings of the National Academy of Sciences. 2016. https://doi.org/10.1073/pnas.1510507113
