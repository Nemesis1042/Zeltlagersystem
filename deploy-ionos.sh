#!/bin/bash

#=============================================================================
# BULA2026 - IONOS SSH Deploy
# Vereinfachtes Deployment für IONOS Hosting
#=============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════╗"
echo "║  BULA2026 → IONOS Deploy                 ║"
echo "╚═══════════════════════════════════════════╝${NC}"

#=============================================================================
# KONFIGURATION
#=============================================================================

echo -e "\n${YELLOW}SSH Details eingeben:${NC}"
read -p "SSH Host (z.B. ssh.ionos.com): " SSH_HOST
read -p "IONOS Username: " SSH_USER
read -p "Domain (z.B. lagerbank.info): " DOMAIN
read -p "Web Root Pfad (z.B. /kunden/homepages/xx/): " WEB_ROOT

# Trim trailing slash
WEB_ROOT="${WEB_ROOT%/}"

# Test SSH connection
echo -e "\n${BLUE}Teste SSH-Verbindung...${NC}"
if ! ssh -o ConnectTimeout=5 $SSH_USER@$SSH_HOST "echo OK" &> /dev/null; then
    echo -e "${RED}✗ SSH-Verbindung fehlgeschlagen${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH OK${NC}"

#=============================================================================
# DEPLOYMENT WAHL
#=============================================================================

echo -e "\n${BLUE}Was deployen?${NC}"
echo "1) Admin + Backend (lagerbank.info)"
echo "2) Registration (anmeldung.lagerbank.info)"
echo "3) Beides"
read -p "Wahl (1-3): " CHOICE

#=============================================================================
# BUILD CHECK
#=============================================================================

if [ ! -d "frontend/dist-admin" ] || [ ! -d "frontend/dist-registration" ]; then
    echo -e "${RED}✗ Apps nicht gebaut!${NC}"
    echo "Starten: npm run build:admin && npm run build:registration"
    exit 1
fi

#=============================================================================
# UPLOAD
#=============================================================================

echo -e "\n${YELLOW}Starte Upload...${NC}\n"

case $CHOICE in
    1|3)
        echo -e "${BLUE}📤 Admin + Backend${NC}"
        rsync -avz --delete -e "ssh" \
            backend-php/ \
            $SSH_USER@$SSH_HOST:$WEB_ROOT/lagerbank.info/backend-php/
        
        rsync -avz -e "ssh" \
            frontend/dist-admin/ \
            $SSH_USER@$SSH_HOST:$WEB_ROOT/lagerbank.info/
        
        rsync -avz -e "ssh" \
            .htaccess \
            $SSH_USER@$SSH_HOST:$WEB_ROOT/lagerbank.info/.htaccess
        
        ssh $SSH_USER@$SSH_HOST "mkdir -p $WEB_ROOT/lagerbank.info/uploads/photos"
        echo -e "${GREEN}✓ Admin + Backend OK${NC}"
        ;;
esac

case $CHOICE in
    2|3)
        echo -e "${BLUE}📤 Registration${NC}"
        rsync -avz --delete -e "ssh" \
            frontend/dist-registration/ \
            $SSH_USER@$SSH_HOST:$WEB_ROOT/anmeldung.lagerbank.info/
        
        rsync -avz -e "ssh" \
            .htaccess \
            $SSH_USER@$SSH_HOST:$WEB_ROOT/anmeldung.lagerbank.info/.htaccess
        
        echo -e "${GREEN}✓ Registration OK${NC}"
        ;;
esac

#=============================================================================
# FERTIG
#=============================================================================

echo -e "\n${GREEN}✓ DEPLOYMENT FERTIG!${NC}"
echo -e "\n${YELLOW}Noch zu tun:${NC}"
echo "1. backend-php/config/config.php mit DB-Daten füllen"
echo "2. Datenbank erstellen und schema.sql importieren"
echo "3. Testen: https://lagerbank.info"
echo "   Login: admin@lagerbank.info / admin123"
