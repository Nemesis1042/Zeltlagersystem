#!/bin/bash

# Deploy Backend to IONOS Server
# Run this from your local machine with SSH access

REMOTE="ssh-w01e9b9c@dd55430"
REMOTE_PATH="/www/htdocs/w01e9b9c/lagerbank.info"
LOCAL_PATH="./backend-php"

echo "🚀 Deploying Backend PHP files to IONOS..."

# Create upload directory structure if needed
ssh $REMOTE "mkdir -p $REMOTE_PATH/backend-php/config $REMOTE_PATH/backend-php/src/{api,repositories,services} $REMOTE_PATH/backend-php/public"

# Upload configuration
echo "📝 Uploading config files..."
scp $LOCAL_PATH/config/config.php $REMOTE:$REMOTE_PATH/backend-php/config/
scp $LOCAL_PATH/config/Database.php $REMOTE:$REMOTE_PATH/backend-php/config/
scp $LOCAL_PATH/schema.sql $REMOTE:$REMOTE_PATH/backend-php/

# Upload repositories
echo "📚 Uploading repositories..."
scp $LOCAL_PATH/src/repositories/*.php $REMOTE:$REMOTE_PATH/backend-php/src/repositories/

# Upload services
echo "⚙️  Uploading services..."
scp $LOCAL_PATH/src/services/*.php $REMOTE:$REMOTE_PATH/backend-php/src/services/

# Upload router
echo "🛣️  Uploading router..."
scp $LOCAL_PATH/src/Router.php $REMOTE:$REMOTE_PATH/backend-php/src/

# Upload API endpoints
echo "🔌 Uploading API endpoints..."
scp $LOCAL_PATH/src/api/*.php $REMOTE:$REMOTE_PATH/backend-php/src/api/

# Upload public files
echo "📄 Uploading public files..."
scp $LOCAL_PATH/public/index.php $REMOTE:$REMOTE_PATH/backend-php/public/
scp $LOCAL_PATH/public/.htaccess $REMOTE:$REMOTE_PATH/backend-php/public/

# Fix permissions
echo "🔐 Setting permissions..."
ssh $REMOTE "chmod -R 755 $REMOTE_PATH/backend-php/src/ $REMOTE_PATH/backend-php/config/"
ssh $REMOTE "chmod 644 $REMOTE_PATH/backend-php/public/index.php $REMOTE_PATH/backend-php/public/.htaccess"

echo "✅ Backend deployment complete!"
echo "🔗 Test: curl https://lagerbank.info/api/health"
