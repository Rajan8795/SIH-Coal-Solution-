
import pandas as pd
import re
from pathlib import Path
from difflib import SequenceMatcher

# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

MINE_MASTER_PATH = Path("data/processed/mine_master.csv")
CAAQMS_PATH = Path("data/processed/caaqms_cleaned.csv")
PRODUCTION_PATH = Path("data/processed/production_features.csv")
OUTPUT_PATH = Path("data/processed/mine_mapping.csv")


# ---------------------------------------------------------
# TEXT NORMALIZATION
# ---------------------------------------------------------

def normalize_text(value):
    """
    Normalize text for comparison.
    """
    if pd.isna(value):
        return ""

    value = str(value).lower().strip()

    # Replace special characters with spaces
    value = re.sub(r"[^a-z0-9]+", " ", value)

    # Remove common organization words
    stop_words = {
        "m",
        "s",
        "ltd",
        "limited",
        "project",
        "colliery",
        "coal",
        "fields",
        "field",
        "company",
        "companies",
        "south",
        "eastern",
        "coalfields",
    }

    tokens = [
        token
        for token in value.split()
        if token not in stop_words
    ]

    return " ".join(tokens)


def token_similarity(text1, text2):
    """
    Compare two normalized strings using:
    1. Sequence similarity
    2. Token overlap
    """

    if not text1 or not text2:
        return 0.0

    sequence_score = SequenceMatcher(
        None,
        text1,
        text2
    ).ratio()

    tokens1 = set(text1.split())
    tokens2 = set(text2.split())

    if not tokens1 or not tokens2:
        token_score = 0.0
    else:
        intersection = len(tokens1.intersection(tokens2))
        union = len(tokens1.union(tokens2))

        token_score = (
            intersection / union
            if union > 0
            else 0.0
        )

    return (0.6 * sequence_score) + (0.4 * token_score)


# ---------------------------------------------------------
# LOAD DATA
# ---------------------------------------------------------

master = pd.read_csv(MINE_MASTER_PATH)
caaqms = pd.read_csv(CAAQMS_PATH)
production = pd.read_csv(PRODUCTION_PATH)


# ---------------------------------------------------------
# PREPARE MASTER
# ---------------------------------------------------------

master["Normalized_Mine_Name"] = (
    master["Mine Name"]
    .apply(normalize_text)
)

master["Normalized_Company"] = (
    master["Company Name"]
    .apply(normalize_text)
)

master["Normalized_State"] = (
    master["State"]
    .apply(normalize_text)
)


# ---------------------------------------------------------
# PREPARE CAAQMS
# ---------------------------------------------------------

caaqms["Source"] = "CAAQMS"

caaqms_names = (
    caaqms["Mine Name"]
    .dropna()
    .unique()
    .tolist()
)


# ---------------------------------------------------------
# PREPARE PRODUCTION
# ---------------------------------------------------------

production["Source"] = "Production"

production_names = (
    production["Producing Mine"]
    .dropna()
    .unique()
    .tolist()
)


# ---------------------------------------------------------
# VERIFIED CAAQMS MAPPINGS
# ---------------------------------------------------------
#
# These two mappings were verified against Mine Master.
#
# AQMS_H_Q is intentionally NOT mapped because there is
# no reliable mine-level match in Mine Master.
# ---------------------------------------------------------

verified_caaqms_mapping = {

    "M/s Dipka Expansion Project South Eastern Coal Fields Limited Dipka Area":
        "Dipka",

    "SECL GEVRA":
        "Gevra",
}


# ---------------------------------------------------------
# MASTER LOOKUP
# ---------------------------------------------------------

master_lookup = {}

for _, row in master.iterrows():

    mine_name = str(row["Mine Name"]).strip()

    if mine_name not in master_lookup:
        master_lookup[mine_name] = row


# ---------------------------------------------------------
# MATCH FUNCTION
# ---------------------------------------------------------

