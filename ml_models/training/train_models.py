import os
import json
import numpy as np
import pandas as pd
import joblib
import shap
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score
import matplotlib.pyplot as plt

# Path configurations
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'serving', 'models')
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

def ensure_dirs():
    """Ensure necessary directories exist."""
    os.makedirs(MODEL_PATH, exist_ok=True)
    os.makedirs(DATA_PATH, exist_ok=True)
    
    # Create subdirectories for each risk model
    for risk_type in ['deterioration', 'readmission', 'sepsis']:
        os.makedirs(os.path.join(MODEL_PATH, risk_type), exist_ok=True)

def generate_synthetic_data(risk_type):
    """
    Generate synthetic training data for model development.
    
    Args:
        risk_type: Type of risk model to generate data for
    
    Returns:
        pandas DataFrame of synthetic data
    """
    np.random.seed(42)
    num_samples = 10000
    
    if risk_type == 'deterioration':
        # Define features for deterioration model
        features = [
            'heart_rate', 'systolic_bp', 'diastolic_bp', 'temperature', 
            'respiration_rate', 'o2_saturation', 'age', 'comorbidity_count',
            'wbc', 'lactate', 'has_infection', 'gender_male', 'gender_female'
        ]
        
        # Generate data with realistic distributions
        data = {
            'heart_rate': np.random.normal(80, 15, num_samples),
            'systolic_bp': np.random.normal(120, 20, num_samples),
            'diastolic_bp': np.random.normal(80, 10, num_samples),
            'temperature': np.random.normal(37.0, 0.7, num_samples),
            'respiration_rate': np.random.normal(16, 3, num_samples),
            'o2_saturation': np.random.normal(97, 3, num_samples),
            'age': np.random.normal(60, 15, num_samples),
            'comorbidity_count': np.random.poisson(2, num_samples),
            'wbc': np.random.normal(8, 3, num_samples),
            'lactate': np.random.exponential(1.5, num_samples),
            'has_infection': np.random.binomial(1, 0.3, num_samples),
            'gender_male': np.random.binomial(1, 0.5, num_samples)
        }
        
        # Create complementary feature
        data['gender_female'] = 1 - data['gender_male']
        
        # Create outcome with medical logic
        # Higher risk with:
        #  - Abnormal vitals (high/low heart rate, blood pressure, etc.)
        #  - Advanced age
        #  - More comorbidities
        #  - Infection and high WBC
        
        risk_score = (
            0.01 * np.abs(data['heart_rate'] - 70) + 
            0.005 * np.abs(data['systolic_bp'] - 120) +
            0.01 * np.abs(data['temperature'] - 37.0) +
            0.05 * np.abs(data['respiration_rate'] - 16) +
            0.1 * np.maximum(0, 95 - data['o2_saturation']) +
            0.01 * np.maximum(0, data['age'] - 50) +
            0.1 * data['comorbidity_count'] +
            0.05 * np.maximum(0, data['wbc'] - 10) +
            0.2 * data['lactate'] +
            0.3 * data['has_infection']
        )
        
        # Normalize to 0-1 range
        risk_score = (risk_score - np.min(risk_score)) / (np.max(risk_score) - np.min(risk_score))
        
        # Add noise
        risk_score = risk_score + np.random.normal(0, 0.05, num_samples)
        risk_score = np.clip(risk_score, 0, 1)
        
        # Binary outcome with threshold
        data['deterioration'] = (risk_score > 0.5).astype(int)
        
    elif risk_type == 'readmission':
        # Define features for readmission model
        features = [
            'age', 'length_of_stay', 'comorbidity_count', 'previous_admission_count',
            'discharge_disposition', 'insurance_type', 'medication_count',
            'follow_up_scheduled', 'lives_alone', 'gender_male', 'gender_female'
        ]
        
        # Generate data
        data = {
            'age': np.random.normal(65, 12, num_samples),
            'length_of_stay': np.random.exponential(4, num_samples) + 1,
            'comorbidity_count': np.random.poisson(2, num_samples),
            'previous_admission_count': np.random.poisson(1, num_samples),
            'discharge_disposition': np.random.choice([0, 1, 2], num_samples, p=[0.7, 0.2, 0.1]),  # 0=home, 1=SNF, 2=home health
            'insurance_type': np.random.choice([0, 1, 2], num_samples, p=[0.6, 0.3, 0.1]),  # 0=private, 1=medicare, 2=medicaid
            'medication_count': np.random.poisson(5, num_samples),
            'follow_up_scheduled': np.random.binomial(1, 0.8, num_samples),
            'lives_alone': np.random.binomial(1, 0.3, num_samples),
            'gender_male': np.random.binomial(1, 0.5, num_samples)
        }
        
        # Create complementary feature
        data['gender_female'] = 1 - data['gender_male']
        
        # Create outcome with medical logic
        risk_score = (
            0.01 * np.maximum(0, data['age'] - 65) + 
            0.05 * np.maximum(0, 3 - data['length_of_stay']) +  # Shorter stays can indicate incomplete treatment
            0.15 * data['comorbidity_count'] +
            0.2 * data['previous_admission_count'] +
            0.1 * data['discharge_disposition'] +
            0.05 * data['insurance_type'] +
            0.03 * data['medication_count'] +
            0.2 * (1 - data['follow_up_scheduled']) +
            0.1 * data['lives_alone']
        )
        
        # Normalize to 0-1 range
        risk_score = (risk_score - np.min(risk_score)) / (np.max(risk_score) - np.min(risk_score))
        
        # Add noise
        risk_score = risk_score + np.random.normal(0, 0.05, num_samples)
        risk_score = np.clip(risk_score, 0, 1)
        
        # Binary outcome with threshold
        data['readmission'] = (risk_score > 0.5).astype(int)
        
    elif risk_type == 'sepsis':
        # Define features for sepsis model
        features = [
            'heart_rate', 'temperature', 'respiration_rate', 'wbc', 
            'systolic_bp', 'lactate', 'age', 'has_infection',
            'immunocompromised', 'recent_surgery', 'gender_male', 'gender_female'
        ]
        
        # Generate data
        data = {
            'heart_rate': np.random.normal(85, 20, num_samples),
            'temperature': np.random.normal(37.5, 1.0, num_samples),
            'respiration_rate': np.random.normal(18, 5, num_samples),
            'wbc': np.random.normal(10, 5, num_samples),
            'systolic_bp': np.random.normal(115, 25, num_samples),
            'lactate': np.random.exponential(1.2, num_samples) + 0.8,
            'age': np.random.normal(60, 15, num_samples),
            'has_infection': np.random.binomial(1, 0.4, num_samples),
            'immunocompromised': np.random.binomial(1, 0.1, num_samples),
            'recent_surgery': np.random.binomial(1, 0.2, num_samples),
            'gender_male': np.random.binomial(1, 0.5, num_samples)
        }
        
        # Create complementary feature
        data['gender_female'] = 1 - data['gender_male']
        
        # Create outcome with medical logic
        risk_score = (
            0.01 * np.maximum(0, data['heart_rate'] - 90) +  # Tachycardia
            0.02 * np.abs(data['temperature'] - 37.0) +
            0.02 * np.maximum(0, data['respiration_rate'] - 20) +
            0.01 * np.maximum(0, data['wbc'] - 12) +
            0.01 * np.maximum(0, 90 - data['systolic_bp']) +  # Hypotension
            0.2 * data['lactate'] +
            0.005 * np.maximum(0, data['age'] - 65) +
            0.3 * data['has_infection'] +
            0.1 * data['immunocompromised'] +
            0.05 * data['recent_surgery']
        )
        
        # Normalize to 0-1 range
        risk_score = (risk_score - np.min(risk_score)) / (np.max(risk_score) - np.min(risk_score))
        
        # Add noise
        risk_score = risk_score + np.random.normal(0, 0.05, num_samples)
        risk_score = np.clip(risk_score, 0, 1)
        
        # Binary outcome with threshold
        data['sepsis'] = (risk_score > 0.5).astype(int)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Save features list
    with open(os.path.join(MODEL_PATH, risk_type, 'features.json'), 'w') as f:
        json.dump(features, f)
    
    # Save synthetic data
    df.to_csv(os.path.join(DATA_PATH, f'{risk_type}_data.csv'), index=False)
    
    return df, features

