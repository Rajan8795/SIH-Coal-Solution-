import subprocess
import sys


scripts = [
    "mine_master.py",
    "preprocess_data.py",
    "production_preprocessing.py",
    "accident_preprocessing.py",
    "feature_engineering.py",
    "production_feature_engineering.py",
    "accident_feature_engineering.py",
    "mine_context_analysis.py",
    "production_analysis.py",
    "mine_mapping.py",
    "anomaly_detection.py",
    "evidence_engine.py",
    "confidence_engine.py",
    "risk_engine.py",
    "explainability.py",
    "inspection_priority.py",
    "ai_recommendation_engine.py",
]


def main():
    print("=" * 70)
    print("SMART COAL GOVERNANCE - ML PIPELINE")
    print("=" * 70)

    for script in scripts:
        print("\n" + "-" * 70)
        print(f"RUNNING: {script}")
        print("-" * 70)

        result = subprocess.run(
            [sys.executable, f"src/ml/{script}"]
        )

        if result.returncode != 0:
            print(f"\nPIPELINE FAILED: {script}")
            sys.exit(result.returncode)

        print(f"\nCOMPLETED: {script}")

    print("\n" + "=" * 70)
    print("FULL ML PIPELINE COMPLETED SUCCESSFULLY")
    print("=" * 70)


if __name__ == "__main__":
    main()
    