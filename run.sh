#!/bin/bash

echo "Building Image..."
docker-compose build

echo "Starting container..."
docker-compose up -d

echo "Waiting for startup..."
sleep 10

echo "Running an example curl to check app is working"
YAML_CONTENT=$(cat <<'EOF'
client:
  business_name: 'Test Client'
  industry: 'Tech'
  city: 'San Francisco'
  zip: '94105'
  goal: 'online_sales'
  monthly_budget_usd: 10000
constraints:
  channels:
    - 'google_search'
    - 'facebook_instagram'
recommendations:
  billboards:
    placement_ideas: []
    est_impressions_range: ""
EOF
)

JSON_PAYLOAD=$(jq -n --arg yaml "$YAML_CONTENT" '{"yaml_input": $yaml}')

curl -X POST http://localhost:3000/api/plan -H "Content-Type: application/json" -d "$JSON_PAYLOAD"