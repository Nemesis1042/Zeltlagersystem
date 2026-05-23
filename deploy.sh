#!/bin/bash

# BULA2026 Deployment Script
# Copy all backend and frontend files to IONOS server

REMOTE="ssh-w01e9b9c@dd55430"
REMOTE_PATH="/www/htdocs/w01e9b9c"
LOCAL_PATH="/home/user/Zeltlagersystem"

echo "🚀 Deploying BULA2026 to lagerbank.info..."

# 1. Copy Backend PHP files
echo "📦 Copying backend files..."
scp -r $LOCAL_PATH/backend-php/config/*.php $REMOTE:$REMOTE_PATH/lagerbank.info/backend-php/config/
scp -r $LOCAL_PATH/backend-php/src/*.php $REMOTE:$REMOTE_PATH/lagerbank.info/backend-php/src/
scp -r $LOCAL_PATH/backend-php/src/api/*.php $REMOTE:$REMOTE_PATH/lagerbank.info/backend-php/src/api/
scp -r $LOCAL_PATH/backend-php/src/repositories/*.php $REMOTE:$REMOTE_PATH/lagerbank.info/backend-php/src/repositories/
scp -r $LOCAL_PATH/backend-php/src/services/*.php $REMOTE:$REMOTE_PATH/lagerbank.info/backend-php/src/services/
scp -r $LOCAL_PATH/backend-php/public/.htaccess $REMOTE:$REMOTE_PATH/lagerbank.info/backend-php/public/
scp -r $LOCAL_PATH/backend-php/public/index.php $REMOTE:$REMOTE_PATH/lagerbank.info/backend-php/public/

# 2. Copy .htaccess files
echo "📄 Copying .htaccess configuration..."
scp $LOCAL_PATH/.htaccess $REMOTE:$REMOTE_PATH/lagerbank.info/

# 3. Copy Frontend files (admin dashboard)
echo "📱 Copying frontend files..."
scp -r $LOCAL_PATH/frontend/dist/* $REMOTE:$REMOTE_PATH/lagerbank.info/

# 4. Fix permissions on server
echo "🔐 Fixing permissions..."
ssh $REMOTE "chmod -R 755 $REMOTE_PATH/lagerbank.info/backend-php/src/ $REMOTE_PATH/lagerbank.info/backend-php/config/"
ssh $REMOTE "chmod 644 $REMOTE_PATH/lagerbank.info/backend-php/src/Router.php $REMOTE_PATH/lagerbank.info/backend-php/config/config.php"
ssh $REMOTE "chmod 644 $REMOTE_PATH/lagerbank.info/.htaccess $REMOTE_PATH/lagerbank.info/backend-php/public/.htaccess"

echo "✅ Deployment complete!"
echo "🔗 Test: curl http://lagerbank.info/api/health"
