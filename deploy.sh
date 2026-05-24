#!/bin/bash

#=============================================================================
# BULA2026 Zeltlagersystem - Automated SSH Deployment
# This script uploads your app to All-Inkl hosting via SSH
#=============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  BULA2026 Zeltlagersystem - SSH Deployment Tool               ║"
echo "║  Automatischer Upload zu All-Inkl über SSH                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

#=============================================================================
# 1. CHECK PREREQUISITES
#=============================================================================

echo -e "\n${YELLOW}[1/5] Checking prerequisites...${NC}"

# Check if rsync is installed
if ! command -v rsync &> /dev/null; then
    echo -e "${RED}✗ rsync not found. Installing...${NC}"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y rsync
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install rsync
    else
        echo -e "${RED}Please install rsync manually${NC}"
        exit 1
    fi
fi

# Check if required directories exist
if [ ! -d "frontend/dist-admin" ]; then
    echo -e "${RED}✗ frontend/dist-admin not found. Run: npm run build:admin${NC}"
    exit 1
fi

if [ ! -d "frontend/dist-registration" ]; then
    echo -e "${RED}✗ frontend/dist-registration not found. Run: npm run build:registration${NC}"
    exit 1
fi

if [ ! -d "backend-php" ]; then
    echo -e "${RED}✗ backend-php not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Alle Voraussetzungen OK${NC}"

#=============================================================================
# 2. GET SSH CREDENTIALS
#=============================================================================

echo -e "\n${YELLOW}[2/5] SSH-Credentials konfigurieren...${NC}"

# Check if .sshconfig exists
if [ -f ".sshconfig" ]; then
    echo -e "${GREEN}✓ .sshconfig gefunden${NC}"
    source .sshconfig
else
    echo -e "${BLUE}SSH-Verbindungsdaten eingeben:${NC}"
    read -p "SSH Host (z.B. k12345.kasserver.com): " SSH_HOST
    read -p "SSH User (z.B. k123456): " SSH_USER
    read -p "SSH Port (Standard: 22): " SSH_PORT
    SSH_PORT=${SSH_PORT:-22}

    read -p "SSH-Schlüssel verwenden? (y/n, Standard: n): " USE_KEY

    if [[ $USE_KEY == "y" ]]; then
        read -p "Pfad zum SSH-Schlüssel (z.B. ~/.ssh/id_rsa): " SSH_KEY
        SSH_KEY=$(eval echo "$SSH_KEY")
        if [ ! -f "$SSH_KEY" ]; then
            echo -e "${RED}✗ SSH-Schlüssel nicht gefunden: $SSH_KEY${NC}"
            exit 1
        fi
    fi

    # Ask if user wants to save credentials
    read -p "Credentials in .sshconfig speichern? (y/n): " SAVE_CREDS
    if [[ $SAVE_CREDS == "y" ]]; then
        cat > .sshconfig << EOF
SSH_HOST="$SSH_HOST"
SSH_USER="$SSH_USER"
SSH_PORT="$SSH_PORT"
SSH_KEY="$SSH_KEY"
EOF
        echo -e "${GREEN}✓ Credentials in .sshconfig gespeichert${NC}"
        echo -e "${YELLOW}⚠️  .sshconfig zu .gitignore hinzufügen!${NC}"
    fi
fi

# Validate credentials
if [ -z "$SSH_HOST" ] || [ -z "$SSH_USER" ]; then
    echo -e "${RED}✗ SSH Host und User erforderlich${NC}"
    exit 1
fi

SSH_PORT=${SSH_PORT:-22}

echo -e "${GREEN}✓ SSH-Verbindung konfiguriert${NC}"

#=============================================================================
# 3. BUILD RSYNC COMMAND
#=============================================================================

echo -e "\n${YELLOW}[3/5] Deployment-Konfiguration...${NC}"

# Build SSH command
if [ -n "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY -p $SSH_PORT"
    RSYNC_SSH="ssh -i $SSH_KEY -p $SSH_PORT"
else
    SSH_CMD="ssh -p $SSH_PORT"
    RSYNC_SSH="ssh -p $SSH_PORT"
fi

# Check SSH connection
echo -e "${BLUE}SSH-Verbindung testen...${NC}"
if ! $SSH_CMD $SSH_USER@$SSH_HOST "echo 'OK'" &> /dev/null; then
    echo -e "${RED}✗ SSH-Verbindung fehlgeschlagen${NC}"
    echo -e "${YELLOW}Tipps:${NC}"
    echo "- Host, User, Port korrekt?"
    echo "- SSH-Schlüssel vorhanden und Permissions OK?"
    exit 1
fi

echo -e "${GREEN}✓ SSH-Verbindung OK${NC}"

# Ask what to deploy
echo -e "\n${BLUE}Was soll deployed werden?${NC}"
echo "1) lagerbank.info (Admin + Backend)"
echo "2) anmeldung.lagerbank.info (Registration)"
echo "3) Alles (komplettes System)"
read -p "Wahl (1-3): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        DEPLOY_ADMIN=true
        DEPLOY_REGISTRATION=false
        DEPLOY_BACKEND=true
        ;;
    2)
        DEPLOY_ADMIN=false
        DEPLOY_REGISTRATION=true
        DEPLOY_BACKEND=false
        ;;
    3)
        DEPLOY_ADMIN=true
        DEPLOY_REGISTRATION=true
        DEPLOY_BACKEND=true
        ;;
    *)
        echo -e "${RED}Ungültige Wahl${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}✓ Deployment-Optionen gesetzt${NC}"

