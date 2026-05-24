#!/bin/bash

#=============================================================================
# BULA2026 - IONOS SCP Deploy
# Einfaches Deployment für IONOS mit scp
#=============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════╗"
echo "║  BULA2026 → IONOS Deploy (scp)          ║"
echo "╚═══════════════════════════════════════════╝${NC}"

#=============================================================================
# KONFIGURATION
#=============================================================================

echo -e "\n${YELLOW}IONOS SSH Details:${NC}"
read -p "SSH Alias (z.B. ionos): " SSH_ALIAS
read -p "IONOS Web-Root Code (z.B. w01e9b9c): " WEB_CODE

IONOS_HOST="${SSH_ALIAS}:/www/htdocs/${WEB_CODE}"

# Test connection
echo -e "\n${BLUE}Teste Verbindung...${NC}"
if ! scp -q -o ConnectTimeout=5 /dev/null $IONOS_HOST/ 2>/dev/null; then
    echo -e "${RED}✗ Verbindung fehlgeschlagen${NC}"
    echo "Prüfe: SSH Alias korrekt? Web-Root Code korrekt?"
    exit 1
fi
echo -e "${GREEN}✓ Verbindung OK${NC}"

#=============================================================================
# BUILD CHECK
#=============================================================================

if [ ! -d "frontend/dist-admin" ] || [ ! -d "frontend/dist-registration" ]; then
    echo -e "${RED}✗ Apps nicht gebaut!${NC}"
    echo "Starten: npm run build:admin && npm run build:registration"
    exit 1
fi

#=============================================================================
# DEPLOYMENT WAHL
#=============================================================================

echo -e "\n${BLUE}Was deployen?${NC}"
echo "1) Admin + Backend (lagerbank.info)"
echo "2) Registration (anmeldung.lagerbank.info)"
echo "3) Beides"
read -p "Wahl (1-3): " CHOICE

#=============================================================================
# UPLOAD
#=============================================================================

echo -e "\n${YELLOW}Starte Upload...${NC}\n"

case $CHOICE in
    1|3)
        echo -e "${BLUE}📤 Backend + Admin${NC}"
        
        # Backend hochladen
        scp -r backend-php/src $IONOS_HOST/lagerbank.info/backend-php/
        scp -r backend-php/config $IONOS_HOST/lagerbank.info/backend-php/
        scp backend-php/public/index.php $IONOS_HOST/lagerbank.info/backend-php/public/
        
        # Admin-App hochladen
        scp -r frontend/dist-admin/assets $IONOS_HOST/lagerbank.info/
        scp frontend/dist-admin/index.html $IONOS_HOST/lagerbank.info/
        
        # .htaccess hochladen
        scp .htaccess $IONOS_HOST/lagerbank.info/
        
        echo -e "${GREEN}✓ Backend + Admin OK${NC}"
        ;;
esac

case $CHOICE in
    2|3)
        echo -e "${BLUE}📤 Registration${NC}"
        
        # Registration-App hochladen
        scp -r frontend/dist-registration/assets $IONOS_HOST/anmeldung.lagerbank.info/
        scp frontend/dist-registration/registration.html $IONOS_HOST/anmeldung.lagerbank.info/index.html

        # .htaccess hochladen
        scp .htaccess $IONOS_HOST/anmeldung.lagerbank.info/
        
        echo -e "${GREEN}✓ Registration OK${NC}"
        ;;
esac

#=============================================================================
# FERTIG
#=============================================================================

echo -e "\n${GREEN}✓ DEPLOYMENT FERTIG!${NC}"
echo -e "\n${YELLOW}Noch zu tun:${NC}"
echo "1. config.php mit DB-Daten füllen:"
echo "   scp backend-php/config/config.php $IONOS_HOST/lagerbank.info/backend-php/config/"
echo ""
echo "2. Datenbank erstellen und schema.sql importieren"
echo ""
echo "3. Testen:"
echo "   https://lagerbank.info (Admin)"
echo "   https://anmeldung.lagerbank.info (Registration)"
echo ""
echo "   Login: admin@lagerbank.info / admin123"
