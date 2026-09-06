import pandas as pd
from pathlib import Path


# Location of raw datasets
DATA_DIR = Path("data/raw")


def inspect_dataset(file_path):
    print("\n" + "=" * 80)
    print(f"DATASET: {file_path.name}")
    print("=" * 80)

    # Read CSV
    try:
        df = pd.read_csv(file_path, encoding="latin1")
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # 1. Shape
    print("\n1. SHAPE")
    print(df.shape)

    # 2. Columns
    print("\n2. COLUMNS")
    print(df.columns.tolist())

    # 3. Data types
    print("\n3. DATA TYPES")
    print(df.dtypes)

    # 4. Missing values
    print("\n4. MISSING VALUES")
    print(df.isnull().sum())

    # 5. Duplicate rows
    print("\n5. DUPLICATES")
    print(df.duplicated().sum())

    # 6. Unique values for important categorical columns
    print("\n6. UNIQUE VALUES")

    for column in ["Mine Name", "Company Name", "Area Name", "State", "Company", "Producing Mine"]:
        if column in df.columns:
            print(f"\n{column}:")
            print(f"Unique count: {df[column].nunique()}")
            print(df[column].dropna().unique()[:20])

    # 7. Date range
    print("\n7. DATE/YEAR RANGE")

    for column in ["Creation datetime", "Record time", "Year", "Year-wise"]:
        if column in df.columns:
            print(f"\n{column}:")
            print("Minimum:", df[column].min())
            print("Maximum:", df[column].max())

    # 8. First 5 rows
    print("\n8. SAMPLE DATA")
    print(df.head())


def main():
    csv_files = list(DATA_DIR.glob("*.csv"))

    print(f"Found {len(csv_files)} CSV files.")

    for file_path in csv_files:
        inspect_dataset(file_path)

    print("\n" + "=" * 80)
    print("PHASE 1 DATA INSPECTION COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()