def find_best_match(
    source_name,
    source_company="",
    source_state=""
):

    normalized_source_name = normalize_text(
        source_name
    )

    normalized_source_company = normalize_text(
        source_company
    )

    normalized_source_state = normalize_text(
        source_state
    )

    candidates = []

    for _, row in master.iterrows():

        master_name = str(
            row["Mine Name"]
        ).strip()

        name_score = token_similarity(
            normalized_source_name,
            row["Normalized_Mine_Name"]
        )

        company_score = 0.0

        if normalized_source_company:

            company_score = token_similarity(
                normalized_source_company,
                row["Normalized_Company"]
            )

        state_score = 0.0

        if normalized_source_state:

            state_score = token_similarity(
                normalized_source_state,
                row["Normalized_State"]
            )

        # -------------------------------------------------
        # Weighted score
        # -------------------------------------------------

        if normalized_source_company and normalized_source_state:

            final_score = (
                0.70 * name_score
                + 0.20 * company_score
                + 0.10 * state_score
            )

        elif normalized_source_company:

            final_score = (
                0.80 * name_score
                + 0.20 * company_score
            )

        elif normalized_source_state:

            final_score = (
                0.90 * name_score
                + 0.10 * state_score
            )

        else:

            final_score = name_score

        candidates.append(
            (
                master_name,
                final_score,
                name_score,
                company_score,
                state_score,
                row
            )
        )

    if not candidates:
        return None

    candidates.sort(
        key=lambda x: x[1],
        reverse=True
    )

    best = candidates[0]

    second_score = (
        candidates[1][1]
        if len(candidates) > 1
        else 0.0
    )

    score_gap = best[1] - second_score

    return {
        "master_name": best[0],
        "score": best[1],
        "name_score": best[2],
        "company_score": best[3],
        "state_score": best[4],
        "score_gap": score_gap,
        "row": best[5],
    }


# ---------------------------------------------------------
# CREATE SOURCE RECORDS
# ---------------------------------------------------------

records = []


# =========================================================
# CAAQMS MAPPING
# =========================================================

for source_name in caaqms_names:

    # -----------------------------------------------------
    # First check verified manual mapping
    # -----------------------------------------------------

    if source_name in verified_caaqms_mapping:

        master_name = verified_caaqms_mapping[
            source_name
        ]

        master_rows = master[
            master["Mine Name"].str.strip()
            == master_name
        ]

        if len(master_rows) > 0:

            master_row = master_rows.iloc[0]

            records.append({

                "Source": "CAAQMS",

                "Source_Mine_Name":
                    source_name,

                "Source_Company":
                    master_row["Company Name"],

                "Source_State":
                    master_row["State"],

                "Master_Mine_Name":
                    master_row["Mine Name"],

                "Master_Company":
                    master_row["Company Name"],

                "Master_State":
                    master_row["State"],

                "Master_District":
                    master_row["District"],

                "Master_Coalfield":
                    master_row["Coalfield"],

                "Master_Area":
                    master_row["Area"],

                "Master_Mine_Type":
                    master_row["Mine Type"],

                "Master_Ownership":
                    master_row["Ownership"],

                "Match_Type":
                    "Verified_Manual",

                "Match_Score":
                    1.0,

                "Score_Gap":
                    1.0,

                "Review_Required":
                    "No",

                "Mapping_Status":
                    "Verified"

            })

            continue

    # -----------------------------------------------------
    # AQMS_H_Q or any other unmatched CAAQMS record
    # -----------------------------------------------------

    records.append({

        "Source": "CAAQMS",

        "Source_Mine_Name":
            source_name,

        "Source_Company":
            "",

        "Source_State":
            "",

        "Master_Mine_Name":
            "",

        "Master_Company":
            "",

        "Master_State":
            "",

        "Master_District":
            "",

        "Master_Coalfield":
            "",

        "Master_Area":
            "",

        "Master_Mine_Type":
            "",

        "Master_Ownership":
            "",

        "Match_Type":
            "Unmatched",

        "Match_Score":
            0.0,

        "Score_Gap":
            0.0,

        "Review_Required":
            "Yes",

        "Mapping_Status":
            "Unmatched"

    })


# =========================================================
# PRODUCTION MAPPING
# =========================================================

# Production contains company and state information,
# so we use them as additional matching context.

production_context = (
    production[
        [
            "Producing Mine",
            "Company",
            "State"
        ]
    ]
    .drop_duplicates()
)


