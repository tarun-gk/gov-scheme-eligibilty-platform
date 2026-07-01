Dataset: Government Schemes (Central + Telangana) 
1) Overview

This dataset contains 20 government schemes (10 Central + 10 Telangana) for a university project:
“Government Schemes Eligibility & Recommendation Platform”.

The dataset is designed for:

Scheme discovery (search by state/category)

Eligibility filtering (age, income, gender)

Verified vs unverified rule handling (rules_verified)

2) File Name

schemes_dataset_v2.csv

3) Row Count

Total rows: 20

4) Table Name (MySQL)

schemes

5) Columns (Schema Mapping)
Column Name	Type (MySQL)	Description
scheme_id	INT (PK)	Unique scheme identifier
scheme_name	VARCHAR(255)	Official scheme name
state	ENUM	Central or Telangana
category	VARCHAR(100)	Scheme category (Education, Health, Social Welfare, etc.)
eligibility	TEXT	Human-readable eligibility text
benefits	TEXT	Human-readable benefits text
documents	TEXT	Required documents (if available)
apply_link	TEXT	Official/primary apply link
min_age	INT (NULL)	Minimum age requirement (nullable)
max_age	INT (NULL)	Maximum age requirement (nullable)
income_max	INT (NULL)	Maximum annual income allowed (nullable)
gender_allowed	ENUM	Any, Male, Female, Other
rules_verified	BOOLEAN	1 = verified structured rules, 0 = not fully verified
rule_source	VARCHAR(255)	Source/notes for verified rules
6) Meaning of rules_verified

rules_verified = 1
The scheme has structured eligibility rules filled (age/income/gender) and is reliable for strict filtering.

rules_verified = 0
The scheme may only have general eligibility text, so strict rule filtering may be incomplete.

7) Notes on Eligibility Filtering

Eligibility filtering is applied using:

State match (mandatory)

Optional rule filters:

min_age, max_age

income_max

gender_allowed

If a rule column is NULL, it is treated as “no restriction”.

8) Example Eligibility Query (Demo)

Example user: Telangana, Male, age 24, income 150000

SELECT s.scheme_id, s.scheme_name, s.category, s.apply_link
FROM schemes s
WHERE s.state = 'Telangana'
AND (s.min_age IS NULL OR 24 >= s.min_age)
AND (s.max_age IS NULL OR 24 <= s.max_age)
AND (s.income_max IS NULL OR 150000 <= s.income_max)
AND (s.gender_allowed = 'Any' OR s.gender_allowed = 'Male')
ORDER BY s.rules_verified DESC, s.scheme_id;

9) Dataset Usage Policy

This dataset is created and curated for academic project purposes.
Links and rule sources are provided for demonstration and research usage.