Upload numerical data → generate new predictions → store
predictions → update clients.

# Training

- Upload training and testing data to S3 [s3://cst3130-cw2-machine-learning]
- Use DeepAR algorithm and train model.

#### Used two data sets for training

#### Train - Data with approximately 30% of the values removed [synthetic_data_test.json]

#### Test: Complete set of data [synthetic_data.json]

#### Results: [s3://cst3130-cw2-machine-learning/results]

# Prediction

- Deployed model to endpoint.
  Name: SyntheticEndpoint
  <br>
  URL:
  https://runtime.sagemaker.us-east-1.amazonaws.com/endpoints/SyntheticEndpoint/invocations
- Query endpoint for predictions on the frontend