for _, source_row in production_context.iterrows():

    source_name = source_row["Producing Mine"]

    source_company = source_row["Company"]

    source_state = source_row["State"]

    if pd.isna(source_name):
        continue

    source_name = str(source_name).strip()

    result = find_best_match(
        source_name,
        source_company,
        source_state
    )

    if result is None:

        records.append({

            "Source": "Production",

            "Source_Mine_Name":
                source_name,

            "Source_Company":
                source_company,

            "Source_State":
                source_state,

            "Master_Mine_Name":
                "",

            "Master_Company":
                "",

            "Master_State":
                "",

            "Master_District":
                "",

            "Master_Coalfield":
                "",

            "Master_Area":
                "",

            "Master_Mine_Type":
                "",

            "Master_Ownership":
                "",

            "Match_Type":
                "Unmatched",

            "Match_Score":
                0.0,

            "Score_Gap":
                0.0,

            "Review_Required":
                "Yes",

            "Mapping_Status":
                "Unmatched"

        })

        continue

    master_row = result["row"]

    score = result["score"]

    gap = result["score_gap"]

    # -----------------------------------------------------
    # Matching decision
    # -----------------------------------------------------

    if score >= 0.90 and gap >= 0.05:

        match_type = "Contextual_Fuzzy"
        review = "Yes"
        status = "Matched_Review"

    elif score >= 0.70:

        match_type = "Possible"
        review = "Yes"
        status = "Matched_Review"

    else:

        match_type = "Unmatched"
        review = "Yes"
        status = "Unmatched"

    if match_type == "Unmatched":

        master_name = ""

        master_company = ""

        master_state = ""

        master_district = ""

        master_coalfield = ""

        master_area = ""

        master_type = ""

        master_ownership = ""

    else:

        master_name = master_row["Mine Name"]

        master_company = master_row["Company Name"]

        master_state = master_row["State"]

        master_district = master_row["District"]

        master_coalfield = master_row["Coalfield"]

        master_area = master_row["Area"]

        master_type = master_row["Mine Type"]

        master_ownership = master_row["Ownership"]

    records.append({

        "Source": "Production",

        "Source_Mine_Name":
            source_name,

        "Source_Company":
            source_company,

        "Source_State":
            source_state,

        "Master_Mine_Name":
            master_name,

        "Master_Company":
            master_company,

        "Master_State":
            master_state,

        "Master_District":
            master_district,

        "Master_Coalfield":
            master_coalfield,

        "Master_Area":
            master_area,

        "Master_Mine_Type":
            master_type,

        "Master_Ownership":
            master_ownership,

        "Match_Type":
            match_type,

        "Match_Score":
            round(score, 4),

        "Score_Gap":
            round(gap, 4),

        "Review_Required":
            review,

        "Mapping_Status":
            status

    })


# ---------------------------------------------------------
# CREATE DATAFRAME
# ---------------------------------------------------------

mapping_df = pd.DataFrame(records)


# ---------------------------------------------------------
# REMOVE EXACT DUPLICATES
# ---------------------------------------------------------

mapping_df = mapping_df.drop_duplicates(
    subset=[
        "Source",
        "Source_Mine_Name"
    ]
)


# ---------------------------------------------------------
# SAVE
# ---------------------------------------------------------

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

mapping_df.to_csv(
    OUTPUT_PATH,
    index=False
)


# ---------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------

print("\n========================================")
print("MINE MAPPING SUMMARY")
print("========================================")

print(
    f"Total mapping records: {len(mapping_df)}"
)

print(
    f"CAAQMS records: "
    f"{(mapping_df['Source'] == 'CAAQMS').sum()}"
)

print(
    f"Production records: "
    f"{(mapping_df['Source'] == 'Production').sum()}"
)

print("\nMatch Types:")

print(
    mapping_df["Match_Type"]
    .value_counts()
)


print("\nReview Required:")

print(
    mapping_df["Review_Required"]
    .value_counts()
)


# ---------------------------------------------------------
# SHOW CAAQMS MAPPING
# ---------------------------------------------------------

print("\n========================================")
print("CAAQMS MAPPING")
print("========================================")

caaqms_result = mapping_df[
    mapping_df["Source"] == "CAAQMS"
][
    [
        "Source_Mine_Name",
        "Master_Mine_Name",
        "Master_Company",
        "Master_State",
        "Master_District",
        "Master_Area",
        "Master_Mine_Type",
        "Match_Type",
        "Match_Score",
        "Review_Required",
        "Mapping_Status"
    ]
]

print(
    caaqms_result.to_string(
        index=False
    )
)


# ---------------------------------------------------------
# SHOW UNMATCHED
# ---------------------------------------------------------

print("\n========================================")
print("UNMATCHED RECORDS")
print("========================================")

unmatched = mapping_df[
    mapping_df["Mapping_Status"]
    == "Unmatched"
]

print(
    f"Unmatched records: {len(unmatched)}"
)

if len(unmatched) > 0:

    print(
        unmatched[
            [
                "Source",
                "Source_Mine_Name",
                "Source_Company",
                "Source_State"
            ]
        ]
        .head(30)
        .to_string(index=False)
    )


# ---------------------------------------------------------
# OUTPUT
# ---------------------------------------------------------

print("\n========================================")
print(
    f"Saved to: {OUTPUT_PATH}"
)
print("========================================")