def train_risk_model(risk_type):
    """
    Train and evaluate a risk prediction model.
    
    Args:
        risk_type: Type of risk model to train
    """
    # Generate or load data
    try:
        df = pd.read_csv(os.path.join(DATA_PATH, f'{risk_type}_data.csv'))
        with open(os.path.join(MODEL_PATH, risk_type, 'features.json'), 'r') as f:
            features = json.load(f)
        print(f"Loaded existing data for {risk_type} model")
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Generating synthetic data for {risk_type} model")
        df, features = generate_synthetic_data(risk_type)
    
    # Prepare data
    X = df[features]
    y = df[risk_type]  # Each dataset has the outcome named after the risk type
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train XGBoost model
    model = xgb.XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        objective='binary:logistic',
        eval_metric='logloss',
        random_state=42
    )
    
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], early_stopping_rounds=10, verbose=False)
    
    # Evaluate model
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba > 0.5).astype(int)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_pred_proba)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    
    print(f"\n{risk_type.capitalize()} Risk Model Performance:")
    print(f"  Accuracy:  {accuracy:.4f}")
    print(f"  AUC:       {auc:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall:    {recall:.4f}")
    
    # Create SHAP explainer
    explainer = shap.TreeExplainer(model)
    
    # Save model artifacts
    model_file = os.path.join(MODEL_PATH, risk_type, 'model.joblib')
    explainer_file = os.path.join(MODEL_PATH, risk_type, 'explainer.joblib')
    
    joblib.dump(model, model_file)
    joblib.dump(explainer, explainer_file)
    
    print(f"Model and explainer saved to {os.path.join(MODEL_PATH, risk_type)}")
    
    # Visualize feature importance
    plt.figure(figsize=(10, 6))
    xgb.plot_importance(model, max_num_features=10)
    plt.title(f"Feature Importance - {risk_type.capitalize()} Risk Model")
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_PATH, risk_type, 'feature_importance.png'), dpi=300)
    
    # Calculate and plot SHAP values for a subset of test data
    shap_values = explainer.shap_values(X_test.iloc[:100])
    
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_test.iloc[:100], plot_type="bar", show=False)
    plt.title(f"SHAP Feature Importance - {risk_type.capitalize()} Risk Model")
    plt.tight_layout()
    plt.savefig(os.path.join(MODEL_PATH, risk_type, 'shap_importance.png'), dpi=300)
    
    # Example prediction on first 5 test samples
    sample_indices = range(5)
    sample_X = X_test.iloc[sample_indices]
    sample_y = y_test.iloc[sample_indices]
    sample_preds = model.predict_proba(sample_X)[:, 1]
    
    print("\nSample Predictions:")
    for i, (idx, pred, actual) in enumerate(zip(sample_indices, sample_preds, sample_y)):
        print(f"  Sample {i+1}: Predicted Risk = {pred:.4f}, Actual = {actual}")
    
    return model, explainer

if __name__ == "__main__":
    # Set up directories
    ensure_dirs()
    
    # Train all risk models
    for risk_type in ['deterioration', 'readmission', 'sepsis']:
        print(f"\n=== Training {risk_type} risk model ===")
        train_risk_model(risk_type)