#=============================================================================
# 4. EXECUTE DEPLOYMENT
#=============================================================================

echo -e "\n${YELLOW}[4/5] Starte Deployment...${NC}\n"

DEPLOY_SUCCESS=true

# Deploy Backend
if [ "$DEPLOY_BACKEND" = true ]; then
    echo -e "${BLUE}📤 Backend wird hochgeladen...${NC}"
    rsync -avz --delete \
        -e "$RSYNC_SSH" \
        backend-php/ \
        $SSH_USER@$SSH_HOST:/www/lagerbank.info/backend-php/ || DEPLOY_SUCCESS=false

    # Upload .htaccess
    rsync -avz \
        -e "$RSYNC_SSH" \
        .htaccess \
        $SSH_USER@$SSH_HOST:/www/lagerbank.info/.htaccess || DEPLOY_SUCCESS=false

    # Create uploads directory if not exists
    $SSH_CMD $SSH_USER@$SSH_HOST "mkdir -p /www/lagerbank.info/uploads/photos" 2>/dev/null || true
    $SSH_CMD $SSH_USER@$SSH_HOST "mkdir -p /www/lagerbank.info/logs" 2>/dev/null || true

    echo -e "${GREEN}✓ Backend uploaded${NC}"
fi

# Deploy Admin App
if [ "$DEPLOY_ADMIN" = true ]; then
    echo -e "${BLUE}📤 Admin App wird hochgeladen...${NC}"
    rsync -avz --delete \
        -e "$RSYNC_SSH" \
        frontend/dist-admin/ \
        $SSH_USER@$SSH_HOST:/www/lagerbank.info/ || DEPLOY_SUCCESS=false
    echo -e "${GREEN}✓ Admin App uploaded${NC}"
fi

# Deploy Registration App
if [ "$DEPLOY_REGISTRATION" = true ]; then
    echo -e "${BLUE}📤 Registration App wird hochgeladen...${NC}"
    rsync -avz --delete \
        -e "$RSYNC_SSH" \
        frontend/dist-registration/ \
        $SSH_USER@$SSH_HOST:/www/anmeldung.lagerbank.info/ || DEPLOY_SUCCESS=false

    # Upload .htaccess for registration domain
    rsync -avz \
        -e "$RSYNC_SSH" \
        .htaccess \
        $SSH_USER@$SSH_HOST:/www/anmeldung.lagerbank.info/.htaccess || DEPLOY_SUCCESS=false

    echo -e "${GREEN}✓ Registration App uploaded${NC}"
fi

#=============================================================================
# 5. POST-DEPLOYMENT CHECKS
#=============================================================================

echo -e "\n${YELLOW}[5/5] Post-Deployment Checks...${NC}"

if [ "$DEPLOY_BACKEND" = true ]; then
    echo -e "${BLUE}Checking backend config...${NC}"
    $SSH_CMD $SSH_USER@$SSH_HOST "test -f /www/lagerbank.info/backend-php/config/config.php && echo '✓ config.php found' || echo '✗ config.php missing'" || true
fi

#=============================================================================
# FINAL RESULT
#=============================================================================

if [ "$DEPLOY_SUCCESS" = true ]; then
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════════╗"
    echo "║                  ✓ DEPLOYMENT ERFOLGREICH!                      ║"
    echo "╚════════════════════════════════════════════════════════════════╝${NC}"

    echo -e "\n${BLUE}Nächste Schritte:${NC}"

    if [ "$DEPLOY_BACKEND" = true ]; then
        echo -e "\n${YELLOW}1. Backend konfigurieren:${NC}"
        echo "   Bearbeite: backend-php/config/config.php"
        echo "   Setze deine Datenbank-Credentials:"
        echo ""
        echo "   define('DB_HOST', 'localhost');"
        echo "   define('DB_USER', 'k123456_bula');      ← DEIN DB-USER"
        echo "   define('DB_PASS', 'deinPasswort');      ← DEIN DB-PASSWORT"
        echo "   define('DB_NAME', 'bula2026_camp');     ← DEIN DB-NAME"
    fi

    if [ "$DEPLOY_ADMIN" = true ]; then
        echo -e "\n${YELLOW}2. Admin-App testen:${NC}"
        echo "   https://lagerbank.info"
        echo "   Login: admin@lagerbank.info / admin123"
    fi

    if [ "$DEPLOY_REGISTRATION" = true ]; then
        echo -e "\n${YELLOW}3. Registration-App testen:${NC}"
        echo "   https://anmeldung.lagerbank.info"
    fi

    echo -e "\n${RED}⚠️  WICHTIG:${NC}"
    echo "   - Standardpasswort nach dem ersten Login ändern!"
    echo "   - MySQL Datenbank und schema.sql müssen bereits erstellt sein"
    echo "   - .htaccess braucht mod_rewrite (meist aktiviert)"

else
    echo -e "\n${RED}✗ Deployment fehlgeschlagen${NC}"
    echo "Überprüfe:"
    echo "- SSH-Verbindung OK?"
    echo "- Pfade auf dem Server korrekt?"
    echo "- Genug Speicherplatz?"
    exit 1
fi
